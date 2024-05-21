function filterProjects(filter) {
    filter = filter.toUpperCase();
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        const projectName = card.querySelector('h2').textContent.toUpperCase();
        const projectBio = card.querySelector('p').textContent.toUpperCase();
        if (projectName.includes(filter) || projectBio.includes(filter)) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }
    });
}