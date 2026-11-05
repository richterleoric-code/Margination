import type { IllustrationScope, SourceKind } from "../../shared/contract";
import { HttpError } from "./errors";

const MIN_LENGTH = 12;
const MAX_LENGTH = 5000;

export type ValidatedIllustration = {
  text: string;
  scope: IllustrationScope;
  sourceKind: SourceKind;
};

export function validateIllustrationRequest(body: unknown): ValidatedIllustration {
  if (!body || typeof body !== "object") {
    throw new HttpError(400, "The request was empty.");
  }

  const record = body as Record<string, unknown>;
  if (typeof record.text !== "string") {
    throw new HttpError(400, "Add a passage before illustrating.");
  }

  const text = record.text.replace(/\u0000/g, "").trim();
  if (text.length < MIN_LENGTH) {
    throw new HttpError(
      400,
      "Select or paste a slightly longer passage — at least a few words.",
    );
  }
  if (text.length > MAX_LENGTH) {
    throw new HttpError(
      400,
      "That passage is too long. Illustrate a shorter portion, under 5,000 characters.",
    );
  }

  if (record.scope !== "selection" && record.scope !== "passage") {
    throw new HttpError(
      400,
      "Choose whether to illustrate the selection or the whole passage.",
    );
  }

  let sourceKind: SourceKind = "desktop";
  if (record.source !== undefined) {
    if (!record.source || typeof record.source !== "object") {
      throw new HttpError(400, "The source field is not valid.");
    }
    const source = record.source as Record<string, unknown>;
    if (source.kind !== undefined && source.kind !== "desktop" && source.kind !== "extension") {
      throw new HttpError(400, "The source kind is not valid.");
    }
    if (source.kind === "extension") sourceKind = "extension";
  }

  return { text, scope: record.scope, sourceKind };
}
