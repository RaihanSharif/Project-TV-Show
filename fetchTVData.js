// map to cache fetch promises to ensure URLs are never fetched more than once per visit
const cache = new Map();

async function cachedFetch(url) {
    if (cache.has(url)) {
        return cache.get(url);
    }
    const response = await fetch(url);
    if (!response.ok) {
        throw Error(`Could not fetch data: ${response.status}`);
    }
    const data = await response.json();
    cache.set(url, data);
    return data;
}

// fetch all available shows from the TVMaze API
export async function fetchShows() {
    return cachedFetch("https://api.tvmaze.com/shows");
}

export async function fetchAllEpisodes(showId) {
    return cachedFetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
}
