import {
  writeHeading,
  writeLink,
  writeUlItem
} from "../../utils/markdown/index.js";

/** @typedef {import('./index.d.ts').WeekContent} WeekContent */
/** @typedef {import('./index.d.ts').Release} Release */
/** @typedef {import('./index.d.ts').Story} Story */

const KNOWN_CATEGORIES = {
  features: {
    name: "Features",
    order: 0
  },
  fixes: {
    name: "Fixes",
    order: 1
  }
};

/**
 * @param {Array<Release>} releases
 * @param {string} dialect
 * @returns
 */
function addLinesFromReleases(releases, dialect) {
  return releases.reduce((lines, release) => {
    lines.push(writeHeading(release.releaseName, 1, dialect), null);

    /** @type {[string, Story[]][]} */
    const storiesByCategory = release.stories.reduce((map, story) => {
      const idx = map.findIndex(([key]) => key === story.categoryName);

      if(idx > -1) {
        map[idx][1].push(story);
      } else {
        map.push([story.categoryName, [story]]);
      }

      return map;
    }, []);

    storiesByCategory.sort(([categoryA], [categoryB]) => {
      const catA = Object.values(KNOWN_CATEGORIES).find((cat) =>
        cat.name === categoryA);
      const catB = Object.values(KNOWN_CATEGORIES).find((cat) =>
        cat.name === categoryB);

      if(!catA || !catB) {
        return 0;
      }

      return catA.order - catB.order;
    });

    storiesByCategory.forEach(([categoryName, stories]) => {
      lines.push(writeHeading(categoryName, 2, dialect));

      // #XXX: "Some name" - @Author1
      stories.forEach((story) => {
        lines.push(writeUlItem(
          `${writeLink(story.id, story.url)}: "${story.name}" - ${
            story.authors.map((author) => `@${author}`).join(", ")
          }`
        ));
      });

      lines.push(null);
    });

    return lines;
  }, []);
}

/**
*
* @param {WeekContent} notesData
*/
export default function convert(notesData, dialect) {
  const lines = addLinesFromReleases(notesData.releases, dialect);

  return lines.join("\n");
}
