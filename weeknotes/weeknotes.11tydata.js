module.exports = function () {
  return {
    layout: "base",
    comments: true,
    permalink: "/{{ page.fileSlug }}/",
    tags: ["weeknotes"],
    eleventyComputed: {
      title: (data) => `alifeee's weeknotes - ${data.page.fileSlug}`,
    },
  };
};
