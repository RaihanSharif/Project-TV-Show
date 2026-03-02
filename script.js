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
    defaultOpt.value = "none";

    const showOpts = state.showCache.map((sh) => {
        const opt = document.createElement("option");
        opt.textContent = sh.name;
        opt.value = sh.id;
        return opt;
    });

    showSlector.replaceChildren(defaultOpt, ...showOpts);
}

/*
 UTILITY FUNCTIONS
*/

window.onload = setup;
