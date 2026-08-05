/**
 * cPanel Node.js / Passenger entrypoint.
 *
 * In cPanel → Setup Node.js App, set Application startup file to: server.js
 * Ensure Application mode is Production and Node is 20+.
 *
 * Requires a prior `npm run build` (produces .next/standalone).
 */
const fs = require("node:fs");
const path = require("node:path");

process.env.NODE_ENV = "production";
process.env.HOSTNAME = process.env.HOSTNAME || "0.0.0.0";

if (typeof PhusionPassenger !== "undefined") {
  // Classic Passenger integration; CloudLinux Node Selector still injects PORT.
  PhusionPassenger.configure({ autoInstall: false });
}

const standaloneDir = path.join(__dirname, ".next", "standalone");
const standaloneServer = path.join(standaloneDir, "server.js");

if (!fs.existsSync(standaloneServer)) {
  console.error(
    "[unap-rider] Missing .next/standalone/server.js. Run `npm run build` first.",
  );
  process.exit(1);
}

const publicDir = path.join(standaloneDir, "public");
const staticDir = path.join(standaloneDir, ".next", "static");

if (!fs.existsSync(publicDir) || !fs.existsSync(staticDir)) {
  console.error(
    "[unap-rider] Standalone is missing public/ or .next/static/. Re-run `npm run build`.",
  );
  process.exit(1);
}

// Next standalone resolves assets relative to its working directory.
process.chdir(standaloneDir);
require(standaloneServer);
