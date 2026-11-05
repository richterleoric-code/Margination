import type { IllustrationMode } from "@shared/contract";
import { Star } from "./Star";

export type IllustrationResult = {
  passage: string;
  mimeType: string;
  blob: Blob;
  url: string;
  mode: IllustrationMode;
  notice: string | null;
  model: string | null;
  createdAt: string;
  savedId: string | null;
};

type ViewerProps = {
  result: IllustrationResult | null;
  busy: boolean;
  error: string | null;
  onRegenerate: () => void;
  onDownload: () => void;
  onSave: () => void;
};

function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

export function Viewer({ result, busy, error, onRegenerate, onDownload, onSave }: ViewerProps) {
  return (
    <aside className="viewer" aria-label="Illustration">
      <p className="kicker">Illustration</p>
      <div className="frame">
        {result ? (
          <img
            src={result.url}
            alt={
              result.mode === "demonstration"
                ? "Demonstration style sample. This picture was not generated from the passage."
                : "Illustration of the passage"
            }
          />
        ) : (
          <div className="empty-art">
            <Star size={48} />
            <p>The illustration will sit here, beside the passage — not instead of it.</p>
          </div>
        )}
        {busy && (
          <div className="loading-veil" role="status">
            <Star className="star-float" size={42} />
            <span>Illustrating…</span>
          </div>
        )}
      </div>
      {result?.mode === "demonstration" && result.notice && <p className="notice">{result.notice}</p>}
      {error && (
        <p className="error-inline" role="alert">
          {error}
        </p>
      )}
      {result && (
        <>
          <blockquote className="quote">{result.passage}</blockquote>
          <p className="meta">
            {result.mode === "demonstration" ? "Demonstration sample" : "Illustrated from this passage"}
            {" · "}
            {formatWhen(result.createdAt)}
            {result.model ? ` · ${result.model}` : ""}
          </p>
          <div className="viewer-actions">
            <button className="secondary" type="button" onClick={onRegenerate} disabled={busy}>
              Regenerate
            </button>
            <button className="secondary" type="button" onClick={onDownload}>
              Download
            </button>
            <button className="primary" type="button" onClick={onSave} disabled={busy || result.savedId !== null}>
              {result.savedId ? "Saved" : "Save to library"}
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
