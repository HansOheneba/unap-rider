/**
 * After `next build` with output: "standalone", Next does not copy
 * public/ or .next/static into the standalone folder. cPanel deploys
 * need those next to standalone/server.js so CSS, icons, and the SW resolve.
 */
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const standalone = join(root, ".next", "standalone");

if (!existsSync(standalone)) {
  console.error(
    "[copy-standalone-assets] .next/standalone not found. Did next build succeed?",
  );
  process.exit(1);
}

cpSync(join(root, "public"), join(standalone, "public"), { recursive: true });

mkdirSync(join(standalone, ".next"), { recursive: true });
cpSync(join(root, ".next", "static"), join(standalone, ".next", "static"), {
  recursive: true,
});

console.log("[copy-standalone-assets] Copied public/ and .next/static → standalone");
