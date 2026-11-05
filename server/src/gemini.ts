import { buildIllustrationPrompt } from "./prompt";
import { HttpError } from "./errors";

const API_ROOTS = [
  "https://generativelanguage.googleapis.com/v1beta",
  "https://generativelanguage.googleapis.com/v1",
];

const DEFAULT_MODELS = [
  "gemini-nano-banana-2.1",
  "gemini-3.1-flash-image",
  "gemini-2.5-flash-image",
];

const REQUEST_TIMEOUT_MS = 120_000;

type GeminiPart = {
  text?: string;
  inlineData?: { mimeType?: string; data?: string };
  inline_data?: { mime_type?: string; mimeType?: string; data?: string };
};

type GeminiResponse = {
  error?: { message?: string; status?: string; code?: number };
  promptFeedback?: { blockReason?: string };
  candidates?: Array<{
    finishReason?: string;
    content?: { parts?: GeminiPart[] };
  }>;
};

export type GeneratedImage = {
  mimeType: string;
  imageBase64: string;
  model: string;
};

export function configuredModel(): string {
  return process.env.GEMINI_IMAGE_MODEL?.trim() || DEFAULT_MODELS[0];
}

export function apiKey(): string {
  return process.env.GEMINI_API_KEY?.trim() ?? "";
}

function modelList(): string[] {
  return [...new Set([configuredModel(), ...DEFAULT_MODELS])];
}

function buildBody(prompt: string, variant: "styled" | "image-only" | "plain"): Record<string, unknown> {
  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  };
  if (variant === "plain") return body;
  const generationConfig: Record<string, unknown> = {
    responseModalities: ["IMAGE"],
  };
  if (variant === "styled") {
    generationConfig.imageConfig = { aspectRatio: "4:3", imageSize: "1K" };
  }
  body.generationConfig = generationConfig;
  return body;
}

function extractImage(payload: GeminiResponse): { mimeType: string; imageBase64: string } | null {
  const parts = payload.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    const inline = part.inlineData ?? part.inline_data;
    if (inline?.data) {
      const mimeType =
        part.inlineData?.mimeType ||
        part.inline_data?.mimeType ||
        part.inline_data?.mime_type ||
        "image/png";
      return { mimeType, imageBase64: inline.data };
    }
  }
  return null;
}

function textFrom(payload: GeminiResponse): string {
  const parts = payload.candidates?.[0]?.content?.parts ?? [];
  return parts
    .map((part) => part.text?.trim() ?? "")
    .filter(Boolean)
    .join(" ");
}

async function postOnce(
  root: string,
  model: string,
  key: string,
  body: Record<string, unknown>,
): Promise<{ status: number; payload: GeminiResponse }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${root}/models/${model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const payload = (await response.json().catch(() => ({}))) as GeminiResponse;
    return { status: response.status, payload };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new HttpError(504, "The image service took too long. You can try again.");
    }
    throw new HttpError(502, "Margination could not reach the Gemini API. Check your connection and try again.");
  } finally {
    clearTimeout(timer);
  }
}

function failureMessage(status: number, payload: GeminiResponse): HttpError {
  const apiMessage = payload.error?.message?.trim();
  if (status === 401 || status === 403) {
    return new HttpError(
      401,
      "The Gemini API key was rejected. Check GEMINI_API_KEY in the .env file.",
    );
  }
  if (status === 429) {
    return new HttpError(
      429,
      "The image service is busy, or the API quota has been reached. Wait a moment, then try again.",
    );
  }
  if (payload.promptFeedback?.blockReason) {
    return new HttpError(
      422,
      "The image service declined this passage. Try a different selection.",
    );
  }
  return new HttpError(
    502,
    apiMessage || "The image service did not return an illustration.",
  );
}

export async function generateIllustration(passage: string): Promise<GeneratedImage> {
  const key = apiKey();
  if (!key) {
    throw new HttpError(401, "No Gemini API key is configured.");
  }

  const prompt = buildIllustrationPrompt(passage);
  const variants: Array<"styled" | "image-only" | "plain"> = ["styled", "image-only", "plain"];
  let lastError = new HttpError(502, "The image service did not return an illustration.");

  for (const model of modelList()) {
    let modelMissing = true;
    for (const root of API_ROOTS) {
      for (const variant of variants) {
        const { status, payload } = await postOnce(root, model, key, buildBody(prompt, variant));
        if (status === 404) {
          lastError = failureMessage(status, payload);
          break;
        }
        modelMissing = false;
        if (status >= 200 && status < 300) {
          const image = extractImage(payload);
          if (image) return { ...image, model };
          const note = textFrom(payload);
          lastError = new HttpError(
            502,
            note || "The image service replied without an illustration. Try again.",
          );
          if (variant !== "plain") continue;
          break;
        }
        lastError = failureMessage(status, payload);
        if (status === 400 && variant !== "plain") continue;
        if (status === 401 || status === 403 || status === 429 || status === 422) {
          throw lastError;
        }
        break;
      }
      if (!modelMissing && (lastError.status === 401 || lastError.status === 429)) {
        throw lastError;
      }
    }
    if (modelMissing) {
      console.info(`[margination] model unavailable: ${model}`);
      continue;
    }
    if (lastError.status !== 404) break;
  }

  throw lastError;
}

export async function checkModelAccess(): Promise<{ ok: true; model: string } | { ok: false; message: string }> {
  const key = apiKey();
  if (!key) {
    return { ok: false, message: "No API key is configured." };
  }

  let lastMessage = "The Gemini API could not be reached.";
  for (const model of modelList()) {
    for (const root of API_ROOTS) {
      try {
        const response = await fetch(`${root}/models/${model}`, {
          headers: { "x-goog-api-key": key },
        });
        if (response.ok) return { ok: true, model };
        const payload = (await response.json().catch(() => ({}))) as GeminiResponse;
        if (response.status === 401 || response.status === 403) {
          return {
            ok: false,
            message: "The Gemini API key was rejected. Check GEMINI_API_KEY in the .env file.",
          };
        }
        lastMessage = payload.error?.message || `The model ${model} is not available to this key.`;
        if (response.status === 404) continue;
      } catch {
        lastMessage = "Margination could not reach the Gemini API.";
      }
    }
  }
  return { ok: false, message: lastMessage };
}
