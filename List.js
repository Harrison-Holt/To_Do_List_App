let tasks_list = [];
const { jsPDF } = window.jspdf;

// Function to retrieve tasks from the server
async function get_tasks() {
    try {
        const response = await fetch('/api/tasks', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Include JWT token for authentication
            }
        });

        if (response.ok) {
            const data = await response.json();
            tasks_list = data.tasks || [];
        } else {
            console.error("Failed to fetch tasks:", response.statusText);
            alert("Failed to fetch tasks. Please try again later.");
        }
    } catch (error) {
        console.error("Error fetching tasks:", error);
        alert("Error fetching tasks. Please try again later.");
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await get_tasks(); // Load tasks on page load

    const add_task_button = document.getElementById("add_task_button");
    const export_task_button = document.getElementById("export_task_button");

    add_task_button.addEventListener('click', function() {
        window.location.href = 'add_task.html';
    });

    export_task_button.addEventListener('click', function() {
        export_tasks(tasks_list);
    });

    function export_tasks(tasks) {
        const doc = new jsPDF();
        let y = 10;
        tasks.forEach(task => {
            doc.text(10, y, `Task: ${task.task_name}`);
            y += 10;
            doc.text(10, y, `Due: ${task.task_due_date}`);
            y += 10;
            doc.text(10, y, `Time: ${task.task_due_time}`);
            y += 10;
            doc.text(10, y, `Priority: ${task.task_priority}`);
            y += 10;
            doc.text(10, y, `Completed: ${task.task_completed}`);
            y += 20;
        });

        doc.save('tasks.pdf');
    }

    // Function to delete a task from the server
    async function delete_task(task_id) {
        try {
            const response = await fetch('/api/tasks', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ id: task_id })
            });

            if (response.ok) {
                await get_tasks(); // Refresh the task list
                get_tasks_due_today();
                get_tasks_due_later();
                get_completed_tasks();
                get_past_due_items();
            } else {
                console.error("Failed to delete task:", response.statusText);
                alert("Failed to delete task. Please try again later.");
            }
        } catch (error) {
            console.error("Error deleting task:", error);
            alert("Error deleting task. Please try again later.");
        }
    }

    // Function to mark a task as completed on the server
    async function complete_task(task_id) {
        try {
            const task = tasks_list.find(task => task.id === task_id);
            if (task) {
                task.task_completed = true;

                const response = await fetch('/api/tasks', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(task)
                });

                if (response.ok) {
                    await get_tasks(); // Refresh the task list
                    get_tasks_due_today();
                    get_completed_tasks();
                    get_tasks_due_later();
                    get_past_due_items();
                } else {
                    console.error("Failed to update task:", response.statusText);
                    alert("Failed to update task. Please try again later.");
                }
            }
        } catch (error) {
            console.error("Error updating task:", error);
            alert("Error updating task. Please try again later.");
        }
    }

    // Function to create the task card
    function create_task_card(task) {
        const task_card = document.createElement('div');
        task_card.classList.add('task_card');
        const thumbtack = document.createElement('div');
        thumbtack.classList.add('thumbtack');

        const list_items = document.createElement('p');
        list_items.classList.add('card_info');
        const delete_task_button = document.createElement('button');
        delete_task_button.classList.add('delete_button');
        delete_task_button.textContent = 'Delete';

        delete_task_button.onclick = function() {
            delete_task(task.id);
        };

        const edit_task_button = document.createElement('button');
        edit_task_button.classList.add('edit_button');
        edit_task_button.textContent = 'Edit';

        edit_task_button.onclick = function() {
            window.location.href = `add_task.html?task_id=${task.id}`;
        };

        list_items.innerHTML = `Name: ${task.task_name}<br> Due Date: ${task.task_due_date}<br>
        Due Time: ${task.task_due_time}<br> Priority: ${task.task_priority}`;

        task_card.appendChild(thumbtack);
        task_card.appendChild(list_items);
        task_card.appendChild(delete_task_button);
        task_card.appendChild(edit_task_button);

        if (!task.task_completed) {
            const complete_task_button = document.createElement('button');
            complete_task_button.classList.add('completed_card');
            complete_task_button.textContent = 'Complete';
            complete_task_button.onclick = function() {
                complete_task(task.id);
                complete_task_button.remove();
            };
            task_card.appendChild(complete_task_button);
        } else {
            list_items.innerHTML += `<br><br><span> Task Completed! </span>`;
            task_card.style.backgroundColor = 'grey';
        }

        return task_card;
    }

    // Function to display the tasks due on the current date
    function get_tasks_due_today() {
        const tasks_due_today_container = document.querySelector('.tasks_today');
        let current_day = get_formatted_date();

        let tasks_due_today = tasks_list.filter(task => task.task_due_date === current_day);

        tasks_due_today_container.innerHTML = '';
        tasks_due_today.forEach(task => {
            if (!task.task_completed) {
                const task_card = create_task_card(task);
                tasks_due_today_container.appendChild(task_card);
            }
        });
    }

    // Function to display the tasks due later than the current date
    function get_tasks_due_later() {
        const tasks_due_later_container = document.querySelector('.later_tasks');
        let current_day = get_formatted_date();

        let tasks_due_later = tasks_list.filter(task => task.task_due_date > current_day);

        tasks_due_later_container.innerHTML = '';
        tasks_due_later.forEach(task => {
            if (!task.task_completed) {
                const task_card = create_task_card(task);
                tasks_due_later_container.appendChild(task_card);
            }
        });
    }

    // Function to display the completed tasks
    function get_completed_tasks() {
        const completed_tasks_container = document.querySelector('.completed_tasks');

        completed_tasks_container.innerHTML = '';
        tasks_list.forEach(task => {
            if (task.task_completed) {
                const task_card = create_task_card(task);
                completed_tasks_container.appendChild(task_card);
            }
        });
    }

    // Function to display past due tasks
    function get_past_due_items() {
        const past_due_items_container = document.querySelector('.past_due_items_container');
        past_due_items_container.innerHTML = '';
        let current_day = get_formatted_date();

        let tasks_past_due = tasks_list.filter(task => task.task_due_date < current_day);

        tasks_past_due.forEach(task => {
            if (!task.task_completed) {
                const task_card = create_task_card(task);
                past_due_items_container.appendChild(task_card);
            }
        });
    }

    // Function to retrieve the current day in MM-DD-YYYY format
    function get_formatted_date() {
        let current_day = new Date();
        current_day.setHours(0, 0, 0, 0);

        return ('0' + (current_day.getMonth() + 1)).slice(-2)
            + '-' + ('0' + current_day.getDate()).slice(-2) + '-' + current_day.getFullYear();
    }

    get_past_due_items();
    get_tasks_due_today();
    get_tasks_due_later();
    get_completed_tasks();
});



