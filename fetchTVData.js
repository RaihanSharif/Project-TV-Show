// function to fetch data from API.

export async function fetchEpisodes(showId) {
    const url = `https://api.tvmaze.com/shows/${82}/episodes`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        alert(`There was an error fetching episodes ${error}`);
    }
}

export async function fetchShows() {
    const url = `https://api.tvmaze.com/shows`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        alert(`There was an error fetching shows ${error}`);
    }
}
