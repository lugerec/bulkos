import { Capacitor } from "@capacitor/core";

/**
 * Thin wrapper around @capacitor/barcode-scanner (the official, SPM-compatible
 * scanner) so the rest of the app never imports the plugin directly. Native
 * only; degrades to a "not supported" signal on web/dev so callers can fall
 * back to manual barcode entry. Scans every symbology, so QR and EAN/UPC food
 * barcodes both work.
 */

export type ScanResult =
  | { status: "ok"; barcode: string }
  | { status: "cancelled" }
  | { status: "unsupported" }
  | { status: "error" };

/** Camera scanning is only available in the native iOS/Android shell. */
export function isBarcodeScanSupported(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Open the native camera scanner and resolve with the first code found. The
 * plugin is imported lazily so its (large) web dependency is code-split and
 * only loaded when scanning.
 */
export async function scanBarcode(): Promise<ScanResult> {
  if (!isBarcodeScanSupported()) return { status: "unsupported" };

  let mod: typeof import("@capacitor/barcode-scanner");
  try {
    mod = await import("@capacitor/barcode-scanner");
  } catch {
    return { status: "unsupported" };
  }

  try {
    const { CapacitorBarcodeScanner, CapacitorBarcodeScannerTypeHint } = mod;

    const result = await CapacitorBarcodeScanner.scanBarcode({
      // ALL: scan every symbology — QR codes and EAN/UPC food barcodes alike.
      hint: CapacitorBarcodeScannerTypeHint.ALL,
      scanInstructions: "Point the camera at a barcode or QR code",
    });

    const value = result?.ScanResult?.trim();
    if (!value) return { status: "cancelled" };

    return { status: "ok", barcode: value };
  } catch {
    // The plugin also throws when the user cancels — treat as a quiet cancel.
    return { status: "cancelled" };
  }
}
