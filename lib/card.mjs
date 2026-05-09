import {pad, makeEpisodeTitle, parseFromAPI} from "./helpers.mjs";

const createCard = (
  template,
  {id, image: {medium}, name, summary, season, number}
) => {
  const card = document.getElementById(template).content.cloneNode(true);
  card.querySelector('[data-episode="title"]').textContent = makeEpisodeTitle(
    name,
    season,
    number
  );
  card.querySelector('[data-episode="summary"]').textContent =
    parseFromAPI(summary).body.textContent;
  card.querySelector('[data-episode="image"]').src = medium;

  return card;
};

export {createCard};
