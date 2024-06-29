document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('taskForm');
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const params = new URLSearchParams(window.location.search);
    const task_id = params.get('task_id');
    let task_info;

    if (task_id) {
        task_info = tasks.find(task => task.id === parseInt(task_id));
        if (task_info) {
            document.getElementById("task_name").value = task_info.task_name;
            document.getElementById("due_date").value = task_info.task_date;
            document.getElementById("due_time").value = task_info.task_time;
            document.getElementById("select_priority").value = task_info.priority;
        }
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();  // Prevent the default form submission

        const task_name = document.getElementById("task_name").value.trim();
        const task_date = document.getElementById("due_date").value;
        const task_time = document.getElementById("due_time").value;
        const priority = document.getElementById("select_priority").value;

        // Check if any required field is empty
        if (!task_name || !task_date || !task_time || !priority) {
            alert("Please fill out all required fields.");
            return;  // Stop the function if validation fails
        }

        if (!task_info) {  // Create new task if not editing
            task_info = {
                id: new Date().getTime(),  // Unique ID for the task
                task_completed: false
            };
        }

        // Update task details
        task_info.task_name = task_name;
        task_info.task_date = task_date;
        task_info.task_time = task_time;
        task_info.priority = priority;

        if (!task_id) {
            tasks.push(task_info);  // Add new task if not editing
        } else {
            // Update existing task in the array
            const index = tasks.findIndex(task => task.id === parseInt(task_id));
            if (index !== -1) {
                tasks[index] = task_info;
            }
        }

        localStorage.setItem('tasks', JSON.stringify(tasks));  // Update localStorage
        send_task_to_db(task_info);  // Send only the new/updated task to the server

        console.log("Task saved:", task_info);  // Log the saved or updated task
        window.location.href = 'index.html';  // Redirect after storing the task
    });
});

function send_task_to_db(task) {
    fetch('https://hhportfolio.great-site.net/CRUD.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(task)  // Send only the single task object
    })
    .then(response => response.json())
    .then(data => {
        console.log("Success: ", data);
    })
    .catch(error => {
        console.error("Error!", error);
    });
}
