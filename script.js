import { fetchShows, fetchEpisodes } from "./fetchTVData.js";

// Use closure to enclose the cache so it's only accessible
// through the getEpisodes() function. Reduce access, reduce corrption risk
const getEpisodes = (() => {
    const cache = {};

    return async function (showId) {
        if (!cache[showId]) {
            const response = await fetch(
                `https://api.tvmaze.com/shows/${showId}/episodes`,
            );
            cache[showId] = await response.json();
        }
        return cache[showId];
    };
})();

async function setup() {
    const shows = await fetchShows();
    renderShowCards(shows);
    homePageButton(shows);
}

function homePageButton(showList) {
    const header = document.querySelector("header");
    const logo = header.querySelector("h1");
    logo.addEventListener("click", () => renderShowCards(showList));
}

function renderShowCards(showList) {
    const showCards = buildShowCards(showList);
    const showCardContainer = document.getElementById("show-cards-container");
    const episodeCardContainer = document.getElementById(
        "episode-cards-container",
    );

    // shows the show cards and hides the episode cards
    showCardContainer.classList.remove("hidden");
    showCardContainer.replaceChildren(
        showCardContainer.firstElementChild,
        ...showCards,
    );
    episodeCardContainer.classList.add("hidden");
}

function buildShowCards(showList) {
    const template = document.getElementById("show-card-template");
    const showCards = showList.map((show) => {
        const clone = template.content.cloneNode(true);

        const title = clone.querySelector(".show-title");
        title.textContent = show.name;
        title.addEventListener("click", () => handleShowClick(show.id));

        clone.querySelector(".show-img").src = show.image?.medium;
        clone.querySelector(".show-img").alt = show.name;
        clone.querySelector(".show-summary").innerHTML = show.summary;
        clone.querySelector(".rating").textContent =
            `rating: ${show.rating.average}`;
        clone.querySelector(".genres").textContent = show.genres.join(", ");
        clone.querySelector(".status").textContent = show.status;
        clone.querySelector(".runtime").textContent = show.runtime;
        return clone;
    });
    return showCards;
}

// on click:
// get episodes for the show
// hide shows container
// populate episodes container with episode cards
// show episodes container
// show a back button which just hides the
// episodes container and shows the shows container
async function handleShowClick(showId) {
    alert("clicked on show: " + showId);
    const episodes = await getEpisodes(showId);
    renderEpisodeCards(episodes);
}

function buildEpisodeCards(episodeList) {
    const template = document.getElementById("episode-card-template");
    const cards = episodeList.map((episode) => {
        const clone = template.content.cloneNode(true);
        const title = `${episode.name} - S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;
        clone.querySelector(".episode-title-container").textContent = title;
        clone.querySelector(".episode-img").src = episode.image?.medium;
        clone.querySelector(".episode-img").alt = episode.name;
        clone.querySelector(".episode-desc").textContent =
            episode.summary.replace(/<[^>]*>/g, "");

        return clone;
    });
    return cards;
}

function renderEpisodeCards(episodeList) {
    const episodesContainer = document.getElementById(
        "episode-cards-container",
    );
    const showsContainer = document.getElementById("show-cards-container");
    showsContainer.classList.add("hidden");

    const cards = buildEpisodeCards(episodeList);

    const wrapper = episodesContainer.querySelector("#show-cards");
    wrapper.replaceChildren(...cards);
    episodesContainer.classList.remove("hidden");
    selectEpisodesSetup(episodeList);
    searchEpisodes(episodeList);
}

function selectEpisodesSetup(episodesList) {
    const selecElem = document.getElementById("select-episodes");
    const selectOpts = episodesList.map((ep) => {
        const opt = document.createElement("option");
        opt.value = ep.id;
        const title = `S${String(ep.season).padStart(2, "0")}E${String(ep.number).padStart(2, "0")} - ${ep.name}`;
        opt.textContent = title;
        return opt;
    });

    const defaultOption = document.createElement("option");
    defaultOption.value = "none";
    defaultOption.textContent = "-- SELECT EPISODE --";
    defaultOption.selected = true;
    selecElem.replaceChildren(defaultOption, ...selectOpts);

    selecElem.addEventListener("input", (e) =>
        handleSelectEpisode(e, episodesList),
    );
}

function handleSelectEpisode(event, episodesList) {
    const val = event.target.value;
    if (val === "none") {
        makePageForEpisodes(episodesList);
    } else {
        const singleEp = episodesList.filter((item) => item.id == val);
        makePageForEpisodes(singleEp);
        document.getElementById("undo-selected-episode").hidden = false;

        // undo selection of single episode
        // const undoSingleEpSelection = document.getElementById(
        //     "undo-selected-episode",
        // );

        // undoSingleEpSelection.addEventListener("click", () => {
        //     makePageForEpisodes(episodesList);
        //     undoSingleEpSelection.hidden = true;
        // });
    }
}

function searchEpisodes(episodesList) {
    const searchInput = document.getElementById("search-input");

    searchInput.addEventListener("input", (e) =>
        handleSeachInput(e, episodesList),
    );
}

// on change of search input, filter for episode title or summary containing input text
// show how many out of all episodes match query
function handleSeachInput(event, episodesList) {
    const resultCount = document.getElementById("result-count");
    const query = event.target.value.toLowerCase();
    if (query === "") {
        makePageForEpisodes(episodesList);
        resultCount.textContent = "";
        return;
    }

    const filtered = episodesList.filter((ep) => {
        const { name, summary } = ep;
        if (
            name.toLowerCase().includes(query) ||
            summary.toLowerCase().includes(query)
        ) {
            return ep;
        }
    });
    resultCount.textContent = `Displaying ${filtered.length}/${episodesList.length}`;
    makePageForEpisodes(filtered);
}

// given an array of episode objects, create html cards with info about each episode
function makePageForEpisodes(episodeList) {
    const rootElem = document.querySelector("#card-container");
    const template = document.getElementById("episode-card-template");
    const allEpisodeCards = episodeList.map((ep) => {
        const clone = template.content.cloneNode(true);
        const title = `${ep.name} - S${String(ep.season).padStart(2, "0")}E${String(ep.number).padStart(2, "0")}`;
        clone.querySelector(".episode-title").textContent = title;
        clone.querySelector(".episode-img").src = ep.image?.medium;
        clone.querySelector(".episode-img").alt = ep.name;
        // strip the <p> tags from the string to avoid rendering the text as HTML using innerHTMLand its
        // security risks.
        clone.querySelector(".episode-desc").textContent = ep.summary.replace(
            /<[^>]*>/g,
            "",
        );

        return clone;
    });

    rootElem.replaceChildren(...allEpisodeCards);
}

window.onload = setup;
