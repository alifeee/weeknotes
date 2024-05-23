const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

let DEBUG = false;

/**
 * Returns an rgb colour for an arbitrary string, like rgb(50, 120, 100)
 * @param {string} str
 * @returns string
 */
function colourhash(str) {
  let r = 0,
    g = 0,
    b = 0;
  for (let i = 0; i < str.length; i++) {
    r += str.charCodeAt(i);
    g += str.charCodeAt(i) * i;
    b += str.charCodeAt(i) * (i + 1);
  }
  function cap(x) {
    return x % 156;
  }
  return `rgb(${cap(r)}, ${cap(g)}, ${cap(b)})`;
}

/**
 * Returns the number of ISO weeks in a year
 * @param {int} y The year, e.g., "2024"
 * @returns int
 */
function getISOWeeks(y) {
  var d, isLeap;
  d = new Date(y, 0, 1);
  isLeap = new Date(y, 1, 29).getMonth() === 1;
  //check for a Jan 1 that's a Thursday or a leap year that has a Wednesday jan 1. Otherwise it's 52
  return d.getDay() === 4 || (isLeap && d.getDay() === 3) ? 53 : 52;
}

/**
 * Calculate the number of weeks in between two dates
 *
 * @param {str} date1 specific week like "2024-12"
 * @param {str} date2 specific week like "2024-20"
 * @returns {int} Difference in weeks between two dates, e.g., "8" for the above examples
 *
 * The second date must be after the first
 */
function diffDates(date1, date2) {
  // return number of weeks between dates formatted like "2024-12"
  const [year1, week1] = date1.split("-");
  const [year2, week2] = date2.split("-");
  if (year2 < year1) throw Error("second date must be in the future");
  let weekdiff = week2 - week1;
  for (y = year1; y < year2; y++) {
    weekdiff += getISOWeeks(y);
  }
  return weekdiff;
}

/**
 * Get a column for a 2D array
 * @param {int} col The column to index
 * @returns {Array} The column as a 1D array
 */
Array.prototype.getcol = function (col) {
  return this.map((x) => x[col]);
};

/**
 * Returns a 2D array with one column replaced
 * @param {int} col The index to replace the column
 * @param {Array} arr The column to replace as a 1D array
 * @returns {Array} 2D array with new column
 */
Array.prototype.withcol = function (col, arr) {
  if (this.length != arr.length)
    throw Error(
      `col is wrongly sized (length ${arr.length}) for array (length ${this.length})`
    );
  return this.map((row, rowindex) => {
    return row.map((cell, colindex) => {
      if (colindex == col) {
        return arr.at(rowindex);
      } else return cell;
    });
  });
};

/**
 * Returns a copy of a 2D array with one column removed
 * @param {int} col The index of the column to remove
 * @returns {Array} 2D array with removed column
 */
Array.prototype.withoutcol = function (col) {
  return this.map((row, rowindex) => {
    return row.filter((cell, colindex) => {
      return colindex != col;
    });
  });
};

/**
 * Combine self with an array, like XOR
 * @param {Array} arr2
 * @returns {Array}
 *
 * e.g., if self is
 *   [0, 0, 1, 0]
 * and arr2 is
 *   [0, 1, 0, 0]
 * return is
 *   [0, 1, 1, 0]
 *
 * Cannot combine arrays that would result in a zero if XOR'd,
 *   i.e., cannot combine arrays with non-nullish items in the same indexes
 *   e.g., cannot combine [0, 1, 0] and [0, 1, 1] because both 2nd items are non-nullish
 */
Array.prototype.combine = function (arr2) {
  if (this.length != arr2.length)
    throw Error("can't combine different length arrays");
  return this.map((value, index) => {
    v1 = this.at(index);
    v2 = arr2.at(index);
    if (v1 && v2) throw Error(`same elements at position ${index}!`);
    return v1 || v2;
  });
};

