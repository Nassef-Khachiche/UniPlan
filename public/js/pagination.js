// pagination.js

document.addEventListener('DOMContentLoaded', () => {
    const projectsPerPage = 9;
    const projectContainer = document.getElementById('project-container');
    const paginationContainer = document.getElementById('pagination');
    const noProjectsFound = document.getElementById('noProjectsFound');
    let currentPage = 1;

    function displayProjects(page) {
        projectContainer.innerHTML = '';
        const start = (page - 1) * projectsPerPage;
        const end = start + projectsPerPage;
        const paginatedProjects = projects.slice(start, end);

        if (paginatedProjects.length === 0) {
            noProjectsFound.classList.remove('d-none');
        } else {
            noProjectsFound.classList.add('d-none');
            paginatedProjects.forEach(project => {
                const projectCard = `
                    <div class="card-column mt-4">
                        <div class="card project-card shadow">
                            <div class="pill-container d-flex position-absolute top-0 start-0 m-2">
                                ${project.project_college.map(pc => `<div class="pill bg-${pc.colleges.college_name} badge badge-primary rounded me-1">${pc.colleges.college_name}</div>`).join('')}
                            </div>
                            <h2 class="mt-2">${project.project_name}</h2>
                            <p class="project-bio">${project.project_bio}</p>
                            <a href="/project/${project.project_id}">View Project</a>
                        </div>
                    </div>
                `;
                projectContainer.innerHTML += projectCard;
            });
        }
    }

    function setupPagination() {
        const pageCount = Math.ceil(projects.length / projectsPerPage);
        paginationContainer.innerHTML = '';

        const prevButton = document.createElement('li');
        prevButton.className = 'page-item';
        prevButton.innerHTML = '<a class="page-link" href="#" tabindex="-1">Previous</a>';
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updatePagination();
                displayProjects(currentPage);
            }
        });
        paginationContainer.appendChild(prevButton);

        for (let i = 1; i <= pageCount; i++) {
            const pageItem = document.createElement('li');
            pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
            pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            pageItem.addEventListener('click', () => {
                currentPage = i;
                updatePagination();
                displayProjects(currentPage);
            });
            paginationContainer.appendChild(pageItem);
        }

        const nextButton = document.createElement('li');
        nextButton.className = 'page-item';
        nextButton.innerHTML = '<a class="page-link" href="#">Next</a>';
        nextButton.addEventListener('click', () => {
            if (currentPage < pageCount) {
                currentPage++;
                updatePagination();
                displayProjects(currentPage);
            }
        });
        paginationContainer.appendChild(nextButton);
    }

    function updatePagination() {
        const pageItems = paginationContainer.querySelectorAll('.page-item');
        pageItems.forEach((item, index) => {
            if (index === 0) {
                item.classList.toggle('disabled', currentPage === 1);
            } else if (index === pageItems.length - 1) {
                item.classList.toggle('disabled', currentPage === Math.ceil(projects.length / projectsPerPage));
            } else {
                item.classList.toggle('active', index === currentPage);
            }
        });
    }

    setupPagination();
    displayProjects(currentPage);
});
