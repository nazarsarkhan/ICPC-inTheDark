import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import runRoute from "./routes/run.js";
import submitRoute from "./routes/submit.js";
import { config } from "./config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const staticRoot = config.static.dir || path.join(__dirname, "..", "web");

const app = express();
app.set("trust proxy", true);

const allowAllOrigins = config.cors.origins.includes("*");
const corsOptions = allowAllOrigins
  ? { origin: "*" }
  : { origin: config.cors.origins, credentials: config.cors.allowCredentials };

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "200kb" }));

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: allowAllOrigins
    ? { origin: "*" }
    : { origin: config.cors.origins, credentials: config.cors.allowCredentials },
});

io.on("connection", (socket) => {
  socket.on("joinTeam", (roomId) => socket.join(`room:${roomId}`));
  socket.on("joinJury", (roomId) => socket.join(`jury:${roomId}`));
});

app.use((req, _res, next) => {
  req.io = io;
  next();
});

app.use("/run", runRoute);
app.use("/submit", submitRoute);

app.get("/health", (_req, res) => res.json({ ok: true }));

if (config.static.enabled && fs.existsSync(staticRoot)) {
  const indexFile = path.join(staticRoot, config.static.index);
  app.use(express.static(staticRoot, { extensions: ["html"], maxAge: "1h" }));
  app.get("/", (_req, res) => {
    res.sendFile(indexFile);
  });
}

const host = config.host || "0.0.0.0";
const port = Number.isFinite(config.port) ? config.port : 3000;
server.listen(port, host, () => {
  const address = server.address();
  const actualPort = typeof address === "object" && address ? address.port : port;
  console.log(`API listening on ${host}:${actualPort}`);
});
