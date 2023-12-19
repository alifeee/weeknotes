module.exports = function (eleventyConfig) {
  // pass everything in public to root
  eleventyConfig.addPassthroughCopy({ public: "/" });
};
