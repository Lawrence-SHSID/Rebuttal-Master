import type { NextConfig } from "next";
import fs from "node:fs";
import path from "node:path";

/**
 * If `web/.env.local` is missing keys, also read `../.env.local` (repo root).
 * Next.js only auto-loads env files under the app directory; this helps when
 * the key was placed next to the `web` folder by mistake.
 */
function mergeParentOpenRouterEnv() {
  const parentLocal = path.resolve(process.cwd(), "..", ".env.local");
  if (!fs.existsSync(parentLocal)) return;
  const text = fs.readFileSync(parentLocal, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const s = line.trim();
    if (!s || s.startsWith("#")) continue;
    const i = s.indexOf("=");
    if (i < 1) continue;
    const k = s.slice(0, i).trim();
    if (k !== "OPENROUTER_API_KEY" && k !== "OPENROUTER_MODEL") continue;
    let v = s.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

mergeParentOpenRouterEnv();

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
