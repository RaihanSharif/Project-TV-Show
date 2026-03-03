import { fetchShows, fetchEpisodes } from "./fetchTVData.js";

const state = {
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
    showSearch();
    renderShows();

    const backButton = document.getElementById("back-to-shows");
    backButton.addEventListener("click", () => {
        setupShowSelector(); // inefficient, but works
        document.getElementById("show-search").value = ""; // reset search input text
        renderShows();
    });
}

// fetch episodes from cache or API, or show error message
async function getShowEpisodes(showId) {
    try {
        return (state.episodeCache[showId] ??= await fetchEpisodes(showId));
    } catch (error) {
        fetchStatus.textContent = error.message;
    }
}

function setupShowSelector() {
    const showSelector = document.getElementById("show-selector");
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
    showSelector.replaceChildren(defaultOpt, ...showOpts);

    showSelector.addEventListener("change", (e) => {
        if (e.target.value !== "") {
            const name = showSelector.options[showSelector.selectedIndex].text;
            displayEpisodesPage(e.target.value, name);
        } else {
            renderShows();
        }
    });
}

function showSearch() {
    const showSearchInput = document.getElementById("show-search");
    showSearchInput.addEventListener("input", (e) => {
        const searchStr = e.target.value.toLowerCase();
        const filtered = state.showCache.filter((show) => {
            const { name, genres, summary } = show;
            if (
                name.toLowerCase().includes(searchStr) ||
                genres.join(" ").toLowerCase().includes(searchStr) ||
                summary.toLowerCase().includes(searchStr)
            ) {
                return show;
            }
        });

        renderShows(filtered);
    });
}

async function displayEpisodesPage(showId, showName) {
    const episodesHeading = document.getElementById("episodes-heading");
    episodesHeading.textContent = showName;
    const episodes = await getShowEpisodes(showId);
    document.getElementById("episode-search").value = ""; // reset search input text
    setupEpisodeSelector(episodes);
    searchEpisodes(episodes);
    renderEpisodes(episodes);
}

function renderShows(showList = state.showCache) {
    const showContainer = document.getElementById("show-cards");
    showContainer.replaceChildren(...createShowCards(showList));
    changeVisibility("show");
}

/**
 * Takes an array of show objects, and returns an array containing
 * card elements. By default uses the shows array in the cache.
 * @param {Show} showList an array of show objects
 * @returns array of card elements
 */
function createShowCards(showList = state.showCache) {
    const showTemplate = document.getElementById("show-template");
    const cards = showList.map((sh) => {
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
            .querySelector(".show-name")
            .addEventListener("click", async (e) =>
                displayEpisodesPage(sh.id, sh.name),
            );
        return clone;
    });
    return cards;
}

// each time a show is selected or clicked
// the episode cards must be re-generated
function renderEpisodes(episodeList) {
    const episodeCards = createEpisodeCards(episodeList);
    const episodeContainer = document.getElementById("episode-cards");
    episodeContainer.replaceChildren(...episodeCards);
    // searchEpisodes(episodeList);

    // toggle hidden
    changeVisibility("episode");
}

function createEpisodeCards(episodeList) {
    const episodeTemplate = document.getElementById("episode-template");
    const cards = episodeList.map((ep) => {
        const clone = episodeTemplate.content.cloneNode(true);
        clone.querySelector(".episode-name").textContent =
            `${ep.name} - ${seasonEpisodeCode(ep)}`;
        clone.querySelector(".episode-img").src = ep.image?.medium;
        clone.querySelector(".episode-img").alt = ep.name;
        clone.querySelector(".episode-summary").textContent = htmlToText(
            ep.summary,
        );
        return clone;
    });
    return cards;
}

function setupEpisodeSelector(episodeList) {
    const episodeSelector = document.getElementById("episode-selector");
    const defaultOpt = document.createElement("option");
    defaultOpt.selected = true;
    defaultOpt.textContent = "-- SELECT AN EPISODE --";
    defaultOpt.value = "";

    const episodeOpts = episodeList.map((ep) => {
        const opt = document.createElement("option");
        opt.textContent = `${seasonEpisodeCode(ep)} - ${ep.name}`;
        opt.value = ep.id;
        return opt;
    });

    episodeSelector.replaceChildren(defaultOpt, ...episodeOpts);

    episodeSelector.addEventListener("change", (e) => {
        const val = e.target.value;

        if (val === "") {
            renderEpisodes(episodeList);
        } else {
            const filtered = episodeList.filter(
                (ep) => ep.id === Number(e.target.value),
            );
            renderEpisodes(filtered);
        }
    });
}

function searchEpisodes(episodeList) {
    const searchEpisodesInput = document.getElementById("episode-search");

    // instead of addListener to avoid listener stacking
    searchEpisodesInput.oninput = (e) => {
        const searchStr = e.target.value.toLowerCase();
        const filtered = episodeList.filter(
            (ep) =>
                ep.name.toLowerCase().includes(searchStr) ||
                ep.summary.toLowerCase().includes(searchStr),
        );

        renderEpisodes(filtered);
    };
}

/*
 UTILITY FUNCTIONS
*/

function seasonEpisodeCode(episode) {
    return `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;
}

// show/episode summary from API is a html string, need to convert to regular string
function htmlToText(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    return doc.body.textContent;
}

// input "show" | "episode"
// toggles visibility of show/epsiode
function changeVisibility(type) {
    const showControls = document.getElementById("show-controls");
    const showContainer = document.getElementById("show-cards");

    const episodeControls = document.getElementById("episode-controls");
    const episodeContainer = document.getElementById("episode-cards");
    const episodeHeading = document.getElementById("episodes-heading");

    if (type === "show") {
        showControls.classList.remove("hidden");
        showContainer.classList.remove("hidden");

        episodeContainer.classList.add("hidden");
        episodeControls.classList.add("hidden");
        episodeHeading.classList.add("hidden");
    } else {
        showControls.classList.add("hidden");
        showContainer.classList.add("hidden");

        episodeContainer.classList.remove("hidden");
        episodeControls.classList.remove("hidden");
        episodeHeading.classList.remove("hidden");
    }
}

window.onload = setup;
