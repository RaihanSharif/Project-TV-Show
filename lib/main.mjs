import {createCard} from "./card.mjs";
import {handleSearch} from "./search.mjs";
import {createOption, handleSelect} from "./select.mjs";
import {fetchEpisodes} from "./api.mjs";
// State and Render

const state = {allEpisodes: [], currentEpisodes: []};

function updateEpisodeState(newEpisodes) {
  state.currentEpisodes = newEpisodes;
}

const getCardContainer = () => document.getElementById("card-container");
const getCountContainer = () => document.getElementById("count-container");
const getSelect = () => document.getElementById("episode-select");

// a generalised render function
// based on https://programming.codeyourfuture.io/data-flows/sprints/2/prep/#refactoring-to-state%2brender

const render = (data, container, template, creator) => {
  container.textContent = ""; // remember we clear up first
  const fragment = data.map((item) => creator(template, item));
  container.append(...fragment);
};

const init = async () => {
  try {
    const episodes = await fetchEpisodes();
    // populate state
    state.allEpisodes = episodes;
    state.currentEpisodes = episodes;
    // grab nodes from html
    const search = document.getElementById("episode-search");
    // listen for user events
    search.addEventListener("keyup", handleSearch);
    getSelect().addEventListener("change", handleSelect);
    // render UI
    render(
      state.currentEpisodes,
      getCardContainer(),
      "episode-card",
      createCard
    );
    render(
      [{name: "Choose one episode"}].concat(state.currentEpisodes),
      getSelect(),
      "option-template",
      createOption
    );
  } catch (error) {
    getCardContainer().textContent = `Something went wrong, sorry! ${error.message}`;
  }
};

window.onload = init;

export {
  state,
  render,
  updateEpisodeState,
  getCardContainer,
  getCountContainer,
  getSelect,
};
