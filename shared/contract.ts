export const APP_NAME = "Margination";
export const APP_VERSION = "1.0.0";
export const TAGLINE = "See the words. Stay in the story.";

export type IllustrationScope = "selection" | "passage";
export type IllustrationMode = "live" | "demonstration";
export type SourceKind = "desktop" | "extension";

export type IllustrationRequest = {
  text: string;
  scope: IllustrationScope;
  source?: {
    kind: SourceKind;
    url?: string;
    title?: string;
  };
};

export type IllustrationResponse = {
  mode: IllustrationMode;
  mimeType: string;
  imageBase64: string;
  passage: string;
  model: string | null;
  notice: string | null;
};

export type ServiceStatus = {
  ok: true;
  service: "margination";
  version: string;
  keyConfigured: boolean;
  mode: IllustrationMode;
  model: string;
  message: string;
};

export type ConnectionCheck = {
  ok: boolean;
  mode: IllustrationMode;
  model: string | null;
  message: string;
};

export type ApiErrorBody = {
  error: string;
};
