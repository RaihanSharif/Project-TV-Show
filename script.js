/** Sets up the episode display */
function setup() {
  const allEpisodes = getAllEpisodes();
  const root = document.getElementById("root");
  const episodeCards = allEpisodes.map((episode) =>
    episodeCard("episode-template", episode)
  );
  episodeCards.forEach((card) => {
    root.appendChild(card);
  });
}

/**
 * Creates episode card from template
 * @param {string} template - Template ID to clone
 * @param {object} episode - Episode data with id, image, name, summary, season, number
 * @returns {Element} Card fragment
 */
const episodeCard = (
  templateId,
  {id, image: {medium}, name, summary, season, number}
) => {
  const card = document.getElementById(templateId).content.cloneNode(true);
  card.querySelector('[data-episode="title"]').textContent = name;
  card.querySelector('[data-episode="code"]').textContent = makeEpisodeCode(
    season,
    number
  );
  card.querySelector('[data-episode="summary"]').textContent =
    parseFromAPI(summary).body.textContent;
  card.querySelector('[data-episode="image"]').src = medium;

  return card;
};

/**
 * @param {number} number
 * @returns {string} Zero-padded number
 */
const pad = (number) => number.toString().padStart(2, "0");

/**
 * @param {number} season
 * @param {number} episode
 * @returns {string} Format: SXXEXX
 */
const makeEpisodeCode = (season, episode) => `S${pad(season)}E${pad(episode)}`;

/**
 * @param {string} html
 * @returns {Document} Parsed HTML from TV Maze API (it sends <p> tags) - we don't want to set innerHTML to avoid XSS injection attacks
 */
const parseFromAPI = (html) => {
  const parser = new DOMParser();
  return parser.parseFromString(html, "text/html");
};

window.onload = setup;
