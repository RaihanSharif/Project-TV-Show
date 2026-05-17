// map to cache fetch promises to ensure URLs are never fetched more than once per visit
const cache = new Map();

async function cachedFetch(url) {
    if (cache.has(url)) {
        return cache.get(url);
    }

    const promise = fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Could not fetch data: ${response.status}`);
            }
            return response.json();
        })
        // delete the entry in the cache if if fetch fails
        // storing the promises instead of the awaited data prevents a race condition
        // where if a second call to the cache happens while the first is still awaiting fetch
        // it gets an empty cache and triggers another fetch.
        // with this setup, the promise is stored straight away.
        .catch((error) => {
            cache.delete(url);
            throw error;
        });

    cache.set(url, promise);
    return promise;
}

// fetch all available shows from the TVMaze API
export async function fetchShows() {
    return cachedFetch("https://api.tvmaze.com/shows");
}

export async function fetchAllEpisodes(showId) {
    return cachedFetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
}
