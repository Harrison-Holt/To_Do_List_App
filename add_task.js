document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('taskForm');

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

        const task_info = {
            task_name, 
            task_date, 
            task_time, 
            priority, 
            id: new Date().getTime(),  // Unique ID for the task
            task_completed: false
        };

        // Retrieve the existing tasks from localStorage
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push(task_info);  // Add the new task
        localStorage.setItem('tasks', JSON.stringify(tasks));  // Update localStorage

        console.log("New task added:", task_info);  // Log the newly added task
        window.location.href = 'index.html';  // Redirect after storing the task
    });
});
