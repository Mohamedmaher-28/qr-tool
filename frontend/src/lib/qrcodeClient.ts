import QRCode from "qrcode";

export interface QrResult {
  success: boolean;
  png?: string;
  svg?: string;
  error?: string;
}

const OPTIONS = {
  errorCorrectionLevel: "H" as const,
  margin: 2,
  width: 512,
  color: {
    dark: "#0f172a",
    light: "#ffffff",
  },
};

/**
 * Generates a QR code entirely in the browser (no network request).
 * Used as a fallback when the backend API is not reachable (e.g. on a
 * static-only host that serves just the frontend build).
 */
export async function generateQrClientSide(url: string): Promise<QrResult> {
  try {
    const png = await QRCode.toDataURL(url, OPTIONS);
    const svg = await QRCode.toString(url, { ...OPTIONS, type: "svg" });
    return { success: true, png, svg };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to generate QR code.",
    };
  }
}