/**
 * Main function called by Eleventy to turn this file into computed data
 * @returns {Object} An object containing relevant information
 *
 * Input object is a YAML file formatted like
 *   2024-12:
 *   - dogs
 *   - cats
 *   2024-13:
 *   - dogs
 *   - snakes
 *   2024-14:
 *   - parrots
 *   - cats
 *   2024-15:
 *   - dogs
 *   - snakes
 * Output is an object with several keys, which are:
 *
 * ## table
 *   An object which can be used to display topics adjacent to notes, e.g., for the above input, would be:
 *    {
 *       '2024-15': [
 *         { topic: 'dogs', goUp: undefined },
 *         { topic: 'snakes', goUp: undefined }
 *       ],
 *       '2024-14': [
 *         { topic: undefined, goUp: undefined },
 *         { topic: 'cats', goUp: undefined }
 *       ],
 *       '2024-13': [
 *         { topic: 'dogs', goUp: 2 },
 *         { topic: 'snakes', goUp: 2 }
 *       ],
 *       '2024-12': [
 *         { topic: 'dogs', goUp: 1 },
 *         { topic: 'cats', goUp: 2 }
 *       ]
 *     }
 *   "topic" is the topic, or undefined if there is not one in that column
 *   "goUp" is how many weeks one must ascend to reach that topic again,
 *     or undefined if the topic is not mentioned above
 * ## colours
 *   this is information to generate a CSS file. For the example above, it is
 *   {
 *     dogs: 'rgb(117, 38, 155)',
 *     cats: 'rgb(115, 50, 9)',
 *     snakes: 'rgb(21, 44, 65)'
 *   }
 *   It uses the string-colour-hashing function above
 * ## maxlength
 *   This is the length of each row, so here it is:
 *     2
 */
