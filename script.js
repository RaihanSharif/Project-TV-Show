//You can edit ALL of the code here
import { fetchShows, fetchAllEpisodes } from "./fetchTVData.js";

const elements = {
    fetchStatus: document.getElementById("fetch-status"),
    showsContainer: document.getElementById("shows-container"),
    showSelect: document.getElementById("show-select"),
    showSearchInput: document.getElementById("show-search-input"),
    showSearchCount: document.getElementById("show-search-count"),
    showsMenu: document.getElementById("shows-menu"),

    episodesContainer: document.getElementById("episodes-container"),
    episodeSelect: document.getElementById("episode-select"),
    episodeSearchInput: document.getElementById("episode-search-input"),
    episodeSearchCount: document.getElementById("episode-search-count"),
    episodesMenu: document.getElementById("episodes-menu"),
};

let currentPage = "shows";

// input "shows" or "episodes"
function switchPage(switchedTo) {
    currentPage = switchedTo;

    if (currentPage === "shows") {
        elements.episodesContainer.classList.add("hidden");
        elements.episodesMenu.classList.add("hidden");
        elements.showsContainer.classList.remove("hidden");
        elements.showsMenu.classList.remove("hidden");
    } else if (currentPage === "episodes") {
        elements.episodesContainer.classList.remove("hidden");
        elements.episodesMenu.classList.remove("hidden");
        elements.showsContainer.classList.add("hidden");
        elements.showsMenu.classList.add("hidden");
    }
}

// when switching from episodes page to shows page,
// just unhide shows elements and hide episodes page

// when switching to episodes page:
// populate selector, attach listener (this should have been done only once)
// add new search listener

//---------------------
// shows setup code
//---------------------

// add shows to show selector
function populateShowSelector(shows) {
    const defaultOpt = document.createElement("option");
    defaultOpt.selected = true;
    defaultOpt.textContent = "-- SELECT A SHOW --";
    defaultOpt.value = "all";
    defaultOpt.disabled = true;

    const showOpts = shows.map(({ name, id }) => {
        const opt = document.createElement("option");
        opt.textContent = name;
        opt.value = id;
        return opt;
    });

    elements.showSelect.replaceChildren(defaultOpt, ...showOpts);
}

// attach show select listener
function initShowSelectListener() {
    elements.showSelect.onchange = async (e) => {
        console.log(`Show selected: ${e.target.value}`);
        await loadEpisodesForShow(e.target.value);
        elements.episodeSearchInput.value = "";
    };
}

function initShowSearchListener(shows) {
    elements.showSearchInput.value = "";
    elements.showSearchInput.oninput = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = shows.filter(({ name, summary }) => {
            const nameMatch = name
                ? name.toLowerCase().includes(searchTerm)
                : false;
            // Defensively check summary in case it's null
            const summaryMatch = summary
                ? summary.toLowerCase().includes(searchTerm)
                : false;
            // return true if either the name or summary matches the search term
            return nameMatch || summaryMatch;
        });

        makePageForShows(filtered);
        elements.showSearchCount.textContent = `Displaying ${filtered.length} / ${shows.length} shows`;
    };
}

function makePageForShows(showList) {
    const showTemplate = document.getElementById("show-card-template");
    console.lot;
    const cards = showList.map((sh) => {
        const clone = showTemplate.content.cloneNode(true);
        clone.querySelector(".show-name").textContent = sh.name;
        clone.querySelector(".show-img").src = sh.image?.medium;
        clone.querySelector(".show-img").alt = sh.name;

        const cleanSummary = sh.summary
            ? sh.summary.replace(/<[^>]*>/g, "")
            : "";

        clone.querySelector(".show-summary").textContent = cleanSummary;
        clone.querySelector(".show-genres").textContent = sh.genres.join(" | ");
        clone.querySelector(".show-status").textContent = sh.status;
        clone.querySelector(".show-rating").textContent = sh.rating.average;
        clone.querySelector(".show-runtime").textContent = `${sh.runtime} mins`;

        clone
            .querySelector(".show-name")
            .addEventListener("click", (e) => loadEpisodesForShow(sh.id));
        return clone;
    });

    elements.showsContainer.replaceChildren(...cards);
    switchPage("shows");
}

// only called on setup
async function loadShows() {
    let shows = [];

    elements.fetchStatus.textContent = "Loading shows...";
    elements.fetchStatus.classList.remove("hidden");

    try {
        shows = await fetchShows();
        shows.sort((a, b) =>
            (a.name || "")
                .toLowerCase()
                .localeCompare((b.name || "").toLowerCase()),
        );
        elements.fetchStatus.textContent = "";
        elements.fetchStatus.classList.add("hidden");
        console.log(shows);
        populateShowSelector(shows);
        initShowSelectListener();
        initShowSearchListener(shows);
        makePageForShows(shows);
    } catch (error) {
        elements.fetchStatus.textContent = `Error loading shows: ${error.message}`;
        return;
    }
}

