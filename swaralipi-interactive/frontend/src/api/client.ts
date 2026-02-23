import axios from "axios";

// Directly point to the FastAPI backend running on port 8000
// In dev, set VITE_API_URL in .env.development if you need to override it.
const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const client = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

export const getApiBase = () => API_BASE;

export interface AnalyzeResponse {
  success: boolean;
  class_id: number | null;
  class_name: string | null;
  hindi_symbol: string | null;
  confidence: number;
  timestamp?: string;
  message?: string;
}

export interface HistoryScan {
  id: number;
  timestamp: string;
  class_name: string;
  class_id: number;
  confidence: number;
  image_crop_base64: string | null;
  hindi_symbol?: string;
}

export interface HistoryResponse {
  success: boolean;
  scans: HistoryScan[];
}

export async function analyzeCrop(base64Image: string): Promise<AnalyzeResponse> {
  const { data } = await client.post<AnalyzeResponse>("/analyze", {
    image_base64: base64Image,
  });
  return data;
}

export async function getHistory(): Promise<HistoryResponse> {
  const { data } = await client.get<HistoryResponse>("/history");
  return data;
}