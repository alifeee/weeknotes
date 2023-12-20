module.exports = function (eleventyConfig) {
  // pass everything in public to root
  eleventyConfig.addPassthroughCopy({ public: "/" });

  // add date handler
  eleventyConfig.addFilter("dateDisplay", (dateObj) => {
    let date = new Date(dateObj);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  // add handler to convert 2023-51 -> "2023 week 51"
  eleventyConfig.addFilter("weeknoteTitle", (filename) => {
    let [year, week] = filename.split("-");
    return `${year} week ${week}`;
  });

  // add handler to reverse a list (not mutating it)
  eleventyConfig.addFilter("reversed", (arr) => {
    return [...arr].reverse();
  });

  // add handler to convert date to ISO string
  eleventyConfig.addFilter("isoDate", (dateObj) => {
    let date = new Date(dateObj);
    return date.toISOString();
  });

  // add handler to return current day for rss feed
  eleventyConfig.addFilter("getNowDate", () => {
    let date = new Date();
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  });
};
