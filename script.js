//You can edit ALL of the code here
function setup() {
    const allEpisodes = getAllEpisodes();
    makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
    const rootElem = document.getElementById("root");
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

    rootElem.append(...allEpisodeCards);
}

window.onload = setup;
