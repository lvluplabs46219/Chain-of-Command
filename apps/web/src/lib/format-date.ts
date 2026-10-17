/** Client-safe date formatting (avoids SSR hydration mismatch). */
export function formatDateClient(
  value: string | number | Date | null | undefined,
  opts?: Intl.DateTimeFormatOptions
): string {
  if (value == null || value === "") return "—";
  if (typeof window === "undefined") return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, opts);
}
