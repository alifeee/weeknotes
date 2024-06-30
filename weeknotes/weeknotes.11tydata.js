const wordsPerMinute = 200;

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

module.exports = function () {
  return {
    layout: "weeknote",
    permalink: "/{{ page.fileSlug }}/",
    tags: ["weeknotes"],
    date: "git Created",
    eleventyComputed: {
      title: (data) => `alifeee's weeknotes - ${data.page.fileSlug}`,
      wordcount: (data) => {
        const inputPath = data.page.inputPath;
        const content = require("fs").readFileSync(inputPath, "utf-8");
        const words = content.split(/\s+/).length;
        const minutes = words / wordsPerMinute;
        return `<span class="words">
            ${numberWithCommas(words)} words, ${Math.ceil(
          minutes
        )} mins @ ${wordsPerMinute} wpm
        </span>
        `;
      },
      links: (data) => {
        const inputPath = data.page.inputPath;
        const content = require("fs").readFileSync(inputPath, "utf-8");
        const links = content.match(/https?:\/\//g);
        // return length
        return links
          ? `<span class="links">${links.length} links</span>`
          : '<span class="links">0 links</span>';
      },
    },
  };
};
