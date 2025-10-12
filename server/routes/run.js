import express from "express";
import { runOnJudge0 } from "../judge.js";
import { resolveRoomId, sanitizeUsername } from "../utils.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { source, stdin = "", language_id = 54 } = req.body ?? {};
  if (!source) {
    return res.status(400).json({ error: "source is required" });
  }

  const io = req.io;
  const room = resolveRoomId(req.body?.roomId);
  const username = sanitizeUsername(req.body?.username);

  try {
    const result = await runOnJudge0(source, stdin, language_id);
    const { stdout, stderr, ...publicMetrics } = result;
    const timestamp = Date.now();

    const teamRun = {
      ...publicMetrics,
      outputHidden: true,
      roomId: room,
      username,
      timestamp,
    };
    io.to(`room:${room}`).emit("run_result", teamRun);

    io.to(`jury:${room}`).emit("run_result", {
      ...result,
      roomId: room,
      username,
      timestamp,
    });

    res.json(teamRun);
  } catch (error) {
    const status = Number.isInteger(error.status) ? error.status : 502;
    res.status(status).json({ error: "Executor failed", detail: error.message });
  }
});

export default router;
