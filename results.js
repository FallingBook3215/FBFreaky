const params = new URLSearchParams(window.location.search);
const query = params.get("q");
const resultsContainer = document.getElementById("results");

if (!query) {
    resultsContainer.textContent = "No search query found.";
} else {
    resultsContainer.innerHTML = "<p></p>";

    function renderResult(title, link, snippet) {
        const div = document.createElement("div");
        div.className = "result";
        div.innerHTML = `
            <a href="${link}" target="_blank">${title}</a>
            <p>${snippet}</p>
        `;
        resultsContainer.appendChild(div);
        }

        // Wikipedia results
        fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srsearch=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
            const wikiResults = data.query.search;
            wikiResults.forEach(item => {
            const link = `https://en.wikipedia.org/?curid=${item.pageid}`;
            renderResult(`[Wiki] ${item.title}`, link, item.snippet + "...");
            });
        })
        .catch(() => {
            resultsContainer.innerHTML += "<p>Failed to load Wikipedia results.</p>";
        });

        // Youtube results
        fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&key=YOUR_API_KEY`)
        .then(res => res.json())
        .then(data => {

            if (!data.items || data.items.length === 0) {
                resultsContainer.innerHTML += "<p>No YouTube results found.</p>";
                return;
            }
            data.items.forEach(item => {
                const title = item.snippet.title;
                const videoId = item.id.videoId;
                const description = item.snippet.description;
                const link = `https://www.youtube.com/watch?v=${videoId}`;
                renderResult(`[YouTube] ${title}`, link, description);
            });
        })
        .catch(() => {
            resultsContainer.innerHTML += "<p>Failed to load YouTube results.</p>";
        });
    }