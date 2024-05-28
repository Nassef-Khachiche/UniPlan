function filterProjects(filter) {
    filter = filter.toUpperCase();
    const projectCards = document.querySelectorAll('.card-column');
    const noProjectsFound = document.getElementById('noProjectsFound');
    
    projectCards.forEach(card => {
        const projectName = card.querySelector('h2').textContent.toUpperCase();
        const projectBio = card.querySelector('p').textContent.toUpperCase();
        if (projectName.includes(filter) || projectBio.includes(filter)) {
            card.style.display = "";
            noProjectsFound.classList.add('d-none');
        } else {
            card.style.display = "none";
            noProjectsFound.classList.remove('d-none');
        }
    });
}