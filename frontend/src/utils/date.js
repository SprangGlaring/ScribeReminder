// src/utils/date.js
import { DateTime } from 'luxon';

export function toISODate(d) {
  return DateTime.fromISO(d).toISODate();
}

export function nowISO() {
  return DateTime.now().toISODate();
}

export function addDaysISO(isoDate, days) {
  return DateTime.fromISO(isoDate).plus({ days }).toISODate();
}

// get next due date given cycle: monthly, yearly, custom days
export function nextDueDate(startISO, cycle, fromISO = null) {
  const from = fromISO ? DateTime.fromISO(fromISO) : DateTime.now();
  let candidate = DateTime.fromISO(startISO);
  if (candidate < from) {
    if (cycle === 'monthly') {
      while (candidate < from) candidate = candidate.plus({ months: 1 });
    } else if (cycle === 'yearly') {
      while (candidate < from) candidate = candidate.plus({ years: 1 });
    } else {
      // assume cycle is number of days
      const days = Number(cycle) || 30;
      while (candidate < from) candidate = candidate.plus({ days });
    }
  }
  return candidate.toISODate();
}
