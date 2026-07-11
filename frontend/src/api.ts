import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export interface GenerateResponse {
  success: boolean;
  qrCode?: string;
  format?: "png" | "svg";
  png?: string;
  svg?: string;
  error?: string;
}

export async function generateQrCode(url: string): Promise<GenerateResponse> {
  const { data } = await axios.post<GenerateResponse>(
    `${API_BASE_URL}/generate`,
    { url },
    {
      headers: { "Content-Type": "application/json" },
      timeout: 15000,
    }
  );
  return data;
}
