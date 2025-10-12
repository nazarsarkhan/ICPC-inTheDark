# ICPC in the Dark

A lightweight environment for ICPC-style training sessions with a collaborative room model, in-browser editor, hidden test judging, WebSocket verdict streaming, and jury tooling (plus optional scoreboard hooks if you decide to add them).

---

## Repository layout

```
icpc-dark/
  server/                     # Node.js backend (Express + Socket.IO)
    index.js                  # application entry point
    judge.js                  # Judge0 (hosted CE) adapter
    judge-piston.js           # optional Piston adapter
    utils.js                  # helpers for problems and output comparison
    routes/
      run.js                  # POST /run
      submit.js               # POST /submit
    problems/
      <ID>.<slug>.json        # canonical A–Z lineup, documented below
    package.json              # npm scripts and dependencies
  web/
    team.html                 # team interface
    jury.html                 # jury dashboard
```

---

## Prerequisites

- Node.js 18+ (the project has been exercised on 22.x).
- npm.
- Any modern browser.
- Internet access if you rely on the hosted Judge0 CE runtime (no Docker needed in that case).

> Browsers never call Judge0 directly—everything goes through `/run` and `/submit` on your server.

---

## Quick start

### 1. Install backend dependencies

```bash
cd server
npm install
```

### 2. Choose your execution mode

