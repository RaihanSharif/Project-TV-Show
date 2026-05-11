//You can edit ALL of the code here
function setup() {
    const allEpisodes = getAllEpisodes();
    const searchInput = document.getElementById("search-input");
    const searchCount = document.getElementById("search-count");
    const episodeSelect = document.getElementById("episode-select");

    // populate episode selector
    allEpisodes.forEach((ep) => {
        const option = document.createElement("option");
        option.value = ep.id;
        const seasonStr = String(ep.season).padStart(2, "0");
        const numberStr = String(ep.number).padStart(2, "0");
        option.textContent = `S${seasonStr}E${numberStr} - ${ep.name}`;
        episodeSelect.appendChild(option);
    });

    // initial page load
    makePageForEpisodes(allEpisodes);
    searchCount.textContent = `Displaying ${allEpisodes.length} / ${allEpisodes.length} episodes`;

    // live search event listener
    searchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();

        // filter episodes based on search term
        const filteredEpisodes = allEpisodes.filter((ep) => {
            const nameMatch = ep.name.toLowerCase().includes(searchTerm);
            const summaryMatch = ep.summary.toLowerCase().includes(searchTerm);
            // return true if either the name or summary matches the search term
            return nameMatch || summaryMatch;
        });

        makePageForEpisodes(filteredEpisodes);
        searchCount.textContent = `Displaying ${filteredEpisodes.length} / ${allEpisodes.length} episodes`;
    });
}

function makePageForEpisodes(episodeList) {
    const rootElem = document.getElementById("root");
    const template = document.getElementById("episode-card-template");

    // clear existing content before appending new
    rootElem.innerHTML = "";

    const allEpisodeCards = episodeList.map((ep) => {
        // strip the <p> tags from the ep.summary to avoid possible security risks
        const cleanSummary = ep.summary.replace(
            /<[^>]*>/g,
            "",
        );

        const clone = template.content.cloneNode(true);
        const title = `${ep.name} - S${String(ep.season).padStart(2, "0")}E${String(ep.number).padStart(2, "0")}`;
        clone.querySelector(".episode-title").textContent = title;
        clone.querySelector(".episode-img").src = ep.image.medium;
        clone.querySelector(".episode-img").alt = ep.name;

        clone.querySelector(".episode-desc").textContent = cleanSummary;

        return clone;
    });

    rootElem.append(...allEpisodeCards);
}

window.onload = setup;
