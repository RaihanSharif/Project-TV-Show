import { fetchShows, fetchEpisodes } from "./fetchTVData.js";

const state = {
    // "shows" or "episodes", determines behaviour of search, dropdown etc.
    view: "shows",
    showCache: [],
    episodeCache: {},
};

const fetchStatus = document.getElementById("fetch-status");

async function setup() {
    // cache shows on initial setup
    try {
        state.showCache = await fetchShows();
        fetchStatus.textContent = "";
    } catch (error) {
        fetchStatus.textContent = error.message;
        return;
    }
    setupShowSelector();
}

// fetch episodes from cache or API, or show error message
async function getShowEpisodes(showId) {
    try {
        return (state.episodeCache[showId] ??= await fetchEpisodes(showId));
    } catch (error) {
        fetchStatus.textContent = error.message;
        return;
    }
}

function setupShowSelector() {
    const showSlector = document.getElementById("show-selector");
    const defaultOpt = document.createElement("option");
    defaultOpt.selected = true;
    defaultOpt.textContent = "-- SELECT A SHOW --";
    defaultOpt.value = null;

    const showOpts = state.showCache.map((sh) => {
        const opt = document.createElement("option");
        opt.textContent = sh.name;
        opt.value = sh.id;
        return opt;
    });
    showSlector.replaceChildren(defaultOpt, ...showOpts);

    showSlector.addEventListener("change", (e) => {
        if (e.target.value) {
            renderEpisodes(e.target.value);
        }
        return;
    });
}

async function renderEpisodes(showId) {
    const shows = await getShowEpisodes(showId);
    // build episode cards
    // attach episode cards to container

    // toggle hidden
    state.view = "show";
    changeVisibility();
    return;
}

/*
 UTILITY FUNCTIONS
*/

function changeVisibility() {
    const showControls = document.getElementById("show-controls");
    const showContainer = document.getElementById("show-cards");

    const episodeControls = document.getElementById("episode-controls");
    const episodeContainer = document.getElementById("episode-cards");

    if (state.view === "show") {
        showControls.classList.remove("hidden");
        showContainer.classList.remove("hidden");

        episodeContainer.classList.add("hidden");
        episodeControls.classList.add("hidden");
    } else {
        showControls.classList.add("hidden");
        showContainer.classList.add("hidden");

        episodeContainer.classList.remove("hidden");
        episodeControls.classList.remove("hidden");
    }
}

window.onload = setup;