function gettable() {
  // load the YAML file from the _data directory
  const fname = path.join(__dirname, "topics.yaml");
  let all_topics = yaml.safeLoad(fs.readFileSync(fname, "utf8"));

  if (DEBUG) console.log("all_topics", all_topics);

  // object of unique topics and how often they appear, e.g.,
  // {
  //   dogs: 3,
  //   cats: 2,
  //   snakes: 2,
  //   parrots: 1
  // }
  let headers = {};
  for (const [week, topics] of Object.entries(all_topics)) {
    for (const topic of topics) {
      if (Object.keys(headers).includes(topic)) {
        headers[topic]++;
      } else {
        headers[topic] = 1;
      }
    }
  }
  if (DEBUG) console.log("headers", headers);

  // filter out topics with only 1 reference, e.g.,
  // {
  //   dogs: 3,
  //   cats: 2,
  //   snakes: 2
  // }
  // headers = Object.fromEntries(
  //   Object.entries(headers).filter((db) => db.at(1) > 1)
  // );
  if (DEBUG) console.log("headers with uniques removed", headers);

  // turn headers into an array, e.g.,
  headers = Object.keys(headers);
  if (DEBUG) console.log("headers (array)", headers);

  // filter all_topics to contain only topics in headers
  all_topics = Object.fromEntries(
    Object.entries(all_topics).map(([key, vals]) => {
      return [key, vals.filter((v) => headers.includes(v))];
    })
  );
  if (DEBUG) console.log("all_topics filtered", all_topics);

  // sort notes by time, backwards, for example like
  //   [ '2024-15', '2024-14', '2024-13', '2024-12' ]
  notes_sorted_by_time = Object.keys(all_topics).toSorted((note1, note2) => {
    const [year1, week1] = note1.split("-");
    const [year2, week2] = note2.split("-");
    if (year1 == year2) {
      return week2 - week1;
    } else {
      return year2 - year1;
    }
  });
  if (DEBUG) console.log("notes_sorted_by_time", notes_sorted_by_time);

  // generate 2D array from topics.
  // Example:
  //   [
  //     [ 'dogs', undefined, 'snakes' ],
  //     [ undefined, 'cats', undefined ],
  //     [ 'dogs', undefined, 'snakes' ],
  //     [ 'dogs', 'cats', undefined ]
  //   ]
  let topictable = [];
  for (note_title of notes_sorted_by_time) {
    let topicrow = [...Array(headers.length)];
    let topics = all_topics[note_title];
    for (topic of topics) {
      topicrow[headers.indexOf(topic)] = topic;
    }
    topictable.push(topicrow);
  }
  if (DEBUG) console.log("topictable", topictable);

  // squish table down, if columns can be coerced left
  // Example becomes (squishing snakes column into cats column):
  //   [
  //     [ 'dogs', 'snakes' ],
  //     [ undefined, 'cats' ],
  //     [ 'dogs', 'snakes' ],
  //     [ 'dogs', 'cats' ]
  //   ]
  while (true) {
    // is table squishable?
    let isquishedit = false;
    for (let i = 0; i < topictable[0].length - 1; i++) {
      for (let j = i + 1; j < topictable[0].length; j++) {
        if (DEBUG) console.log(`checking col ${i} and col ${j}`);
        col1 = topictable.getcol(i);
        col2 = topictable.getcol(j);
        if (DEBUG)
          console.log(
            ` can ${JSON.stringify(col1)} include ${JSON.stringify(col2)}`
          );
        try {
          let combined = col1.combine(col2);
          if (DEBUG) console.log("yes");
          topictable = topictable.withcol(i, combined);
          topictable = topictable.withoutcol(j);
          isquishedit = true;
        } catch {
          if (DEBUG) console.log("no");
        }
        if (isquishedit) break;
      }
      if (isquishedit) break;
    }
    if (isquishedit) {
      // fine
    } else {
      break;
    }
  }
  if (DEBUG) console.log("topictable, squished", topictable);

  // turn each row from an array to an object, and add a "goUp" key
  //   this is how far (in weeks) to go up until the topic is seen again, or undefined
  // example turns into (this is a list of rows)
  //   [
  //     { topic: 'dogs', goUp: undefined },
  //     { topic: 'snakes', goUp: undefined }
  //   ],
  //   [
  //     { topic: undefined, goUp: undefined },
  //     { topic: 'cats', goUp: undefined }
  //   ],
  //   [ { topic: 'dogs', goUp: 2 }, { topic: 'snakes', goUp: 2 } ],
  //   [ { topic: 'dogs', goUp: 1 }, { topic: 'cats', goUp: 2 } ]
  // ]
  let lastSeen = {};
  topictable = topictable.map((row, rowindex) => {
    return row.map((topic, colindex) => {
      let goUp;
      if (Object.keys(lastSeen).includes(topic)) {
        goUp = diffDates(notes_sorted_by_time[rowindex], lastSeen[topic]);
      }
      lastSeen[topic] = notes_sorted_by_time[rowindex];
      return {
        topic: topic,
        goUp,
      };
    });
  });
  if (DEBUG) console.log("topictable, with goUp", topictable);

  // length of array
  maxlength = topictable.at(0).length;

  // turn array into an object with key of time, e.g. the above array into
  // {
  //   '2024-15': [
  //     { topic: 'dogs', goUp: undefined },
  //     { topic: 'snakes', goUp: undefined }
  //   ],
  //   '2024-14': [
  //     { topic: undefined, goUp: undefined },
  //     { topic: 'cats', goUp: undefined }
  //   ],
  //   '2024-13': [ { topic: 'dogs', goUp: 2 }, { topic: 'snakes', goUp: 2 } ],
  //   '2024-12': [ { topic: 'dogs', goUp: 1 }, { topic: 'cats', goUp: 2 } ]
  // }
  topictable = Object.assign(
    ...notes_sorted_by_time.map((k, i) => ({ [k]: topictable[i] }))
  );

  return {
    table: topictable,
    colours: Object.fromEntries(headers.map((h) => [h, colourhash(h)])),
    maxlength,
  };
}

if (typeof require !== "undefined" && require.main === module) {
  DEBUG = true;
  data = gettable();
  console.log(data.table);
  console.log(data.colours);
  console.log(data.maxlength);
}

module.exports = gettable;
