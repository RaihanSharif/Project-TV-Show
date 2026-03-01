// function to fetch data from API.

async function fetchTVData() {
    const url = "https://api.tvmaze.com/shows/82/episodes";

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(error);
    }
}

export default fetchTVData;
