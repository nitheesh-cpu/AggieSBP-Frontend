import { execFile } from "node:child_process";
import { open } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import { authorizeAdmin } from "@/lib/admin-gate";
import { MAX_STATUS_BYTES, parseAutodeployStatus, type AutodeployStatus } from "@/lib/autodeploy-status";

/**
 * What is running on the VM, for the admin overview (D-052): the site release
 * (the deploy script names each release folder `<sha>-<UTC yyyymmddHHMMSS>`
 * and server.js runs inside it), the systemd services, and the autodeploy
 * status file (D-024; the site runs as the same user as the cron job).
 * Read-only; nothing here can change the server. Off the VM all come back null.
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
  autodeploy: AutodeployStatus | null;
}

const AUTODEPLOY_STATUS_FILE =
  process.env.AUTODEPLOY_STATUS_FILE || join(homedir(), ".local/state/aggiesbp-autodeploy/status.json");

async function autodeployStatus(): Promise<SiteStatus["autodeploy"]> {
  if (process.platform !== "linux") return null;
  let file;
  try {
    file = await open(AUTODEPLOY_STATUS_FILE, "r");
    const buffer = Buffer.alloc(MAX_STATUS_BYTES + 1);
    const { bytesRead } = await file.read(buffer, 0, buffer.length, 0);
    return parseAutodeployStatus(buffer.subarray(0, bytesRead).toString("utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("[admin] autodeploy status unreadable:", error);
    }
    return null;
  } finally {
    await file?.close();
  }
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
  const [services, autodeploy] = await Promise.all([serviceStates(), autodeployStatus()]);
  const status: SiteStatus = { release: currentRelease(), services, autodeploy };
  return NextResponse.json(status, { headers: { "Cache-Control": "no-store" } });
}
