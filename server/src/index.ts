import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { APP_VERSION } from "../../shared/contract";
import { demonstrationImage } from "./demo";
import { HttpError } from "./errors";
import { apiKey, checkModelAccess, configuredModel, generateIllustration } from "./gemini";
import { validateIllustrationRequest } from "./validate";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
dotenv.config({ path: path.join(rootDir, ".env") });

const app = express();
const port = Number(process.env.PORT) || 8787;
const clientDist = path.join(rootDir, "client", "dist");

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      const allowed =
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:") ||
        origin.startsWith("chrome-extension://");
      callback(null, allowed);
    },
  }),
);
app.use(express.json({ limit: "1mb" }));

function statusBody() {
  const keyConfigured = apiKey().length > 0;
  return {
    ok: true as const,
    service: "margination" as const,
    version: APP_VERSION,
    keyConfigured,
    mode: keyConfigured ? ("live" as const) : ("demonstration" as const),
    model: configuredModel(),
    message: keyConfigured
      ? "Gemini is configured. Illustrations are requested from the image API."
      : "Demonstration mode is on. Add GEMINI_API_KEY to .env to illustrate passages with Gemini.",
  };
}

app.get("/api/health", (_req, res) => {
  res.json(statusBody());
});

app.post("/api/connection/check", async (_req, res, next) => {
  try {
    if (!apiKey()) {
      res.json({
        ok: false,
        mode: "demonstration",
        model: null,
        message:
          "Demonstration mode is on. No API key was found in the server environment.",
      });
      return;
    }
    const result = await checkModelAccess();
    if (result.ok) {
      res.json({
        ok: true,
        mode: "live",
        model: result.model,
        message: `Connected. Image generation can use ${result.model}.`,
      });
      return;
    }
    res.status(401).json({
      ok: false,
      mode: "live",
      model: configuredModel(),
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/illustrations", async (req, res, next) => {
  try {
    const { text, sourceKind } = validateIllustrationRequest(req.body);
    console.info(`[margination] illustrate source=${sourceKind} chars=${text.length}`);

    if (!apiKey()) {
      const sample = demonstrationImage();
      res.json({
        mode: "demonstration",
        mimeType: sample.mimeType,
        imageBase64: sample.imageBase64,
        passage: text,
        model: null,
        notice: sample.notice,
      });
      return;
    }

    const image = await generateIllustration(text);
    res.json({
      mode: "live",
      mimeType: image.mimeType,
      imageBase64: image.imageBase64,
      passage: text,
      model: image.model,
      notice: null,
    });
  } catch (error) {
    next(error);
  }
});

if (fs.existsSync(path.join(clientDist, "index.html"))) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
} else {
  app.get("/", (_req, res) => {
    res
      .type("html")
      .send(
        "<!doctype html><title>Margination</title><p>The Margination API is running. During development, open <a href=\"http://localhost:5173\">http://localhost:5173</a>.</p>",
      );
  });
}

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message });
    return;
  }
  console.error("[margination]", error);
  res.status(500).json({ error: "Something went wrong inside Margination." });
});

app.listen(port, () => {
  const mode = apiKey() ? "live" : "demonstration";
  console.info(`[margination] http://localhost:${port} (${mode})`);
});
