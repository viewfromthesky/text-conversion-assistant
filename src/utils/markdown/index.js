export function writeHeading(text, hLevel, dialect) {
  switch(dialect) {
    case 'slack':
      return `*${text}*`;

    default:
      return `${"#".repeat(hLevel)} ${text}`;
  }
}

export function writeUlItem(text) {
  return `* ${text}`;
}

export function writeLink(text, url) {
  return `[${text}](${url})`;
}

export function writeItalicText(text, dialect) {
  switch(dialect) {
    case 'slack':
      return `_${text}_`;

    default:
      return `*${text}*`;
  }
}

export function writeBoldText(text, dialect) {
  switch(dialect) {
    case 'slack':
      return `*${text}*`;
    default:
      return `**${text}**`;
  }
}
