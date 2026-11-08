/**
 * Local Date Formatting & Timezone Helpers for Indian Automobile Dealership SaaS
 * Prevents UTC-offset date shifting (e.g. Nov 5 at 2:00 AM IST shifting to Nov 4 in UTC)
 */

/**
 * Returns "YYYY-MM-DD" representing the local date (not UTC)
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Safely parses "YYYY-MM-DD" into a Date object at local midnight,
 * avoiding ECMAScript UTC-midnight date parsing shift.
 */
export function parseLocalDate(dateStr: string): Date {
  const parts = dateStr.split("-").map(Number);
  const year = parts[0] ?? new Date().getFullYear();
  const month = (parts[1] ?? 1) - 1;
  const day = parts[2] ?? 1;
  return new Date(year, month, day);
}

/**
 * Add or subtract days from a "YYYY-MM-DD" string in local time
 */
export function addDaysToLocalDate(dateStr: string, days: number): string {
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() + days);
  return getLocalDateString(d);
}

/**
 * Human-readable date label for the showroom toolbar
 * E.g. "Today, 5 Nov" or "Thu, 5 Nov"
 */
export function formatToolbarDateLabel(selectedDate: string): string {
  if (selectedDate === "all") return "All Scheduled Dates";
  const d = parseLocalDate(selectedDate);
  const todayStr = getLocalDateString(new Date());

  if (selectedDate === todayStr) {
    return `Today, ${d.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}`;
  }
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

