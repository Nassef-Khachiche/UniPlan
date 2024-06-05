// Function to sort projects by date
function sortProjectsByDate(sortOrder) {
    // Sort projects based on the selected order
    if (sortOrder === 'newToOld') {
        projects.sort((a, b) => new Date(b.project_date) - new Date(a.project_date));
    } else if (sortOrder === 'oldToNew') {
        projects.sort((a, b) => new Date(a.project_date) - new Date(b.project_date));
    }

    // Update the pagination and display the projects
    currentPage = 1;
    setupPagination();
    displayProjects(currentPage);
}