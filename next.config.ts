import { spawnSync } from "node:child_process";
import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const revision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() ||
  crypto.randomUUID();

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Lean Node deploy for cPanel (Setup Node.js App + server.js entry).
  output: "standalone",
  // Avoid sharp native builds on shared hosts; logo/assets still load via <Image>.
  images: {
    unoptimized: true,
  },
  // Serwist injects webpack config; explicit empty turbopack avoids dev startup errors.
  turbopack: {},
};

export default withSerwist(nextConfig);