- **Local development (default).** Nothing extra is required. The server will call the hosted Judge0 CE API and you can open the HTML files directly from disk.
- **Fully local sandbox.** Point `JUDGE_BASE_URL` at your own Judge0 CE or Piston deployment (see [Alternative runtimes](#alternative-runtimes)).

The adapter posts code and stdin to `${JUDGE_BASE_URL}/submissions?base64_encoded=false&wait=true` and normalizes the response for the UI.

### 3. Start the API

```bash
npm run dev   # or npm start
# API will be available at http://localhost:3000 by default
```

### 4. Open the front-end

- `web/index.html` for a combined run/submit console (handy for local testing).
- `web/team.html` for the streamlined team submission view.
- `web/jury.html` for the jury console.
  Open them directly from disk or via a static file server such as the Live Server extension in VS Code.
  - On the team page, choose your username, set the shared room, and pick a problem ID (`A`–`Z`) before submitting.

> Tip: when the backend serves static files (see [Hosting profiles](#hosting-profiles)), the HTML pages automatically target the same origin for REST and Socket.IO traffic. When opened from disk they fall back to `http://localhost:3000`.

---

## Hosting profiles

The server is tuned for both local practice sessions and hosted deployments.

| Scenario | Suggested settings |
| --- | --- |
| **Local workstation** | Keep the defaults. Start the API, open the HTML files from disk, and rely on the hosted Judge0 CE executor. |
| **All-in-one laptop/server** | Start Judge0 CE locally (Docker or bare metal) and set `JUDGE_BASE_URL=http://127.0.0.1:2358`. Optionally set `SERVE_STATIC=true` so the Node.js server also serves the `web/` directory. |
| **Production hosting** | Provide a domain, set `CORS_ORIGINS=https://your.domain`, `SERVE_STATIC=true`, and define `JUDGE_BASE_URL` for the executor you control. Add `JUDGE_API_KEY` if your sandbox requires it. |

### Environment variables

These can be defined directly in the shell, via `.env`, or through your hosting platform:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | HTTP port for Express and Socket.IO. |
| `HOST` | `0.0.0.0` | Bind address for the server. |
| `CORS_ORIGINS` | _allow all_ | Comma-separated list of origins that may access the API/WebSocket. Set this in production. |
| `DEFAULT_ROOM` | `room1` | Fallback room ID when clients omit the field. |
| `SERVE_STATIC` | `false` | When `true`, Express also serves the `web/` directory. |
| `STATIC_DIR` | `../web` | Override the directory used for static hosting. |
| `STATIC_INDEX` | `index.html` | File returned for `/` when static hosting is enabled. |
| `JUDGE_BASE_URL` | `https://ce.judge0.com` | Base URL for Judge0 CE or Piston. |
| `JUDGE_API_KEY` | _empty_ | Optional authentication token for the judge. |
| `JUDGE_TIMEOUT_MS` | `20000` | Axios timeout for judge requests (milliseconds). |

### Local-only setup checklist

1. `npm install` in `server/`.
2. `npm run dev` (or `npm start`) and confirm the API on port 3000.
3. Open `web/index.html`, `web/team.html`, and `web/jury.html` directly from disk.
4. Work within room `room1` (or change the default via `DEFAULT_ROOM`).

### Hosted deployment checklist

1. Provision a Judge0 CE/Piston instance reachable by your server (optional when using the hosted Judge0 CE API).
2. Configure environment variables: at minimum `PORT`, `HOST`, and `CORS_ORIGINS`; add `SERVE_STATIC=true` if you want Express to serve the front-end.
3. Deploy `server/` to your Node.js host, run `npm install --production`, and start with `npm run start`.
4. (Optional) Upload the `web/` directory to the same host or a CDN. When `SERVE_STATIC=true`, the Node.js process handles it automatically.
5. Verify `/health`, `/run`, and `/submit` endpoints as well as Socket.IO events from a browser session.

> Tip: when the backend serves static files (see [Hosting profiles](#hosting-profiles)), the HTML pages automatically target the same origin for REST and Socket.IO traffic. When opened from disk they fall back to `http://localhost:3000`.

---

## Hosting profiles

The server is tuned for both local practice sessions and hosted deployments.

| Scenario | Suggested settings |
| --- | --- |
| **Local workstation** | Keep the defaults. Start the API, open the HTML files from disk, and rely on the hosted Judge0 CE executor. |
| **All-in-one laptop/server** | Start Judge0 CE locally (Docker or bare metal) and set `JUDGE_BASE_URL=http://127.0.0.1:2358`. Optionally set `SERVE_STATIC=true` so the Node.js server also serves the `web/` directory. |
| **Production hosting** | Provide a domain, set `CORS_ORIGINS=https://your.domain`, `SERVE_STATIC=true`, and define `JUDGE_BASE_URL` for the executor you control. Add `JUDGE_API_KEY` if your sandbox requires it. |

### Environment variables

These can be defined directly in the shell, via `.env`, or through your hosting platform:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | HTTP port for Express and Socket.IO. |
| `HOST` | `0.0.0.0` | Bind address for the server. |
| `CORS_ORIGINS` | _allow all_ | Comma-separated list of origins that may access the API/WebSocket. Set this in production. |
| `DEFAULT_ROOM` | `room1` | Fallback room ID when clients omit the field. |
| `SERVE_STATIC` | `false` | When `true`, Express also serves the `web/` directory. |
| `STATIC_DIR` | `../web` | Override the directory used for static hosting. |
| `STATIC_INDEX` | `team.html` | File returned for `/` when static hosting is enabled. |
| `JUDGE_BASE_URL` | `https://ce.judge0.com` | Base URL for Judge0 CE or Piston. |
| `JUDGE_API_KEY` | _empty_ | Optional authentication token for the judge. |
| `JUDGE_TIMEOUT_MS` | `20000` | Axios timeout for judge requests (milliseconds). |

### Local-only setup checklist

1. `npm install` in `server/`.
2. `npm run dev` (or `npm start`) and confirm the API on port 3000.
3. Open `web/team.html` and `web/jury.html` directly from disk.
4. Work within room `room1` (or change the default via `DEFAULT_ROOM`).

### Hosted deployment checklist

1. Provision a Judge0 CE/Piston instance reachable by your server (optional when using the hosted Judge0 CE API).
2. Configure environment variables: at minimum `PORT`, `HOST`, and `CORS_ORIGINS`; add `SERVE_STATIC=true` if you want Express to serve the front-end.
3. Deploy `server/` to your Node.js host, run `npm install --production`, and start with `npm run start`.
4. (Optional) Upload the `web/` directory to the same host or a CDN. When `SERVE_STATIC=true`, the Node.js process handles it automatically.
5. Verify `/health`, `/run`, and `/submit` endpoints as well as Socket.IO events from a browser session.

---

## How to use

### Practice console (`web/index.html`)

Use the combined console when you need to **Run** code against custom input or quickly **Submit** without the polished layout. It mirrors the backend responses (sanitized for team visibility) so you can confirm executor wiring before sharing the curated UI with teams.

### Team interface

Pick a room ID (shared between the team and jury tabs), choose a username for attribution, and select a problem ID before editing code with the embedded Ace editor. The streamlined layout focuses on submissions only—press **Submit** to send your solution. Socket events refresh the status card with receipt updates (`submit_result_public`); raw stdout/stderr and verdict breakdowns stay hidden from the team view.

### Jury interface

Join the same room to watch live run logs (including stdout/stderr) and full per-test submission details, with room, problem, and username context highlighted, updated through `run_result` and `submit_result_private` events.

### Creating problems

Drop JSON files into `server/problems/<ID>.json` (or `<ID>.*.json`) with public and hidden test arrays. Any file from the curated A–Z lineup can act as a template: the warm-ups `A`–`F` cover console I/O, loops, and simple simulations; `G`–`L` reinforce core data structures and shortest paths; `M`–`R` introduce tree DP, greedy scheduling, and range data structures; and the stretch problems `S`–`Z` bring in flows, FFT, and multi-phase optimisation. Outputs are normalized by trimming trailing whitespace and removing carriage returns before comparison.

### Problem lineup (A–Z)

The bundled set now spans twenty-six problems with steadily rising difficulty. Use the table below as a quick reference for the progression and for spotting the milestone tasks (notably `M`, `T`, `W`, and the championship finale `Z`).

| ID | Title | Difficulty | Focus / notable moment |
| --- | --- | --- | --- |
| A | Hello, Judge! | Intro | Environment handshake and basic console output. |
| B | Bakery Balances | Intro | Looping, cumulative sums, and integer arithmetic. |
| C | Candy Count | Intro | Frequency counting and simple arrays. |
| D | Divisible Dance | Intro | Modular reasoning and conditionals. |
| E | Elevator Schedules | Intro | Sorting a handful of trips with basic greedy checks. |
| F | Festival Lights | Intro | Prefix toggles over a small grid. |
| G | Grid Runner | Core | Breadth-first search on an unweighted maze. |
| H | Harbor Hopping | Core | Dijkstra on a sparse weighted graph. |
| I | Island Union | Core | Disjoint-set unions for connectivity queries. |
| J | Journey Planner | Core | Prefix DP with resource budgeting. |
| K | Kinetic Search | Core | Parametric binary search with feasibility testing. |
| L | Ledger Sync | Core | Difference arrays and partial sums for range fixes. |
| M | Mountain Trails | Advanced | First tree-DP checkpoint (path counting with rerooting). |
| N | Night Market | Advanced | Greedy scheduling with priority queues. |
| O | Orbital Transfers | Advanced | Multi-source BFS with teleport edges. |
| P | Pipeline Planner | Advanced | Shortest path with state compression. |
| Q | Query Factory | Advanced | Segment tree with lazy propagation. |
| R | River Confluence | Advanced | MST building plus offline DSU queries. |
| S | Signal Boosters | Expert | Binary search combined with DP feasibility checks. |
| T | Trade Network | Expert | First max-flow / min-cut exercise. |
| U | Underground Labyrinth | Expert | BFS + DSU hybrid for dynamic walls. |
| V | Voltage Stabilizers | Expert | Bitset-accelerated DP on DAGs. |
| W | Windmill Interference | Expert | First FFT-based convolution challenge. |
| X | Xenon Strings | Expert | Suffix automaton + hashing for substring queries. |
| Y | Yield Optimiser | Expert | Tree rerooting with DP and heavy-light insights. |
| Z | Zenith Challenge | Championship | Multi-phase optimisation pulling together techniques from the full set. |

---

## Backend API

### POST `/run`

```json
{
  "source": "<cpp code>",
  "stdin": "optional",
  "language_id": 54,
  "roomId": "room1"
}
```

Returns status, time, memory, and an `outputHidden` flag—stdout/stderr are stripped from the HTTP response so teams cannot inspect them. The server simultaneously emits a sanitized `run_result` to the team room and the full packet (with stdout/stderr) to the jury room so both UIs stay in sync.

### POST `/submit`

```json
{
  "source": "<cpp code>",
  "problemId": "A",
  "language_id": 54,
  "roomId": "room1"
}
```

Runs hidden tests sequentially, halting at the first failure. The HTTP response now returns a simple acknowledgement for teams (problem ID, timestamp, and message), while WebSocket payloads deliver a receipt to the team (`submit_result_public`) and the detailed verdict packet to the jury (`submit_result_private`).

---

## WebSocket channels

Clients join `room:<roomId>` (teams) or `jury:<roomId>` (jury). The backend keeps track of those namespaces and pushes run and submit events automatically.

If you need a live scoreboard, extend the backend with a `/score/push` handler and broadcast custom events for a dedicated UI to consume—only `/run` and `/submit` are provided out of the box.

---

## Alternative runtimes

- **Hosted Judge0 CE** is the default (fast, zero setup, but requires outbound internet).
- **Piston** is a self-hosted alternative that you can run locally via Docker on Windows; wire it up by swapping the judge adapter.
- **Judge0 CE on Linux/VPS** is recommended if you want a fully local sandbox; the included `docker-compose.yml` spins up the database, Redis, API, and workers with sandbox relaxed for Windows compatibility.

---

## Troubleshooting

A handful of common snags—PowerShell quoting, CORS expectations (the browser always targets `http://localhost:3000`), Docker Desktop sandbox failures, duplicate imports, and PowerShell-friendly here-strings for code payloads—are catalogued for quick reference.

---

## End-to-end checklist

1. `npm install` in `server/`.
2. `npm run dev` and confirm the API on port 3000.
3. Open `web/team.html`, set `room1`, choose your username, and pick problem `A` (Hello, Judge!) or any other item from the lineup.
4. Press **Run** and confirm the Accepted verdict, timing stats, and the “output hidden” notice (no stdout/stderr).
5. Open `web/jury.html` (same room), hit **Submit**, and review the detailed verdicts.

---

## Minimum hardening

- Keep JSON bodies small (`express.json({ limit: "200kb" })` is already in place).
- Add timeouts/retries on Judge0 requests and consider a rate limiter or queue to protect the executor.
- Avoid logging full source code outside controlled environments.
