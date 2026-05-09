// utility functions to
// help with formatting and parsing data

const pad = (number) => number?.toString().padStart(2, "0");

const makeEpisodeCode = (season, episode) =>
  ` - S${pad(season)}E${pad(episode)}`;
const makeEpisodeTitle = (name, season, episode) =>
  `${name}${season ? makeEpisodeCode(season, episode) : ""}`;

const parseFromAPI = (html) => {
  const parser = new DOMParser();
  return parser.parseFromString(html, "text/html");
};

export {pad, makeEpisodeTitle, parseFromAPI};
