const markdownIt = require("markdown-it");
const isoWeek = require("./isoweek");

// use the same slugifier that Markdown-All-In-One uses, as I usually use this to make the TOCs
// so that heading URL slugs are the same as TOC slugs
// from https://github.com/yzhang-gh/vscode-markdown/blob/895dfe3a8a78f41aba59063cecec82e8c29196ac/src/util/slugify.ts#L179
const Regexp_Github_Punctuation = /[^\p{L}\p{M}\p{Nd}\p{Nl}\p{Pc}\- ]/gu;
function mdInlineToPlainText(text, env) {
  const engine = new markdownIt("commonmark");
  const inlineTokens = engine.parseInline(text, env)[0].children;

  return inlineTokens.reduce((result, token) => {
    switch (token.type) {
      case "image":
      case "html_inline":
        return result;
      default:
        return result + token.content;
    }
  }, "");
}
function slugify(slug, env) {
  slug = mdInlineToPlainText(slug, env)
    .replace(Regexp_Github_Punctuation, "")
    .toLowerCase()
    .replace(/ /g, "-");
  return slug;
}

module.exports = function (eleventyConfig) {
  eleventyConfig.ignores.add("README.md");
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

  // add handler to turn "2023-51" into "how many days ago was 2023-51"
  eleventyConfig.addFilter("daysago", (fileslug) => {
    const [year, week] = fileslug.split("-");
    let weeknote_date = isoWeek.isoWeekToDate(year, week); // monday
    weeknote_date = isoWeek.addDays(weeknote_date, 6); // sunday
    const today_date = new Date();
    const diffTime = Math.abs(today_date - weeknote_date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
  // add handler to get random number from 0 to 1
  eleventyConfig.addFilter("random", () => Math.random());
  // add handler to modulo a number
  eleventyConfig.addFilter("modulo", (num, modulo) => num % modulo);
  // add handler for "greater than"
  eleventyConfig.addFilter("gt", (num, comp) => num > comp);

  // add helper handler to view data as json
  eleventyConfig.addFilter("json", (obj) => JSON.stringify(obj));

  // create a new markdown-it instance with the plugin
  const markdownItAnchor = require("markdown-it-anchor");
  const markdownLib = markdownIt({ html: true }).use(markdownItAnchor, {
    slugify,
  });
  // replace the default markdown-it instance
  eleventyConfig.setLibrary("md", markdownLib);
};

module.exports.config = {
  markdownTemplateEngine: false,
};
