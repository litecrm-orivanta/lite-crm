import { apiFetch } from "./apiFetch";

export interface CSVPreview {
  headers: string[];
  preview: Record<string, string>[];
  totalRows: number;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export async function previewCSV(csvData: string): Promise<CSVPreview> {
  return apiFetch("/leads/bulk-import/preview", {
    method: "POST",
    body: JSON.stringify({ csvData }),
  });
}

export async function importFromCSV(
  csvData: string,
  columnMapping: Record<string, string>
): Promise<ImportResult> {
  return apiFetch("/leads/bulk-import/csv", {
    method: "POST",
    body: JSON.stringify({ csvData, columnMapping }),
  });
}

export async function importFromGoogleSheets(
  sheetData: any[],
  columnMapping: Record<string, string>
): Promise<ImportResult> {
  return apiFetch("/leads/bulk-import/google-sheets", {
    method: "POST",
    body: JSON.stringify({ sheetData, columnMapping }),
  });
}
