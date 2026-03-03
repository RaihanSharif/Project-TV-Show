// function to fetch data from API.

export async function fetchEpisodes(showId) {
    const url = `https://api.tvmaze.com/shows/${showId}/episodes`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Could not fetch episodes: ${response.status}`);
    }

    return response.json();
}

export async function fetchShows() {
    const url = `https://api.tvmaze.com/shows`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Could not fetch shows: ${response.status}`);
    }

    return response.json();
}
