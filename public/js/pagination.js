document.addEventListener('DOMContentLoaded', () => {
    const projectsPerPage = 9;
    const projectContainer = document.getElementById('project-container');
    const paginationContainer = document.getElementById('pagination');
    const noProjectsFound = document.getElementById('noProjectsFound');
    const sortDropdown = document.getElementById('sortDate');
    const searchBox = document.querySelector('.search-box');
    let currentPage = 1;
    let currentProjects = [...projects];
    let filteredProjects = [...projects];

    function sortProjects(order) {
        filteredProjects.sort((a, b) => {
            const dateA = new Date(a.end_date);
            const dateB = new Date(b.end_date);
            return order === 'newToOld' ? dateB - dateA : dateA - dateB;
        });
    }

    function filterProjects(filter) {
        filter = filter.toUpperCase();
        filteredProjects = projects.filter(project => {
            const projectName = project.project_name.toUpperCase();
            const projectBio = project.project_bio.toUpperCase();
            return projectName.includes(filter) || projectBio.includes(filter);
        });
        currentPage = 1;
        setupPagination();
        displayProjects(currentPage);
    }

    function displayProjects(page) {
        projectContainer.innerHTML = '';
        const start = (page - 1) * projectsPerPage;
        const end = start + projectsPerPage;
        const paginatedProjects = filteredProjects.slice(start, end);

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
                            <h2 class="mt-4">${project.project_name}</h2>
                            <p class="project-bio mb-0">${project.project_bio}</p>
                            <div class=" d-flex justify-content-center align-items-center">
                            <label class="form-check-label badge text-white rounded-pill px-2 py-1" for="endDate"><i class="ri-calendar-line me-2"></i>${project.end_date.slice(0,10)}</label>
                            </div>
                            <a id='view-project' href="/project/${project.project_id}">View Project</a>
                        </div>
                    </div>
                `;
                projectContainer.innerHTML += projectCard;
            });
        }
    }

    function setupPagination() {
        const pageCount = Math.ceil(filteredProjects.length / projectsPerPage);
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
                item.classList.toggle('disabled', currentPage === Math.ceil(filteredProjects.length / projectsPerPage));
            } else {
                item.classList.toggle('active', index === currentPage);
            }
        });
    }

    sortDropdown.addEventListener('change', () => {
        sortProjects(sortDropdown.value);
        currentPage = 1;
        setupPagination();
        displayProjects(currentPage);
    });

    searchBox.addEventListener('keyup', () => {
        filterProjects(searchBox.value);
    });

    sortProjects(sortDropdown.value);
    setupPagination();
    displayProjects(currentPage);
});
