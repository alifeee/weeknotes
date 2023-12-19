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
};
