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

  // add handler to add to value (for indexing)
  eleventyConfig.addFilter("add", (val, add) => val + add);
  // add handler to add 1 to value (for indexing)
  eleventyConfig.addFilter("mult", (val, mult) => val * mult);
  // add handler for fraction
  eleventyConfig.addFilter(
    "frac",
    (numerator, denominator) => numerator / denominator
  );
  // add handler for array length
  eleventyConfig.addFilter("objlength", (obj) => Object.keys(obj).length);
  // add handler to generate range
  eleventyConfig.addFilter("range", (to) => [...Array(to)]);
  // add handler to get key from object
  eleventyConfig.addFilter("get", (obj, key) => obj[key]);

  // add helper handler to view data as json
  eleventyConfig.addFilter("json", (obj) => JSON.stringify(obj));

  const markdownIt = require("markdown-it");
  // create a new markdown-it instance with the plugin
  const markdownItAnchor = require("markdown-it-anchor");
  const markdownLib = markdownIt({ html: true }).use(markdownItAnchor);
  // replace the default markdown-it instance
  eleventyConfig.setLibrary("md", markdownLib);
};
