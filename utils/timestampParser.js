/**
 * Parses the timestamp string from Hacker News.
 *
 * Hacker News stores timestamps in the title attribute like:
 *   "2026-02-25T03:21:13 1771989673"
 *
 * The second value is Unix epoch time (in seconds), which is
 * the most reliable and unambiguous representation.
 *
 * We prefer parsing the epoch value if present.
 */
function parseHNTimestamp(raw) {
  if (!raw || typeof raw !== "string") return NaN;

  // Split on whitespace to separate ISO-like string and epoch seconds
  const parts = raw.trim().split(/\s+/);

  // If last part looks like epoch seconds, use it
  const last = parts[parts.length - 1];
  if (/^\d{9,12}$/.test(last)) {
    return Number(last) * 1000; // convert seconds → milliseconds
  }

  // Fallback: parse ISO-like portion
  // If no timezone exists, assume UTC ("Z") for consistency
  let iso = parts[0].trim();
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(iso)) iso += "Z";

  return Date.parse(iso);
}

// Export the function so other files can use it
module.exports = {
  parseHNTimestamp,
};