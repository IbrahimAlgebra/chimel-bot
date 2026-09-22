const schedule = {
  1: { 1: "someone", 2: "myluv", 3: "someone" },
  2: { 1: "myluv", 2: "someone", 3: "someone" },
  3: { 1: "someone", 2: "someone", 3: "myluv" },
  4: { 1: "someone", 2: "myluv", 3: "someone" },
  5: { 1: "someone", 2: "myluv", 3: "someone" },
};

function getJakartaDate() {
  return new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Jakarta",
    }),
  );
}

function getSprint(date = getJakartaDate()) {
  const year = date.getFullYear();
  const month = date.getMonth();

  // hari pertama bulan ini
  const firstDay = new Date(year, month, 1);

  // cari Kamis pertama bulan ini
  const firstThursday = new Date(firstDay);

  while (firstThursday.getDay() !== 4) {
    firstThursday.setDate(firstThursday.getDate() + 1);
  }

  // kalau sebelum Kamis pertama,
  // berarti masih Sprint terakhir bulan sebelumnya
  if (date < firstThursday) {
    return getSprint(new Date(year, month, 0));
  }

  const diffDays = Math.floor((date - firstThursday) / (1000 * 60 * 60 * 24));

  return Math.floor(diffDays / 7) + 1;
}
function getShift(date = getJakartaDate()) {
  const hour = date.getHours();

  if (hour >= 8 && hour < 12) return 1;
  if (hour >= 12 && hour < 16) return 2;
  if (hour >= 16 && hour < 20) return 3;

  return null;
}

function isMyLuvOnDuty(date = getJakartaDate()) {
  const sprint = getSprint(date);
  const shift = getShift(date);

  if (!shift) {
    return false;
  }

  return schedule[sprint]?.[shift] === "myluv";
}

module.exports = {
  getJakartaDate,
  getSprint,
  getShift,
  isMyLuvOnDuty,
};
