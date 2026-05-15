//You can edit ALL of the code here
import { fetchShows, fetchAllEpisodes } from "./fetchTVData.js";

const elements = {
    fetchStatus: document.getElementById("fetch-status"),
    showsContainer: document.getElementById("shows-container"),
    showSelect: document.getElementById("show-select"),

    episodesContainer: document.getElementById("episodes-container"),
    episodeSelect: document.getElementById("episode-select"),
    episodeSearchInput: document.getElementById("episode-search-input"),
    episodeSearchCount: document.getElementById("episode-search-count"),
};

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
}

// attach listeners to the episodes select element
function initEpisodeSelectListener(episodes) {
    // TODO: check if listeners should be removed
    elements.episodeSelect.addEventListener("change", (e) => {
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
    });
}

async function setup() {
    // helper function to load episodes for a selected show and refresh UI
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

        // initial page load and show switch
        makePageForEpisodes(allEpisodes);
        elements.episodeSearchCount.textContent = `Displaying ${allEpisodes.length} / ${allEpisodes.length} episodes`;
    }

    // fetch and populate available shows on initial load
    elements.fetchStatus.textContent = "Loading shows...";
    elements.fetchStatus.classList.remove("hidden");
    try {
        const shows = await fetchShows();
        // Sort shows in alphabetical order, case-insensitive
        shows.sort((a, b) =>
            (a.name || "")
                .toLowerCase()
                .localeCompare((b.name || "").toLowerCase()),
        );

        // Populate show selector
        shows.forEach((show) => {
            const option = document.createElement("option");
            option.value = show.id;
            option.textContent = show.name;
            elements.showSelect.appendChild(option);
        });

        // Load episodes for the first show by default
        if (shows.length > 0) {
            elements.showSelect.value = String(shows[0].id);
            await loadEpisodesForShow(shows[0].id);
        }
    } catch (error) {
        elements.fetchStatus.textContent = `Error loading shows: ${error.message}`;
        return;
    }

    // event listener for when a user chooses a show
    elements.showSelect.addEventListener("change", async (e) => {
        await loadEpisodesForShow(e.target.value);
        // reset search input when using select
        elements.episodeSearchInput.value = "";
    });

    // live search event listener
    elements.episodeSearchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();

        // filter episodes based on search term
        const filteredEpisodes = allEpisodes.filter((ep) => {
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
        elements.episodeSearchCount.textContent = `Displaying ${filteredEpisodes.length} / ${allEpisodes.length} episodes`;
    });
}

function makePageForEpisodes(episodeList) {
    const template = document.getElementById("episode-card-template");

    // clear existing content before appending new
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
}

// run setup now since the script has been loaded with defer
setup();
