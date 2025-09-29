document.getElementById("internal-search-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const query = document.getElementById("search-input").value.trim();
    if (query) {
        window.location.search = "?q=" + encodeURIComponent(query);
        runSearch(query);
    }
});

window.addEventListener("load", () => {

    if (query) {
        runSearch(query);
    }

    document.querySelectorAll(".tab-section").forEach(section => {
        section.style.display = "none";
    });
    document.getElementById("tab-all").style.display = "block";

    document.querySelectorAll(".tab-button").forEach(btn => {
        btn.classList.remove("active");
    });
    document.querySelector('.tab-button[data-tab="all"]').classList.add("active");
});

let query = "";

// Check if it's from homepage
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has("q")) {
    query = urlParams.get("q").trim();
    document.getElementById("search-input").value = query;
} else if (window.location.hash) {
    query = decodeURIComponent(window.location.hash.substring(1)).trim();
}

const resultsContainer = document.getElementById("results");

function runSearch(query) {
    if (!query) {
        document.getElementById("results").textContent = "No search query found.";
        return;
    }

    easterEggs(query);

    // Clear all results
    document.getElementById("general-results").innerHTML = "";
    document.getElementById("video-results").innerHTML = "";
    document.getElementById("image-results").innerHTML = "";
    document.getElementById("book-results").innerHTML = "";
    document.getElementById("results").innerHTML = "<p></p>";

    resultsContainer.innerHTML = "<p></p>";

    function renderResult(title, link, snippet, container = resultsContainer) {
        const div = document.createElement("div");
        div.className = "result";
        div.innerHTML = `
            <a href="${link}" target="_blank">${title}</a>
            <p>${snippet}</p>
        `;
        container.appendChild(div);
    }

    // Wikipedia results
    fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srsearch=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
        const wikiResults = data.query.search;
        wikiResults.forEach(item => {
            const link = `https://en.wikipedia.org/?curid=${item.pageid}`;
            renderResult(item.title, link, item.snippet.substring(0, 200), document.getElementById("general-results"));
        });
    })

    // Reddit results
    fetch(`https://www.reddit.com/search.json?q=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
        if (!data.data || !data.data.children.length) {
            return;
        }

        data.data.children.forEach(post => {
            const postData = post.data;
            const title = postData.title;
            const link = `https://www.reddit.com${postData.permalink}`;
            const snippetRaw = postData.selftext || postData.title || "No text content";
            const snippet = snippetRaw.length > 200 ? snippetRaw.substring(0, 200) + "..." : snippetRaw;

            renderResult(title, link, snippet, document.getElementById("general-results"));
        });
    })

    // Open Library results
    fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
        if (!data.docs || data.docs.length === 0) {
            return;
        }

        data.docs.slice(0, 5).forEach(book => {
            const title = book.title;
            const author = book.author_name ? book.author_name.join(", ") : "Unknown";
            const year = book.first_publish_year || "N/A";
            const link = `https://openlibrary.org${book.key}`;
            const snippet = `Author: ${author} (${year})`;

            renderResult(title, link, snippet, document.getElementById("book-results"));
        });
    })

    // GitHub results
    fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
        if (!data.items || !data.items.length) {
            return;
        }

        data.items.forEach(repo => {
            const name = repo.name;
            const link = `${repo.html_url}`;
            const snippet = repo.description || "No text content";

            renderResult(name, link, snippet.substring(0, 200) + "...", document.getElementById("general-results"));
        });
    })

    // Archive.org video results
    fetch(`https://archive.org/advancedsearch.php?q=mediatype:(movies)+AND+${encodeURIComponent(query)}&fl[]=identifier,title,description&rows=5&output=json`)
    .then(res => res.json())
    .then(data => {
        const items = data.response.docs;

        if (!items.length) {
            return;
        }

        items.forEach(item => {
            const title = item.title || "Untitled";
            const id = item.identifier;
            const link = `https://archive.org/details/${id}`;
            const embedUrl = `https://archive.org/embed/${id}`;
            const snippet = item.description || "No description available.";

            // Check if item has embeddable video
            fetch(`https://archive.org/metadata/${id}`)
            .then(res => res.json())
            .then(metadata => {
                const files = metadata.files || [];

                 // Look for a playable video file (mp4, ogv, etc.)
                const hasVideo = files.some(file =>
                    file.format && file.format.toLowerCase().includes("mpeg") ||
                    file.format && file.format.toLowerCase().includes("ogv") ||
                    file.name && file.name.toLowerCase().endsWith(".mp4")
                );

                // Create a result block
                const div = document.createElement("div");
                div.className = "video-result";

                // Always show title + snippet
                div.innerHTML = `
                    <h4><a href="${link}" target="_blank">${title}</a></h4>
                    <p>${snippet.substring(0, 200)}...</p>
                `;

                // Only embed the player if there's a video
                if (hasVideo) {
                    const iframe = document.createElement("iframe");
                    iframe.src = embedUrl;
                    iframe.width = "300";
                    iframe.height = "200";
                    iframe.frameBorder = "0";
                    iframe.allowFullscreen = true;
                    div.insertBefore(iframe, div.children[1]); // Insert after title
                }

                document.getElementById("video-results").appendChild(div);
            })
        })
    });

    // PeerTube video results
    fetch(`https://video.blender.org/api/v1/videos?search=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
        const items = data.data;

        if (!items.length) {
            return;
        }

        items.forEach(item => {
            const title = item.name || "Untitled";
            const id = item.id;
            const link = `${item.url}`;
            const snippet = item.truncatedDescription || "No description available.";

            renderResult(title, link, snippet.substring(0, 200) + "...", document.getElementById("video-results"));
        });
    })

    // Openverse image search
    fetch(`https://api.openverse.org/v1/images/?license_type=commercial&per_page=5&q=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
        const images = data.results;
        if (!images.length) {
            return;
        }

        images.forEach(img => {
            const imgDiv = document.createElement("div");
            imgDiv.className = "image-result";
            imgDiv.innerHTML = `
                <a href="${img.foreign_landing_url}" target="_blank">
                <img src="${img.thumbnail || img.url}" alt="${img.title}" width="200" />
                </a>
            `;
            document.getElementById("image-results").appendChild(imgDiv);
        });
    })

}