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
        const temp = await fetchShows();
        state.showCache = temp.sort((a, b) => a.name.localeCompare(b.name));
        fetchStatus.textContent = "";
    } catch (error) {
        fetchStatus.textContent = error.message;
        return;
    }
    setupShowSelector();
    renderShows();
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
    defaultOpt.value = "";

    const showOpts = state.showCache.map((sh) => {
        const opt = document.createElement("option");
        opt.textContent = sh.name;
        opt.value = sh.id;
        return opt;
    });
    showSlector.replaceChildren(defaultOpt, ...showOpts);

    showSlector.addEventListener("change", (e) => {
        console.log(e.target.value);
        if (e.target.value !== "") {
            renderEpisodes(e.target.value);
        } else {
            renderShows();
        }
    });
}

function renderShows() {
    const showContainer = document.getElementById("show-cards");
    showContainer.replaceChildren(...createShowCards());
}

function createShowCards() {
    const showTemplate = document.getElementById("show-template");
    const cards = state.showCache.map((sh) => {
        const clone = showTemplate.content.cloneNode(true);
        clone.querySelector(".show-name").textContent = sh.name;
        clone.querySelector(".show-img").src = sh.image?.medium;
        clone.querySelector(".show-img").alt = sh.name;
        clone.querySelector(".show-summary").textContent = htmlToText(
            sh.summary,
        );
        clone.querySelector(".show-genres").textContent = sh.genres.join(" | ");
        clone.querySelector(".show-status").textContent = sh.status;
        clone.querySelector(".show-rating").textContent = sh.rating.average;
        clone.querySelector(".show-runtime").textContent = `${sh.runtime} mins`;

        clone
            .querySelector(".show-card")
            .addEventListener("click", () => handleShowClick(sh.id));
        return clone;
    });
    return cards;
}

function handleShowClick(showId) {
    console.log(showId);
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

function composeEpisodeCodeAndName(episode) {}

// show/episode summary from API is a html string, need to convert to regular string
function htmlToText(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    return doc.body.textContent;
}

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
