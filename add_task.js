document.addEventListener('DOMContentLoaded', function() {

    const form = document.getElementById('taskForm');
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const params = new URLSearchParams(window.location.search);
    const task_id = params.get('task_id');
    let task_info;

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

    if (task_id) {
        task_info = tasks.find(task => task.id === parseInt(task_id));
        if (task_info) {
            document.getElementById("task_name").value = task_info.task_name;
            document.getElementById("due_date").value = formatDate(task_info.task_date);
            document.getElementById("due_time").value = convertTo12HourFormat(task_info.task_time);
            document.getElementById("select_priority").value = task_info.priority;
        }
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();  // Prevent the default form submission

        const task_name = document.getElementById("task_name").value.trim();
        const task_date = formatDate(document.getElementById("due_date").value);
        const task_time = convertTo12HourFormat(document.getElementById("due_time").value);
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

        window.location.href = 'index.html';  // Redirect after storing the task
    });
});
