$(document).ready(function() {
    $('#project-status').change(function() {
        var projectId = $(this).data('project-id');
        var newStatus = $(this).val();

        $.ajax({
            url: '/update-project-status',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                projectId: projectId,
                status: newStatus
            }),
            success: function(response) {
                alert('Project status updated successfully!');
            },
            error: function(err) {
                console.error('Error updating project status:', err);
                alert('Failed to update project status.');
            }
        });
    });
});