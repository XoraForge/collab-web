#!/usr/bin/env node
/**
 * Starts everything Collab needs for local development, side by side:
 *   web       this repo (next dev)               http://localhost:3000
 *   realtime  ../collab-realtime (npm run dev)   ws://localhost:3001
 *   api       ../collab-api/collab-api (mvnw)    http://localhost:8080
 *   livekit   ../collab-realtime (npm run livekit) ws://localhost:7880  (calls)
 *
 * Usage: npm run dev            (API uses .env, i.e. Supabase)
 *        npm run dev -- --local (API uses the in-memory H2 "local" profile)
 *        npm run dev -- --no-api --no-livekit   (skip any of: web, realtime, api, livekit)
 * Ctrl+C stops all of them.
 */
import { spawn, spawnSync } from "node:child_process";
import net from "node:net";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const isWin = process.platform === "win32";
const root = path.resolve(__dirname, "..");
const realtimeDir = path.resolve(root, "../collab-realtime");
const apiDir = path.resolve(root, "../collab-api/collab-api");

/** collab-api needs Java 25; the default `java` on this machine may be older. */
function findJava25() {
  if (process.env.JAVA_HOME && /25/.test(path.basename(process.env.JAVA_HOME))) return process.env.JAVA_HOME;
  const jdks = path.join(os.homedir(), ".jdks");
  if (!fs.existsSync(jdks)) return process.env.JAVA_HOME;
  const match = fs.readdirSync(jdks).filter((d) => /(^|-)25[.\d]*$/.test(d)).sort().pop();
  return match ? path.join(jdks, match) : process.env.JAVA_HOME;
}

const services = [
  { name: "web", color: 36, port: 3000, cwd: root, cmd: "npx", args: ["next", "dev"] },
  { name: "realtime", color: 35, port: 3001, cwd: realtimeDir, cmd: "npm", args: ["run", "dev"] },
  {
    name: "api",
    color: 33,
    port: 8080,
    cwd: apiDir,
    // Full path: cmd.exe doesn't always look in the working directory.
    cmd: isWin ? `"${path.join(apiDir, "mvnw.cmd")}"` : "./mvnw",
    args: ["spring-boot:run"],
    env: {
      JAVA_HOME: findJava25(),
      ...(args.includes("--local") ? { SPRING_PROFILES_ACTIVE: "local" } : {}),
    },
  },
  { name: "livekit", color: 32, port: 7880, cwd: realtimeDir, cmd: "npm", args: ["run", "livekit"] },
].filter((s) => !args.includes(`--no-${s.name}`));

const RED = "\u001b[31m";
const RESET = "\u001b[0m";
const width = Math.max(...services.map((s) => s.name.length));
const children = [];
let stopping = false;

function log(service, line) {
  const label = `\x1b[${service.color}m${service.name.padEnd(width)} |\x1b[0m`;
  process.stdout.write(`${label} ${line}\n`);
}

// Never echo database URLs or passwords that a Spring error might print.
const redact = (line) => line.replace(/postgres(ql)?:\/\/\S+/gi, "postgres://[redacted]").replace(/(password\S*\s*[=:]\s*)\S+/gi, "$1[redacted]");

function pipe(service, stream) {
  let buffer = "";
  stream.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop();
    lines.forEach((line) => log(service, redact(line)));
  });
}

/** Is something already listening on this port? (e.g. a server left over from another run) */
function portInUse(port) {
  const tryHost = (host) =>
    new Promise((resolve) => {
      const socket = net.connect({ port, host });
      const done = (inUse) => {
        socket.destroy();
        resolve(inUse);
      };
      socket.setTimeout(500, () => done(false));
      socket.once("connect", () => done(true));
      socket.once("error", () => done(false));
    });
  return Promise.all([tryHost("127.0.0.1"), tryHost("::1")]).then(([v4, v6]) => v4 || v6);
}

for (const service of services) {
  if (!fs.existsSync(service.cwd)) {
    log(service, `skipped: ${service.cwd} not found`);
    continue;
  }
  // Don't let an old server quietly answer instead (it may be using another database).
  if (await portInUse(service.port)) {
    log(service, `${RED}not started: port ${service.port} is already in use. Stop whatever is using it and try again.${RESET}`);
    continue;
  }
  const child = spawn(service.cmd, service.args, {
    cwd: service.cwd,
    env: { ...process.env, ...service.env, FORCE_COLOR: "1" },
    shell: isWin, // .cmd files (npm, npx, mvnw.cmd) need a shell on Windows
    detached: !isWin, // own process group, so we can stop its children too
  });
  children.push(child);
  pipe(service, child.stdout);
  pipe(service, child.stderr);
  child.on("error", (err) => log(service, `failed to start: ${err.message}`));
  child.on("exit", (code) => {
    if (!stopping) log(service, `exited${code === null ? "" : ` with code ${code}`}`);
  });
}

/** Stop each service and everything it started (mvnw → java, npm → node). */
function killAll() {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.exitCode !== null || !child.pid) continue;
    try {
      if (isWin) spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" });
      else process.kill(-child.pid, "SIGTERM");
    } catch {
      // already gone
    }
  }
}

const stopAll = () => {
  killAll();
  process.exit(0);
};
process.on("SIGINT", stopAll);
process.on("SIGTERM", stopAll);
process.on("exit", killAll);
