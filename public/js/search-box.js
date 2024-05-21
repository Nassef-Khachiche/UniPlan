let selectedUsers = new Set();

function selectUser(select) {
    const email = select.value;
    if (email && !selectedUsers.has(email)) {
        selectedUsers.add(email);
        updateSelectedUsers();
    }
}

function removeUser(email) {
    selectedUsers.delete(email);
    updateSelectedUsers();
}

function updateSelectedUsers() {
    const container = document.getElementById('selectedUsers');
    container.innerHTML = '';
    selectedUsers.forEach(email => {
        const div = document.createElement('div');
        div.className = 'selected-user';
        div.textContent = email + ' ';
        
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-danger btn-sm my-1';
        button.textContent = 'Remove';
        button.onclick = () => removeUser(email);

        div.appendChild(button);
        container.appendChild(div);
    });

    // Update the hidden input fields to submit with the form
    container.querySelectorAll('input[type="hidden"]').forEach(input => input.remove());
    selectedUsers.forEach(email => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'users[]'; // Ensure 'users' is the name of the element
        input.value = email;
        container.appendChild(input);
    });
}

function filterUsers() {
    var input, filter, select, options;
    input = document.getElementById("userSearchInput");
    filter = input.value.toUpperCase();
    select = document.getElementById("myDropdown");
    options = select.getElementsByTagName("option");
    for (var i = 0; i < options.length; i++) {
        var txtValue = options[i].textContent || options[i].innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            options[i].style.display = "";
        } else {
            options[i].style.display = "none";
        }
    }
}

document.getElementById('createProjectForm').addEventListener('submit', function(event) {
    const selectedUsersContainer = document.getElementById('selectedUsers');
    selectedUsersContainer.innerHTML = '';
    selectedUsers.forEach(email => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'users[]';
        input.value = email;
        selectedUsersContainer.appendChild(input);
    });
});