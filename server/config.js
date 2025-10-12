import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");

function parseNumber(value, fallback) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function parseList(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

const corsOrigins = parseList(process.env.CORS_ORIGINS);
const allowAllOrigins = corsOrigins.length === 0;
const staticDir = process.env.STATIC_DIR
  ? path.resolve(process.env.STATIC_DIR)
  : path.join(projectRoot, "web");

export const config = {
  port: parseNumber(process.env.PORT, 3000),
  host: process.env.HOST || "0.0.0.0",
  defaultRoom: process.env.DEFAULT_ROOM || "room1",
  cors: {
    origins: allowAllOrigins ? ["*"] : corsOrigins,
    allowCredentials: !allowAllOrigins,
  },
  static: {
    enabled: process.env.SERVE_STATIC === "true",
    dir: staticDir,
    index: process.env.STATIC_INDEX || "team.html",
  },
  judge: {
    baseUrl: (process.env.JUDGE_BASE_URL || "https://ce.judge0.com").replace(/\/$/, ""),
    apiKey: process.env.JUDGE_API_KEY || "",
    timeoutMs: parseNumber(process.env.JUDGE_TIMEOUT_MS, 20000),
  },
};
