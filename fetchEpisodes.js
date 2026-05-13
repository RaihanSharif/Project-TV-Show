export async function fetchAllEpisodes(showId) {
    const url = `https://api.tvmaze.com/shows/${showId}/episodes`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Could not fetch episodes: ${response.status}`);
    }
    return response.json();
}
