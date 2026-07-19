const WORKDAY_TIMEZONE = 'America/New_York';
const WORKDAY_END_HOUR = 17;

function getTzOffsetMinutes(timeZone: string, utcMs: number): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = dtf.formatToParts(new Date(utcMs));
  const map: Record<string, string> = {};
  for (const p of parts) {
    if (p.type !== 'literal') map[p.type] = p.value;
  }
  const asIfUtc = Date.UTC(+map.year, +map.month - 1, +map.day, +map.hour, +map.minute, +map.second);
  return (asIfUtc - utcMs) / 60_000;
}

/**
 * Returns an ISO 8601 UTC timestamp for 5:00 PM America/New_York on the
 * calendar date `now` falls on in that timezone. Correctly accounts for
 * EST/EDT by computing the actual UTC offset for that specific date.
 */
export function endOfWorkdayEasternIso(now: Date = new Date()): string {
  const dateParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: WORKDAY_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  const [year, month, day] = dateParts.split('-').map(Number);

  const naiveUtcMs = Date.UTC(year, month - 1, day, WORKDAY_END_HOUR, 0, 0);
  const offsetMinutes = getTzOffsetMinutes(WORKDAY_TIMEZONE, naiveUtcMs);
  const targetUtcMs = naiveUtcMs - offsetMinutes * 60_000;
  return new Date(targetUtcMs).toISOString();
}
