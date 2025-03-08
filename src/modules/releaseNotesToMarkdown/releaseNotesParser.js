import parseNode from "../../parsers/bikeXMLParser/nodeParser.js";

const RELEASE_VER_REGEXP = /\d{4}\.\d{2}(\.\d{2,3})?(\sLTS)?/;

/**
 * @typedef {Object} Story
 * @property {string} categoryName
 * @property {string} id
 * @property {string} url
 * @property {string} name
 * @property {Array<string>} authors
*/

/**
 * @param {*} releaseNode
 * @returns {Array<Story>}
 */
function parseStories(releaseNode) {
  if (!releaseNode) return undefined;

  return releaseNode?.childNodes?.reduce((storiesArray, category) => {
    const [categoryName] = category.content;

    category?.childNodes?.forEach((releaseStory) => {
      const baseContent = releaseStory?.content?.[0];

      if(baseContent) {
        /** @type {string} */
        const textContent = baseContent.span?.[0];
        const name = textContent.match(/: ["“]([^"“”"]+)[”"]/)?.[1];
        const authorsStr = textContent.match(/[^\(]*\(([a-zA-Z,\s]+)\)[^\)]*$/)?.[1];

        /** @type {Story} */
        const story = {
          categoryName,
          id: baseContent.a?.[0]?._,
          name,
          url: baseContent.a?.[0]?.$?.href,
          authors: typeof authorsStr === "string" ?
            authorsStr.split(/,\s?/) :
            undefined
        };

        storiesArray.push(story);
      }
    });

    return storiesArray;
  }, []);
}

function parseRelease(releaseNode) {
  return {
    releaseName: releaseNode?.content?.[0],
    stories: parseStories(releaseNode)
  };
}

export default function parse(selection) {
  const releaseNodes = parseNode(selection);

  const versionNodes = [];
  // These will probably be additional text
  const otherNodes = [];

  releaseNodes.childNodes?.forEach((node) => {
    const contentIsRelease = RELEASE_VER_REGEXP.test(node?.content?.[0]);

    if(contentIsRelease) {
      versionNodes.push(node);
    } else {
      otherNodes.push(node);
    }
  });

  return {
    weekText: releaseNodes?.content?.[0],
    releases: versionNodes.map((node) => parseRelease(node))
  };
}
