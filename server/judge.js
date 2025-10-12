import axios from "axios";
import { config } from "./config.js";

const judgeClient = axios.create({
  baseURL: config.judge.baseUrl,
  timeout: config.judge.timeoutMs,
  headers: {
    "Content-Type": "application/json",
    ...(config.judge.apiKey ? { "X-Auth-Token": config.judge.apiKey } : {}),
  },
});

function toJudgeError(error) {
  if (error.response?.data) {
    const payload = error.response.data;
    const detail =
      payload.error || payload.description || payload.message || error.message;
    const err = new Error(detail || "Judge request failed");
    err.status = error.response.status;
    err.payload = payload;
    return err;
  }
  return error instanceof Error ? error : new Error("Judge request failed");
}

export async function runOnJudge0(source_code, stdin, language_id = 54) {
  const payload = { source_code, language_id, stdin };
  try {
    const { data } = await judgeClient.post(
      "/submissions?base64_encoded=false&wait=true",
      payload,
    );
    return {
      stdout: data.stdout || "",
      stderr: data.stderr || "",
      status: data.status?.description || data.status?.name || "Unknown",
      time: data.time ?? "0.0",
      memory: data.memory ?? 0,
    };
  } catch (error) {
    throw toJudgeError(error);
  }
}
