import { fetchShows, fetchEpisodes } from "./fetchTVData.js";

const state = {
    showCache: [],
    episodeCache: {},
};

// Store references to frequently used DOM elements
const elements = {
    fetchStatus: document.getElementById("fetch-status"),

    showControls: document.getElementById("show-controls"),
    showSelector: document.getElementById("show-selector"),
    showSearch: document.getElementById("show-search"),
    showsCardContainer: document.querySelector(".show-cards"),

    episodeControls: document.getElementById("episode-controls"),
    episodeSelector: document.getElementById("episode-selector"),
    episodeSearch: document.getElementById("episode-search"),
    episodesPageHeading: document.getElementById("episodes-heading"),
    episodesCardContainer: document.querySelector(".episode-cards"),
    episodesSearchCount: document.getElementById("episode-count"),
};

async function setup() {
    // cache shows on initial setup
    try {
        const temp = await fetchShows();
        state.showCache = temp.sort((a, b) => a.name.localeCompare(b.name));
        elements.fetchStatus.textContent = "";
    } catch (error) {
        elements.fetchStatus.textContent = error.message;
        return;
    }

    // set up shows controls and back button once on page load
    populateShowSelector();
    initShowSelectorListener();
    searchShows();
    navigateToShowsPage();
    initBacktoShowsBtn();
}

// fetch episodes from cache or API, or show error message
async function getShowEpisodes(showId) {
    try {
        return (state.episodeCache[showId] ??= await fetchEpisodes(showId));
    } catch (error) {
        elements.fetchStatus.textContent = error.message;
    }
}

function navigateToShowsPage() {
    elements.showSelector.value = "";
    elements.showSearch.value = "";
    showShowsPage(); // removes hidden class from show elements
    renderShows();
}

async function navigateToEpisodesPage(showId, showName) {
    elements.episodeSelector.value = "";
    elements.episodeSearch.value = "";
    elements.episodesPageHeading.textContent = showName;

    const episodes = await getShowEpisodes(showId);

    // exit if no episodes loaded
    if (!episodes) {
        return;
    }

    showEpisodesPage(); // removes hidden class from episode elements
    populateEpisodeSelector(episodes);
    initEpisodeSelectListener(episodes);
    searchEpisodes(episodes);
    renderEpisodes(episodes);
}

function populateShowSelector() {
    const defaultOpt = document.createElement("option");
    defaultOpt.selected = true;
    defaultOpt.textContent = "-- SELECT A SHOW --";
    defaultOpt.value = "";
    defaultOpt.disabled = true;

    const showOpts = state.showCache.map((sh) => {
        const opt = document.createElement("option");
        opt.textContent = sh.name;
        opt.value = sh.id;
        return opt;
    });

    elements.showSelector.replaceChildren(defaultOpt, ...showOpts);
}

function initShowSelectorListener() {
    elements.showSelector.addEventListener("change", (e) => {
        const name =
            elements.showSelector.options[elements.showSelector.selectedIndex]
                .text;
        navigateToEpisodesPage(e.target.value, name);
    });
}

// searches across name, summary, and genres
function searchShows() {
    elements.showSearch.addEventListener("input", (e) => {
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

// attaches show cards to show card cotainer
function renderShows(showList = state.showCache) {
    elements.showsCardContainer.replaceChildren(...createShowCards(showList));
}

// creates show cards, and attaches listener to each show
//TODO: use event delegation
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
                navigateToEpisodesPage(sh.id, sh.name),
            );
        return clone;
    });
    return cards;
}

function populateEpisodeSelector(episodeList) {
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

    elements.episodeSelector.replaceChildren(defaultOpt, ...episodeOpts);
}

function initEpisodeSelectListener(episodeList) {
    elements.episodeSelector.onchange = (e) => {
        const val = e.target.value;

        if (val === "") {
            renderEpisodes(episodeList);
        } else {
            const filtered = episodeList.filter(
                (ep) => ep.id === Number(e.target.value),
            );
            renderEpisodes(filtered);
        }
    };
}

// searches name and summary of episode for matching string
function searchEpisodes(episodeList) {
    // instead of addListener to avoid listener stacking
    elements.episodeSearch.oninput = (e) => {
        const searchStr = e.target.value.toLowerCase();
        const filtered = episodeList.filter(
            (ep) =>
                ep.name.toLowerCase().includes(searchStr) ||
                ep.summary.toLowerCase().includes(searchStr),
        );

        renderEpisodes(filtered);

        // count string "disappears" if input box is empty
        if (searchStr.length > 0) {
            elements.episodesSearchCount.textContent = `${filtered.length}/${episodeList.length} results`;
        } else {
            elements.episodesSearchCount.textContent = "";
        }
    };
}

function renderEpisodes(episodeList) {
    const episodeCards = createEpisodeCards(episodeList);
    elements.episodesCardContainer.replaceChildren(...episodeCards);
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

// navigates from episodes page to shows page
function initBacktoShowsBtn() {
    document
        .getElementById("back-to-shows")
        .addEventListener("click", navigateToShowsPage);
}

/*
 UTILITY FUNCTIONS
*/

// format season and episode in into S01E02 format
function seasonEpisodeCode(episode) {
    return `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;
}

// show/episode summary from API is a html string, need to convert to regular string
function htmlToText(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    return doc.body.textContent;
}

// toggles visibility of show/epsiode
const hide = (el) => el.classList.add("hidden");
const show = (el) => el.classList.remove("hidden");

function showShowsPage() {
    show(elements.showControls);
    show(elements.showsCardContainer);
    hide(elements.episodesCardContainer);
    hide(elements.episodeControls);
    hide(elements.episodesPageHeading);
}

function showEpisodesPage() {
    hide(elements.showControls);
    hide(elements.showsCardContainer);
    show(elements.episodesCardContainer);
    show(elements.episodeControls);
    show(elements.episodesPageHeading);
}

window.onload = setup;
