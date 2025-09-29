const tabButtons = document.querySelectorAll(".tab-button");
const tabSections = document.querySelectorAll(".tab-section");

tabButtons.forEach(button => {
    button.addEventListener("click", () => {
        const selectedTab = button.getAttribute("data-tab");

        // Toggle button styles
        tabButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        // Show/hide the correct tab section
        tabSections.forEach(section => {
            if (section.id === `tab-${selectedTab}`) {
                section.style.display = "block";
            } else {
                section.style.display = "none";
            }
        });
    });
});