//You can edit ALL of the code here
function setup() {
    const allEpisodes = getAllEpisodes();
    makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
    const rootElem = document.getElementById("root");
    const template = document.getElementById("episode-card-template");
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
