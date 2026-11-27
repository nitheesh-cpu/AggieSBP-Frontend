import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const good = ["healthy", "succeeded", "up_to_date", "deployed"].includes(
    status,
  );
  const bad = [
    "failed",
    "failing",
    "unavailable",
    "quota_exhausted",
    "ci_failed",
    "needs_attention",
  ].includes(status);
  return (
    <Badge
      variant="outline"
      className={
        good
          ? "border-emerald-600/40 text-emerald-800 dark:text-emerald-300"
          : bad
            ? "border-red-600/40 text-red-700 dark:text-red-300"
            : "border-amber-600/40 text-amber-800 dark:text-amber-300"
      }
    >
      {status.replaceAll("_", " ")}
    </Badge>
  );
}
export function timestamp(value: string | null) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleString();
}
export function AdminError({ message }: { message: string | null }) {
  return message ? (
    <p
      role="alert"
      className="rounded-lg border border-red-500/30 bg-card p-4 text-sm text-red-700 dark:text-red-300"
    >
      {message}
    </p>
  ) : null;
}
export const panelClass = "rounded-xl border border-border bg-card p-5";
