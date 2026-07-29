import { Capacitor } from "@capacitor/core";

/**
 * Thin wrapper around @capacitor-mlkit/barcode-scanning so the rest of the
 * app never imports the native plugin directly. Mirrors the guarded style of
 * watchService/healthService: native-only, degrades to a "not supported"
 * signal on web/dev so callers can fall back to manual barcode entry.
 */

export type ScanResult =
  | { status: "ok"; barcode: string }
  | { status: "cancelled" }
  | { status: "denied" }
  | { status: "unsupported" }
  | { status: "error" };

/** Camera scanning is only available in the native iOS/Android shell. */
export function isBarcodeScanSupported(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Open the native camera scanner and resolve with the first barcode found.
 * The plugin is imported dynamically so the web build never pulls it in.
 */
export async function scanBarcode(): Promise<ScanResult> {
  if (!isBarcodeScanSupported()) return { status: "unsupported" };

  try {
    const { BarcodeScanner } = await import(
      "@capacitor-mlkit/barcode-scanning"
    );

    const permission = await BarcodeScanner.requestPermissions();
    if (permission.camera !== "granted" && permission.camera !== "limited") {
      return { status: "denied" };
    }

    const { barcodes } = await BarcodeScanner.scan();
    const value = barcodes[0]?.rawValue?.trim();

    if (!value) return { status: "cancelled" };

    return { status: "ok", barcode: value };
  } catch {
    return { status: "error" };
  }
}
