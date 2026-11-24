import { execFile } from "node:child_process";
import { basename } from "node:path";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import { authorizeAdmin } from "@/lib/admin-gate";

/**
 * What is running on the VM, for the admin overview (D-052): the site release
 * (the deploy script names each release folder `<sha>-<UTC yyyymmddHHMMSS>`
 * and server.js runs inside it) and the systemd services. Read-only; nothing
 * here can change the server. Off the VM both come back null.
 */
export const dynamic = "force-dynamic";

const run = promisify(execFile);
const SERVICES = [
  ["aggiermp", "API"],
  ["aggiesbp-summary-worker", "Admin worker"],
  ["aggiesbp-web", "Website"],
  ["nginx", "nginx (API)"],
  ["cloudflared", "Cloudflare Tunnel (site)"],
] as const;

export interface SiteStatus {
  release: { commit: string; deployedAt: string } | null;
  services: { unit: string; label: string; state: string; since: string | null }[] | null;
}

function currentRelease(): SiteStatus["release"] {
  const match = /^([0-9a-f]{7,40})-(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(basename(process.cwd()));
  if (!match) return null;
  const [, commit, y, mo, d, h, mi, s] = match;
  return { commit, deployedAt: `${y}-${mo}-${d}T${h}:${mi}:${s}Z` };
}

async function serviceStates(): Promise<SiteStatus["services"]> {
  if (process.platform !== "linux") return null;
  try {
    const { stdout } = await run(
      "systemctl",
      ["show", ...SERVICES.map(([unit]) => unit), "-p", "Id", "-p", "ActiveState", "-p", "ActiveEnterTimestamp"],
      { timeout: 5_000 },
    );
    const blocks = stdout.trim().split(/\n\s*\n/).map((block) =>
      Object.fromEntries(block.split("\n").map((line) => {
        const i = line.indexOf("=");
        return [line.slice(0, i), line.slice(i + 1)];
      })),
    );
    return SERVICES.map(([unit, label]) => {
      const info = blocks.find((block) => block.Id === `${unit}.service`) ?? {};
      const since = info.ActiveEnterTimestamp ? new Date(info.ActiveEnterTimestamp) : null;
      return {
        unit,
        label,
        state: info.ActiveState || "unknown",
        since: since && !Number.isNaN(since.getTime()) ? since.toISOString() : null,
      };
    });
  } catch (error) {
    console.error("[admin] systemctl failed:", error);
    return null;
  }
}

export async function GET(request: Request) {
  const gate = await authorizeAdmin(request);
  if (!gate.ok) {
    return NextResponse.json({ detail: gate.message }, { status: gate.status, headers: { "Cache-Control": "no-store" } });
  }
  const status: SiteStatus = { release: currentRelease(), services: await serviceStates() };
  return NextResponse.json(status, { headers: { "Cache-Control": "no-store" } });
}
