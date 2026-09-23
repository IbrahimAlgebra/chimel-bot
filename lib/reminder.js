const schedule = {
  1: { 1: "someone", 2: "myluv", 3: "someone" },
  2: { 1: "myluv", 2: "someone", 3: "someone" },
  3: { 1: "someone", 2: "someone", 3: "myluv" },
  4: { 1: "someone", 2: "myluv", 3: "someone" },
  5: { 1: "someone", 2: "myluv", 3: "someone" },
};

const SHIFT_HOURS = {
  1: { start: 8, end: 12 },
  2: { start: 12, end: 16 },
  3: { start: 16, end: 20 },
};

export function getJakartaDate() {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
  );
}

export function getSprint(date = getJakartaDate()) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const firstThursday = new Date(firstDay);

  while (firstThursday.getDay() !== 4) {
    firstThursday.setDate(firstThursday.getDate() + 1);
  }

  if (date < firstThursday) {
    return getSprint(new Date(year, month, 0));
  }

  const diffDays = Math.floor((date - firstThursday) / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7) + 1;
}

export function getShift(date = getJakartaDate()) {
  const hour = date.getHours();

  if (hour >= 8 && hour < 12) return 1;
  if (hour >= 12 && hour < 16) return 2;
  if (hour >= 16 && hour < 20) return 3;

  return null;
}

export function getShiftLabel(shift) {
  const h = SHIFT_HOURS[shift];
  if (!h) return "-";
  return `${String(h.start).padStart(2, "0")}:00–${String(h.end).padStart(2, "0")}:00`;
}

export function getOnDuty(date = getJakartaDate()) {
  const sprint = getSprint(date);
  const shift = getShift(date);

  if (!shift) return null;

  return schedule[sprint]?.[shift] ?? null;
}

export function isMyLuvOnDuty(date = getJakartaDate()) {
  return getOnDuty(date) === "myluv";
}

// Unique key per shift-slot, e.g. "2026-09-23-2". Used as the state key
// for tracking whether a reminder was already sent/confirmed.
export function getShiftKey(date = getJakartaDate()) {
  const shift = getShift(date);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}-${shift}`;
}

// Jakarta Date object for the start of the given shift, same calendar day as `date`.
export function getShiftStart(date = getJakartaDate()) {
  const shift = getShift(date);
  if (!shift) return null;
  const start = new Date(date);
  start.setHours(SHIFT_HOURS[shift].start, 0, 0, 0);
  return start;
}
