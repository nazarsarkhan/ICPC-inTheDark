import express from "express";
import { runOnJudge0 } from "../judge.js";
import { loadProblem, normalize, resolveRoomId, sanitizeUsername } from "../utils.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { source, problemId, language_id = 54 } = req.body ?? {};
  if (!source) {
    return res.status(400).json({ error: "source is required" });
  }
  if (!problemId) {
    return res.status(400).json({ error: "problemId is required" });
  }

  const io = req.io;
  const room = resolveRoomId(req.body?.roomId);
  const username = sanitizeUsername(req.body?.username);

  try {
    const problem = loadProblem(problemId);
    const hiddenTests = Array.isArray(problem.hiddenTests) ? problem.hiddenTests : [];

    if (hiddenTests.length === 0) {
      throw new Error(`No hidden tests configured for ${problemId}`);
    }

    const verdicts = [];
    let final = "AC";
    const timestamp = Date.now();

    for (const [i, test] of hiddenTests.entries()) {
      const result = await runOnJudge0(source, test.in, language_id);

      let verdict = "AC";
      const status = result.status || "Unknown";
      if (status.startsWith("Time Limit")) verdict = "TLE";
      else if (status.startsWith("Compilation") || status.startsWith("Runtime")) {
        verdict = "RE";
      }

      const received = normalize(result.stdout);
      const expected = normalize(test.out);
      if (verdict === "AC" && received !== expected) verdict = "WA";

      if (verdict !== "AC" && final === "AC") {
        final = verdict;
      }

      verdicts.push({
        idx: i + 1,
        v: verdict,
        status: status,
        time: result.time,
        memory: result.memory,
      });

      if (verdict !== "AC") {
        break;
      }
    }

    const detailed = {
      problemId,
      final,
      verdicts,
      timestamp,
      username,
      roomId: room,
    };

    const teamPayload = {
      problemId,
      timestamp,
      username,
      roomId: room,
      status: "received",
      message: "Submission stored. Official verdict will be announced later.",
    };

    io.to(`room:${room}`).emit("submit_result_public", teamPayload);
    io.to(`jury:${room}`).emit("submit_result_private", detailed);

    res.json(teamPayload);
  } catch (error) {
    const status = Number.isInteger(error.status) ? error.status : 400;
    res.status(status).json({ error: "Submit failed", detail: error.message });
  }
});

export default router;
