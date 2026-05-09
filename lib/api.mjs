import {state, updateEpisodeState} from "./main.mjs";

async function fetchEpisodes() {
  const response = await fetch("https://api.tvmaze.com/shows/82/episodes");
  const data = await response.json();
  return data;
}

export {fetchEpisodes};
