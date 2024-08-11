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

document.addEventListener("DOMContentLoaded", () => {
  let span = document.getElementById("iso-week-number");
  let isoweek = getTodaysISOWeekNumber();
  if (isoweek.toString().match("^[1-5]?[0-9]$")) {
    span.innerHTML = isoweek;
    return 1;
  }
  span.innerHTML = "[N/A, JavaScript failed]";
});
