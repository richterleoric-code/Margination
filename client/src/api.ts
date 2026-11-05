import type {
  ConnectionCheck,
  IllustrationRequest,
  IllustrationResponse,
  ServiceStatus,
} from "@shared/contract";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function readError(response: Response): Promise<string> {
  const data = (await response.json().catch(() => null)) as { error?: string; message?: string } | null;
  return data?.error || data?.message || "The request could not be completed.";
}

export async function fetchStatus(): Promise<ServiceStatus> {
  const response = await fetch("/api/health");
  if (!response.ok) throw new ApiError(response.status, await readError(response));
  return (await response.json()) as ServiceStatus;
}

export async function checkConnection(): Promise<ConnectionCheck> {
  const response = await fetch("/api/connection/check", { method: "POST" });
  const data = (await response.json().catch(() => null)) as ConnectionCheck | { error?: string } | null;
  if (!response.ok) {
    if (data && "message" in data && data.message) return data as ConnectionCheck;
    throw new ApiError(response.status, (data && "error" in data && data.error) || "The connection check failed.");
  }
  return data as ConnectionCheck;
}

export async function requestIllustration(body: IllustrationRequest): Promise<IllustrationResponse> {
  let response: Response;
  try {
    response = await fetch("/api/illustrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "The illustration service could not be reached. Check that the Margination server is running.");
  }
  if (!response.ok) throw new ApiError(response.status, await readError(response));
  return (await response.json()) as IllustrationResponse;
}

export function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mimeType });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function illustrationFilename(mimeType: string, mode: "live" | "demonstration"): string {
  const extension = mimeType.includes("svg") ? "svg" : mimeType.includes("jpeg") ? "jpg" : "png";
  if (mode === "demonstration") return `margination-demonstration-sample.${extension}`;
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
  return `margination-${stamp}.${extension}`;
}
