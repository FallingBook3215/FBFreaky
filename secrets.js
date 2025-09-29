function easterEggs(query) {
    if (query.toLowerCase() === "this looks pretty freaky") {
        const resultsContainer = document.getElementById("tab-content");

        resultsContainer.innerHTML = `
            <div class="easter-egg">
                <h2>Wow, hope you weren't planning on actually searching this.</h2>
                <p>I really hope that you just decompiled my code to find the secret that no one was expecting and probably wasn't needed.</p>
                <p>You did that right? And you definetely weren't searching up what I think you were?</p>
            </div>
        `;

        document.getElementById("results").style.display = "none";

        return;
    }
}