//---------------------------
// Episode setup and display
//---------------------------

// given a show id, populates the episodes select element
function populateEpisodeSelector(episodes) {
    elements.episodeSelect.innerHTML =
        '<option value="all">Show All Episodes</option>';

    episodes.forEach(({ id, season, number, name }) => {
        const option = document.createElement("option");
        option.value = id;
        const seasonStr = String(season).padStart(2, "0");
        const numberStr = String(number).padStart(2, "0");
        option.textContent = `S${seasonStr}E${numberStr} - ${name}`;

        elements.episodeSelect.appendChild(option);
    });

    // question for reviewer: is it better to call the initEpisodeSelectListener
    // here because I always want the two to be called together
}

// attach listeners to the episodes select element
function initEpisodeSelectListener(episodes) {
    // I use onchange instead of addEventListener to stop stacking listeners
    console.log("adding ep select listeners..");
    elements.episodeSelect.onchange = (e) => {
        const selectedId = e.target.value;
        if (selectedId === "all") {
            makePageForEpisodes(episodes);
            elements.episodeSearchCount.textContent = `Displaying ${episodes.length} / ${episodes.length} episodes`;
        } else {
            const selectedEpisode = episodes.find(
                ({ id }) => String(id) === selectedId,
            );
            if (selectedEpisode) {
                makePageForEpisodes([selectedEpisode]);
                elements.episodeSearchCount.textContent = `Displaying 1 / ${episodes.length} episodes`;
            }
        }

        //reset search element when using select
        elements.episodeSearchInput.value = "";
    };
}

// updates display of episodes as search input changes
// searches name and summary of each episode
function initEpisodeSearchListener(episodes) {
    console.log("creating search listener");
    elements.episodeSearchInput.oninput = (e) => {
        const searchTerm = e.target.value.toLowerCase();

        // filter episodes based on search term
        const filteredEpisodes = episodes.filter((ep) => {
            const nameMatch = ep.name
                ? ep.name.toLowerCase().includes(searchTerm)
                : false;
            // Defensively check summary in case it's null
            const summaryMatch = ep.summary
                ? ep.summary.toLowerCase().includes(searchTerm)
                : false;
            // return true if either the name or summary matches the search term
            return nameMatch || summaryMatch;
        });

        makePageForEpisodes(filteredEpisodes);
        elements.episodeSearchCount.textContent = `Displaying ${filteredEpisodes.length} / ${episodes.length} episodes`;
    };
}

// fetch episodes, populate menu, listeners and display episode cards
async function loadEpisodesForShow(showId) {
    let allEpisodes = [];
    // use hidden class to show/hide loading message during data fetching
    elements.fetchStatus.textContent = "Loading episodes...";
    elements.fetchStatus.classList.remove("hidden");
    try {
        allEpisodes = await fetchAllEpisodes(showId); // call fetch with the id of the show
        elements.fetchStatus.textContent = "";
        elements.fetchStatus.classList.add("hidden");
    } catch (error) {
        elements.fetchStatus.textContent = error.message;
        allEpisodes = [];
    }

    populateEpisodeSelector(allEpisodes);
    initEpisodeSelectListener(allEpisodes);
    initEpisodeSearchListener(allEpisodes);

    // initial page load and show switch
    makePageForEpisodes(allEpisodes);
    elements.episodeSearchCount.textContent = `Displaying ${allEpisodes.length} / ${allEpisodes.length} episodes`;
}

async function setup() {
    await loadShows();

    const backBtn = document.getElementById("back-to-shows-btn");
    backBtn.addEventListener("click", async () => await loadShows());
}

function makePageForEpisodes(episodeList) {
    const template = document.getElementById("episode-card-template");
    const showName = episodeList[0]._links.show.name;
    console.log(showName);
    // clear existing content before appending new
    const pageHeadingElem = document.getElementById("ep-page-show-name");
    pageHeadingElem.textContent = showName;
    elements.episodesContainer.innerHTML = "";

    const allEpisodeCards = episodeList.map((ep) => {
        // strip the <p> tags from the ep.summary to avoid possible security risks
        // handle summary if null
        const cleanSummary = ep.summary
            ? ep.summary.replace(/<[^>]*>/g, "")
            : "";

        const clone = template.content.cloneNode(true);
        const title = `${ep.name} - S${String(ep.season).padStart(2, "0")}E${String(ep.number).padStart(2, "0")}`;
        clone.querySelector(".episode-title").textContent = title;
        // set image properties if available
        if (ep.image && ep.image.medium) {
            clone.querySelector(".episode-img").src = ep.image.medium;
            clone.querySelector(".episode-img").alt = ep.name;
            clone.querySelector(".episode-img").style.display = "";
        } else {
            clone.querySelector(".episode-img").style.display = "none";
        }

        clone.querySelector(".episode-desc").textContent = cleanSummary;

        return clone;
    });

    elements.episodesContainer.append(...allEpisodeCards);
    switchPage("episodes");
}

// run setup now since the script has been loaded with defer
setup();
