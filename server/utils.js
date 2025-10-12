import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROBLEMS_DIR = path.join(__dirname, "problems");
const problemCache = new Map();

export function normalize(value) {
  return (value ?? "").replace(/\r/g, "").trimEnd();
}

export function resolveRoomId(roomId) {
  return (roomId ?? config.defaultRoom).toString().trim() || config.defaultRoom;
}

export function sanitizeUsername(username, fallback = "Anonymous") {
  return (username ?? fallback).toString().trim() || fallback;
}

function findProblemFile(pid) {
  if (!pid) throw new Error("problemId is required");
  const directPath = path.join(PROBLEMS_DIR, `${pid}.json`);
  if (fs.existsSync(directPath)) return directPath;

  const lower = pid.toLowerCase();
  const candidates = fs
    .readdirSync(PROBLEMS_DIR)
    .filter((file) => file.toLowerCase().startsWith(`${lower}.`) && file.endsWith(".json"));

  if (candidates.length === 0) {
    throw new Error(`Problem not found: ${pid}`);
  }
  return path.join(PROBLEMS_DIR, candidates[0]);
}

export function loadProblem(pid) {
  const file = findProblemFile(pid);
  const stat = fs.statSync(file);
  const cached = problemCache.get(file);

  if (cached && cached.mtimeMs === stat.mtimeMs) {
    return cached.data;
  }

  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  problemCache.set(file, { mtimeMs: stat.mtimeMs, data });
  return data;
}
