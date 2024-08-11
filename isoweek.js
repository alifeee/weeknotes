/**
 * Get the date from an ISO 8601 week and year
 *
 * modified from https://stackoverflow.com/questions/16590500/calculate-date-from-week-number-in-javascript
 * https://en.wikipedia.org/wiki/ISO_week_date
 *
 * @param {number} year ISO year
 * @param {number} week ISO 8601 week number
 *
 * Examples:
 *  getDateOfIsoWeek(1976, 53) -> Mon Dec 27 1976
 *  getDateOfIsoWeek(1978, 1) -> Mon Jan 02 1978
 *  getDateOfIsoWeek(1980, 1) -> Mon Dec 31 1979
 *  getDateOfIsoWeek(2020, 53) -> Mon Dec 28 2020
 *  getDateOfIsoWeek(2021, 1) -> Mon Jan 04 2021
 *  getDateOfIsoWeek(2023, 0) -> Invalid (no week 0)
 *  getDateOfIsoWeek(2023, 53) -> Invalid (no week 53 in 2023)
 */
function isoWeekToDate(year, week) {
  week = parseFloat(week);
  year = parseFloat(year);

  if (week < 1 || week > 53) {
    throw new RangeError("ISO 8601 weeks are numbered from 1 to 53");
  } else if (!Number.isInteger(week)) {
    throw new TypeError("Week must be an integer");
  } else if (!Number.isInteger(year)) {
    throw new TypeError("Year must be an integer");
  }

  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const dayOfWeek = simple.getDay();
  const isoWeekStart = simple;

  // Get the Monday past, and add a week if the day was
  // Friday, Saturday or Sunday.

  isoWeekStart.setDate(simple.getDate() - dayOfWeek + 1);
  if (dayOfWeek > 4) {
    isoWeekStart.setDate(isoWeekStart.getDate() + 7);
  }

  // The latest possible ISO week starts on December 28 of the current year.
  if (
    isoWeekStart.getFullYear() > year ||
    (isoWeekStart.getFullYear() == year &&
      isoWeekStart.getMonth() == 11 &&
      isoWeekStart.getDate() > 28)
  ) {
    throw new RangeError(`${year} has no ISO week ${week}`);
  }

  return isoWeekStart;
}

// from https://stackoverflow.com/questions/6117814/get-week-of-year-in-javascript-like-in-php
function getTodaysISOWeekNumber() {
  let today = new Date();
  var d = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() - 1)
  );
  var dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function addDays(date, days) {
  var date = new Date(date.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

module.exports = {
  getTodaysISOWeekNumber,
  isoWeekToDate,
  addDays,
};
