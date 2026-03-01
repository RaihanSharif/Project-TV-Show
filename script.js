//You can edit ALL of the code here
function setup() {
    const allEpisodes = getAllEpisodes();
    makePageForEpisodes(allEpisodes);
    searchEpisodes(allEpisodes);
    selectEpSetup(allEpisodes);
}

function makePageForEpisodes(episodeList) {
    const rootElem = document.querySelector("#card-container");
    const template = document.getElementById("episode-card-template");
    const allEpisodeCards = episodeList.map((ep) => {
        const clone = template.content.cloneNode(true);
        const title = `${ep.name} - S${String(ep.season).padStart(2, "0")}E${String(ep.number).padStart(2, "0")}`;
        clone.querySelector(".episode-title").textContent = title;
        clone.querySelector(".episode-img").src = ep.image.medium;
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

function searchEpisodes(episodeList) {
    const searchInput = document.getElementById("search-input");
    const resultCount = document.getElementById("result-count");
    searchInput.addEventListener("input", (event) => {
        const query = event.target.value.toLowerCase();
        if (query === "") {
            makePageForEpisodes(episodeList);
            resultCount.textContent = "";
            return;
        }

        const filtered = episodeList.filter((ep) => {
            const { name, summary } = ep;
            if (
                name.toLowerCase().includes(query) ||
                summary.toLowerCase().includes(query)
            ) {
                return ep;
            }
        });
        resultCount.textContent = `Displaying ${filtered.length}/${episodeList.length}`;
        makePageForEpisodes(filtered);
    });
}

function selectEpSetup(episodeList) {
    const selecElem = document.getElementById("select-episodes");
    const selectOpts = episodeList.map((ep) => {
        const opt = document.createElement("option");
        opt.value = ep.name;
        const title = `S${String(ep.season).padStart(2, "0")}E${String(ep.number).padStart(2, "0")} - ${ep.name}`;
        opt.textContent = title;
        return opt;
    });

    selecElem.append(...selectOpts);

    selecElem.addEventListener("input", showSelectedEpisode);
}

function showSelectedEpisode(event) {
    const val = event.target.value;
}

window.onload = setup;
