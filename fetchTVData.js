// map to cache fetch promises to ensure URLs are never fetched more than once per visit
const cache = new Map();

async function cachedFetch(url) {
    if (cache.has(url)) {
        return cache.get(url);
    }

    const promise = fetch(url).then((response) => {
        if (!response.ok) {
            throw new Error(`Could not fetch data: ${response.status}`);
        }
        return response.json();
    });
    cache.set(url, promise);

    promise.catch((error) => {
        cache.delete(url);
    });
    return promise;
}

// fetch all available shows from the TVMaze API
export async function fetchShows() {
    return cachedFetch("https://api.tvmaze.com/shows");
}

export async function fetchAllEpisodes(showId) {
    return cachedFetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
}
