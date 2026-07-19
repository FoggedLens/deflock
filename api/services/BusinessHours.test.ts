import { describe, it, expect } from 'bun:test';
import { endOfWorkdayEasternIso } from './BusinessHours';

describe('endOfWorkdayEasternIso', () => {
  it('resolves to 21:00 UTC (5pm EDT) during daylight saving time', () => {
    const now = new Date('2026-07-16T12:00:00Z'); // July -> EDT, UTC-4
    expect(endOfWorkdayEasternIso(now)).toBe('2026-07-16T21:00:00.000Z');
  });

  it('resolves to 22:00 UTC (5pm EST) outside daylight saving time', () => {
    const now = new Date('2026-01-16T12:00:00Z'); // January -> EST, UTC-5
    expect(endOfWorkdayEasternIso(now)).toBe('2026-01-16T22:00:00.000Z');
  });

  it('uses the New York calendar date, not the UTC calendar date', () => {
    // 1am UTC on the 17th is still 9pm on the 16th in New York (EDT, UTC-4)
    const now = new Date('2026-07-17T01:00:00Z');
    expect(endOfWorkdayEasternIso(now)).toBe('2026-07-16T21:00:00.000Z');
  });
});
