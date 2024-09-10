let tasks_list = [];
const { jsPDF } = window.jspdf || {};

// Fetch tasks from the API when the page loads
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
            renderTasks();
        } else {
            console.error("Failed to fetch tasks:", response.statusText);
            alert("Failed to fetch tasks. Please try again later.");
        }
    } catch (error) {
        console.error("Error fetching tasks:", error);
        alert("Error fetching tasks. Please try again later.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    get_tasks(); 

    const add_task_button = document.getElementById("add_task_button");
    const export_task_button = document.getElementById("export_task_button");

    add_task_button.addEventListener('click', function() {
        window.location.href = 'add_task.html';
    });

    export_task_button.addEventListener('click', function() {
        export_tasks(tasks_list);
    });

    get_quote_of_the_day(); // Call to fetch and display the quote of the day
});

// Function to export tasks to PDF
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

// Function to complete a task
async function complete_task(task_id) {
    try {
        const response = await fetch('/api/tasks', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ id: task_id, task_completed: true })
        });

        if (response.ok) {
            // Update the tasks list and refresh the UI
            tasks_list = tasks_list.map(task => {
                if (task.id === task_id) {
                    task.task_completed = true;
                }
                return task;
            });
            renderTasks(); // Re-render tasks after marking one as complete
        } else {
            console.error("Failed to complete task:", response.statusText);
            alert("Failed to complete task. Please try again later.");
        }
    } catch (error) {
        console.error("Error completing task:", error);
        alert("Error completing task. Please try again later.");
    }
}

// Function to render tasks
function renderTasks() {
    get_tasks_due_today();
    get_tasks_due_later();
    get_completed_tasks();
    get_past_due_items();
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
            complete_task(task.id);  // Call the complete_task function
        };
        task_card.appendChild(complete_task_button);
    } else {
        list_items.innerHTML += `<br><br><span> Task Completed! </span>`;
        task_card.style.backgroundColor = 'grey';
    }

    return task_card;
}

// Display functions for tasks in different categories
function get_tasks_due_today() {
    const tasks_due_today_container = document.querySelector('.tasks_today');
    const current_day = get_formatted_date();

    const tasks_due_today = tasks_list.filter(task => task.task_due_date === current_day && !task.task_completed);

    tasks_due_today_container.innerHTML = '';
    tasks_due_today.forEach(task => {
        const task_card = create_task_card(task);
        tasks_due_today_container.appendChild(task_card);
    });
}

function get_tasks_due_later() {
    const tasks_due_later_container = document.querySelector('.later_tasks');
    const current_day = get_formatted_date();

    const tasks_due_later = tasks_list.filter(task => task.task_due_date > current_day && !task.task_completed);

    tasks_due_later_container.innerHTML = '';
    tasks_due_later.forEach(task => {
        const task_card = create_task_card(task);
        tasks_due_later_container.appendChild(task_card);
    });
}

// Function to complete a task
async function complete_task(task_id) {
    try {
        const response = await fetch('/api/tasks', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Include JWT token for authentication
            },
            body: JSON.stringify({ id: task_id, task_completed: true }) // Adjust the payload to match the API's expected format
        });

        if (response.ok) {
            const data = await response.json(); // Check if response is JSON
            console.log('Task completed successfully:', data);
            
            // Update the tasks list and refresh the UI
            tasks_list = tasks_list.map(task => {
                if (task.id === task_id) {
                    task.task_completed = true;
                }
                return task;
            });
            renderTasks(); // Re-render tasks after marking one as complete
        } else {
            // Log detailed error message
            const errorText = await response.text();
            console.error("Failed to complete task:", errorText);
            alert("Failed to complete task. Please try again later.");
        }
    } catch (error) {
        console.error("Error completing task:", error);
        alert("Error completing task. Please try again later.");
    }
}


function get_past_due_items() {
    const past_due_items_container = document.querySelector('.past_due_items_container');
    const current_day = get_formatted_date();

    const tasks_past_due = tasks_list.filter(task => task.task_due_date < current_day && !task.task_completed);

    past_due_items_container.innerHTML = '';
    tasks_past_due.forEach(task => {
        const task_card = create_task_card(task);
        past_due_items_container.appendChild(task_card);
    });
}

// Utility function to get the current date formatted as MM-DD-YYYY
function get_formatted_date() {
    const current_day = new Date();
    current_day.setHours(0, 0, 0, 0);

    return ('0' + (current_day.getMonth() + 1)).slice(-2)
        + '-' + ('0' + current_day.getDate()).slice(-2) + '-' + current_day.getFullYear();
}

// Fetch and display the quote of the day
function get_quote_of_the_day() {
    const quotesContainer = document.getElementById("quotes");
    const currentDate = new Date().toISOString().slice(0, 10); // ISO format: YYYY-MM-DD

    let storedQuoteData = localStorage.getItem('dailyQuote');
    if (storedQuoteData) {
        storedQuoteData = JSON.parse(storedQuoteData);
        // Check if the stored quote is from today
        if (storedQuoteData.date === currentDate) {
            displayQuote(storedQuoteData.quote, storedQuoteData.author);
            return;
        }
    }

    // If there is no quote stored for today, fetch a new one
    const apiLink = `https://api.api-ninjas.com/v1/quotes?category=success`;
    const apiKey = 'Yvk4eNG2JLCJ5yGmJounqA==UOBJGJvJs8xcwlLt'; 

    fetch(apiLink, {
        headers: {
            'X-Api-Key': apiKey
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("FAILED CONNECTING TO API");
        }
        return response.json();
    })
    .then(data => {
        if (data && data.length > 0) {
            const firstQuote = data[0];
            displayQuote(firstQuote.quote, firstQuote.author);
            // Store the new quote in localStorage with today's date
            localStorage.setItem('dailyQuote', JSON.stringify({
                quote: firstQuote.quote,
                author: firstQuote.author,
                date: currentDate
            }));
        }
    })
    .catch(error => {
        console.error("Error getting data: ", error);
    });
}

function displayQuote(quote, author) {
    const quoteElement = document.createElement('p');
    quoteElement.innerHTML = `"${quote}"<br> -${author}`;
    document.getElementById("quotes").appendChild(quoteElement);
}




