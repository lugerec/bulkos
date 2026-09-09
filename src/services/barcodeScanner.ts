import { Capacitor } from "@capacitor/core";
import { t } from "@/i18n";

/**
 * In-app barcode scanner.
 *
 * This deliberately does NOT use @capacitor/barcode-scanner any more. That
 * plugin wraps OSBarcodeLib, which calls AVCaptureVideoOrientation and
 * UIWindowScene.windows — both deprecated — and hard-crashes the whole app
 * the moment the scanner opens on iOS 16 and 17. It only behaves on iOS 18+.
 * (OutSystems/OSBarcodeLib-iOS#42, ionic-team/capacitor-barcode-scanner#118,
 * both still open.)
 *
 * The obvious replacement, @capacitor-mlkit/barcode-scanning, is worse for us:
 * ML Kit has no SPM support, and CocoaPods and SPM cannot be mixed — adopting
 * it would mean migrating the whole iOS project back to CocoaPods, which is in
 * maintenance mode with its Specs repo going read-only at the end of 2026.
 *
 * So we scan in the WebView instead: getUserMedia for the camera (supported in
 * Capacitor's WKWebView since iOS 14.3, and already covered by the
 * NSCameraUsageDescription we ship) and ZXing for decoding. Slightly slower to
 * lock onto a code than a native detector, but it works identically on every
 * iOS version, on Android and in a desktop browser, and there is no native
 * dependency left to crash.
 *
 * The overlay is built with plain DOM rather than React so that scanBarcode()
 * stays a single promise-returning call and callers need no scanner UI state.
 */

export type ScanResult =
  | { status: "ok"; barcode: string }
  | { status: "cancelled" }
  | { status: "unsupported" }
  | { status: "error" };

export function isBarcodeScanSupported(): boolean {
  if (typeof navigator === "undefined") return false;

  return typeof navigator.mediaDevices?.getUserMedia === "function";
}

/** Native shells get the rear camera; desktop browsers take whatever exists. */
function cameraConstraints(): MediaStreamConstraints {
  return {
    video: {
      facingMode: Capacitor.isNativePlatform()
        ? { exact: "environment" }
        : "environment",
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
    audio: false,
  };
}

type Overlay = {
  root: HTMLDivElement;
  video: HTMLVideoElement;
  setStatus: (message: string) => void;
  destroy: () => void;
};

function buildOverlay(onCancel: () => void, cancelLabel: string): Overlay {
  const root = document.createElement("div");
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-label", "Barcode scanner");
  root.style.cssText = [
    "position:fixed",
    "inset:0",
    "z-index:9999",
    "background:#000",
    "display:flex",
    "flex-direction:column",
    "align-items:center",
    "justify-content:center",
  ].join(";");

  const video = document.createElement("video");
  // playsInline is required or iOS takes the stream fullscreen itself.
  video.setAttribute("playsinline", "true");
  video.setAttribute("muted", "true");
  video.muted = true;
  video.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;object-fit:cover";

  // Reticle: a plain framed window so the user knows where to aim.
  const reticle = document.createElement("div");
  reticle.style.cssText = [
    "position:relative",
    "width:78%",
    "max-width:340px",
    "aspect-ratio:1.6",
    "border:2px solid rgba(255,255,255,0.9)",
    "border-radius:16px",
    "box-shadow:0 0 0 9999px rgba(0,0,0,0.45)",
  ].join(";");

  const status = document.createElement("p");
  status.style.cssText = [
    "position:absolute",
    "left:0",
    "right:0",
    "bottom:104px",
    "margin:0",
    "text-align:center",
    "color:#fff",
    "font:600 14px/1.4 -apple-system,BlinkMacSystemFont,'Inter',sans-serif",
    "text-shadow:0 1px 3px rgba(0,0,0,0.8)",
  ].join(";");

  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.style.cssText = [
    "position:absolute",
    "left:50%",
    "transform:translateX(-50%)",
    "bottom:calc(40px + env(safe-area-inset-bottom))",
    "padding:12px 28px",
    "border:0",
    "border-radius:999px",
    "background:#fff",
    "color:#0A0A0B",
    "font:700 15px/1 -apple-system,BlinkMacSystemFont,'Inter',sans-serif",
  ].join(";");
  cancel.textContent = cancelLabel;
  cancel.addEventListener("click", onCancel);

  root.append(video, reticle, status, cancel);
  document.body.appendChild(root);
  // Stop the page behind the overlay from scrolling under it.
  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  return {
    root,
    video,
    setStatus: (message) => {
      status.textContent = message;
    },
    destroy: () => {
      document.body.style.overflow = previousOverflow;
      root.remove();
    },
  };
}

export async function scanBarcode(labels?: {
  instructions?: string;
  cancel?: string;
}): Promise<ScanResult> {
  if (!isBarcodeScanSupported()) return { status: "unsupported" };

  let reader: import("@zxing/browser").BrowserMultiFormatReader;
  try {
    const { BrowserMultiFormatReader } = await import("@zxing/browser");
    reader = new BrowserMultiFormatReader();
  } catch {
    return { status: "unsupported" };
  }

  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia(cameraConstraints());
  } catch {
    // Permission denied, or no rear camera matched the exact constraint.
    return { status: "error" };
  }

  return new Promise<ScanResult>((resolve) => {
    let settled = false;
    let controls: { stop: () => void } | undefined;

    const overlay = buildOverlay(
      () => finish({ status: "cancelled" }),
      labels?.cancel ?? "Cancel"
    );
    overlay.setStatus(labels?.instructions ?? "Point the camera at a barcode");

    function finish(result: ScanResult) {
      if (settled) return;
      settled = true;

      controls?.stop();
      for (const track of stream.getTracks()) track.stop();
      overlay.destroy();
      resolve(result);
    }

    overlay.video.srcObject = stream;
    void overlay.video.play().catch(() => finish({ status: "error" }));

    reader
      .decodeFromVideoElement(overlay.video, (result) => {
        const value = result?.getText().trim();
        if (value) finish({ status: "ok", barcode: value });
      })
      .then((scannerControls) => {
        controls = scannerControls;
        if (settled) scannerControls.stop();
      })
      .catch(() => finish({ status: "error" }));
  });
}
