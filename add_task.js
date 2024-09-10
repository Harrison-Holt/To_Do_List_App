document.addEventListener('DOMContentLoaded', async function() {

    const form = document.getElementById('taskForm');
    const params = new URLSearchParams(window.location.search);
    const task_id = params.get('task_id');
    let task_info;

    // Helper function to get the JWT token from localStorage
    function getToken() {
        return localStorage.getItem('token');
    }

    // Function to convert time to 12-hour format with AM/PM
    function convertTo12HourFormat(time) {
        let [hours, minutes] = time.split(':');
        hours = parseInt(hours);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; // Convert hour 0 to 12
        return `${hours}:${minutes} ${ampm}`;
    }

    // Function to convert date to MM-DD-YYYY format
    function formatDate(date) {
        const [year, month, day] = date.split('-');
        return `${month}-${day}-${year}`;
    }

    // Fetch task information if editing
    if (task_id) {
        try {
            const response = await fetch(`/api/tasks?task_id=${task_id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}` // Include the token in headers
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch task data');
            }

            const data = await response.json();
            task_info = data.tasks.find(task => task.id === parseInt(task_id));

            if (task_info) {
                document.getElementById("task_name").value = task_info.task_name;
                document.getElementById("due_date").value = task_info.task_due_date;
                document.getElementById("due_time").value = task_info.task_due_time;
                document.getElementById("select_priority").value = task_info.task_priority;
            }
        } catch (error) {
            console.error('Error fetching task:', error);
            alert('Failed to load task data. Please try again.');
        }
    }

    // Handle form submission
    form.addEventListener('submit', async function(event) {
        event.preventDefault();  // Prevent the default form submission

        const task_name = document.getElementById("task_name").value.trim();
        const task_due_date = document.getElementById("due_date").value;
        const task_due_time = document.getElementById("due_time").value;
        const task_priority = document.getElementById("select_priority").value;

        // Check if any required field is empty
        if (!task_name || !task_due_date || !task_due_time || !task_priority) {
            alert("Please fill out all required fields.");
            return;  // Stop the function if validation fails
        }

        // Determine if we're creating or updating a task
        const url = task_info ? `/api/tasks` : `/api/tasks`;
        const method = task_info ? 'PUT' : 'POST';
        const body = {
            task_name,
            task_due_date,
            task_due_time,
            task_priority,
        };

        if (task_info) {
            body.id = task_info.id; // Include task ID if updating
        }

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}` // Include the token in headers
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error('Failed to save task data');
            }

            const result = await response.json();
            alert('Task saved successfully!');
            window.location.href = 'index.html';  // Redirect after saving the task

        } catch (error) {
            console.error('Error saving task:', error);
            alert('Failed to save task. Please try again.');
        }
    });
});

