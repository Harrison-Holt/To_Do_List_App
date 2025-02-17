let tasks_list = [];
const { jsPDF } = window.jspdf || {};

async function delete_task(task_id) {

    try {
        const user_id = localStorage.getItem('user_id'); 
        const token = localStorage.getItem('accessToken'); 

        if (!user_id) {
            console.error("❌ User ID not found in localStorage.");
            alert("⚠️ User ID missing. Please log in again.");
            return;
        }

        const confirmDelete = confirm("🗑️ Are you sure you want to delete this task?");
        if (!confirmDelete) return;

        const url = `https://ssfjhkn9w2.execute-api.us-east-1.amazonaws.com/dev/delete_task`;

        const response = await fetch(url, { 
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ user_id, task_id }) 
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Failed to delete task:", errorText);
            alert("⚠️ Failed to delete task. Please try again later.");
            return;
        }

        console.log("✅ Task deleted successfully");

        // ✅ Remove task from `tasks_list` in memory
        tasks_list = tasks_list.filter(task => task.task_id !== task_id);
        
        // ✅ Clear UI if no tasks remain
        if (tasks_list.length === 0) {
            console.log("ℹ️ No tasks left. Clearing UI.");
            clearTaskContainers();
        } else {
            renderTasks(tasks_list); // ✅ Re-render updated task list
        }

        alert("🗑️ Task deleted successfully!");

    } catch (error) {
        console.error("❌ Error deleting task:", error);
        alert("⚠️ Error deleting task. Please try again later.");
    }
}

// ✅ Function to clear all task containers
function clearTaskContainers() {
    document.querySelector('.tasks_today').innerHTML = '';
    document.querySelector('.later_tasks').innerHTML = '';
    document.querySelector('.completed_tasks').innerHTML = '';
    document.querySelector('.past_due_items_container').innerHTML = '';

}

async function get_tasks() {
    try {
        const user_id = localStorage.getItem('user_id');
        const token = localStorage.getItem('accessToken');

        if (!user_id) {
            console.error("❌ User ID not found in localStorage.");
            alert("⚠️ User ID missing. Please log in again.");
            return;
        }

        const url = `https://ssfjhkn9w2.execute-api.us-east-1.amazonaws.com/dev/get_tasks?user_id=${user_id}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.error("❌ Failed to fetch tasks:", response.statusText);
            alert("⚠️ Failed to fetch tasks. Please try again later.");
            return;
        }

        const data = await response.json();
        tasks_list = data.tasks.map(task => ({
            ...task,
            task_completed: task.task_completed.toString() // ✅ Ensure it's always a string
        }));

        console.log("✅ Fetched tasks successfully:", tasks_list);

        if (tasks_list.length === 0) {
            alert("ℹ️ No tasks found. Start by adding a new task!");
        } else {
            renderTasks(tasks_list); 
        }

    } catch (error) {
        console.error("❌ Error fetching tasks:", error);
        alert("⚠️ Error fetching tasks. Please try again later.");
    }
}





document.addEventListener("DOMContentLoaded", async () => {


        const token = localStorage.getItem('accessToken');
        const user_id = localStorage.getItem('user_id'); // ✅ Retrieve user_id directly
        
        if (!token || !user_id || isTokenExpired(token)) {
            alert("⚠️ Unauthorized access. Please log in.");
            window.location.href = './login.html'; // Redirect unauthorized users
            return;
        }
        
    
    function isTokenExpired(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiry = payload.exp * 1000; // Convert to milliseconds
            return Date.now() > expiry; // ✅ True if expired, false if still valid
        } catch (error) {
            console.error("❌ Error decoding token:", error);
            return true; // ✅ Assume expired if decoding fails
        }
    }
    await get_tasks(); // ✅ Ensure tasks are fetched before rendering
    renderTasks(tasks_list); // ✅ Use updated `tasks_list`

    const add_task_button = document.getElementById("add_task_button");
    const export_task_button = document.getElementById("export_task_button");

    add_task_button.addEventListener('click', function() {
        window.location.href = 'add_task.html';
    });

    export_task_button.addEventListener('click', function() {
        export_tasks(tasks_list);
    });

    get_quote_of_the_day();
});


// Function to export tasks to PDF
function export_tasks(tasks) {

    if(!tasks || tasks.length === 0) {
        alert("no tasks to export!"); 
        return; 
    }

    const doc = new jsPDF();
    let y = 10;
    tasks.forEach(task => {
        doc.text(10, y, `Task: ${task.task_name}`);
        y += 10;
        doc.text(10, y, `Due Date: ${formatDate(task.task_due_date)}`);
        y += 10;F
        doc.text(10, y, `Due Time: ${formatTime(task.task_due_time)}`);
        y += 10;
        doc.text(10, y, `Priority: ${task.task_priority}`);
        y += 10;
        doc.text(10, y, `Completed: ${task.task_completed}`);
        y += 20;
    });

    doc.save('tasks.pdf');
}

async function complete_task(task_id) {
    try {
        const user_id = localStorage.getItem('user_id'); 
        const token = localStorage.getItem('accessToken'); 

        if (!user_id) {
            console.error("❌ User ID not found in localStorage.");
            alert("⚠️ User ID missing. Please log in again.");
            return;
        }

        console.log("🔹 Completing task with task_id:", task_id);

        const url = `https://ssfjhkn9w2.execute-api.us-east-1.amazonaws.com/dev/complete_task`;

        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                user_id, 
                task_id, 
            }) 
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Failed to complete task:", errorText);
            alert("⚠️ Failed to complete task. Please try again later.");
            return;
        }

        const data = await response.json();
        console.log('✅ Task completed successfully:', data);

        // ✅ Ensure the global tasks list updates with `true` as a boolean
        tasks_list = tasks_list.map(task => {
            if (task.task_id == task_id) { 
                return { ...task, task_completed: true }; // ✅ Store as a boolean
            }
            return task;
        });

        renderTasks(tasks_list); // ✅ Re-render the task list

        alert("✅ Task marked as completed!");

    } catch (error) {
        console.error("❌ Error completing task:", error);
        alert("⚠️ Error completing task. Please try again later.");
    }
}



function renderTasks(tasks) {
    const tasks_due_today_container = document.querySelector('.tasks_today');
    const tasks_due_later_container = document.querySelector('.later_tasks');
    const completed_tasks_container = document.querySelector('.completed_tasks');
    const past_due_items_container = document.querySelector('.past_due_items_container');

    // Clear previous task elements
    tasks_due_today_container.innerHTML = '';
    tasks_due_later_container.innerHTML = '';
    completed_tasks_container.innerHTML = '';
    past_due_items_container.innerHTML = '';

    // Get current date in YYYY-MM-DD format
    const current_date = new Date().toISOString().split('T')[0];

    tasks.forEach(task => {
        const task_card = create_task_card(task);

        // ✅ Convert `task_completed` from a string to a boolean
        const isCompleted = task.task_completed === "1" || task.task_completed === 1 || task.task_completed === true; 

        // Convert task date to local date format
        const task_due_date = new Date(task.task_date).toISOString().split('T')[0];

        if (isCompleted) {
            completed_tasks_container.appendChild(task_card);
        } else if (task_due_date === current_date) {
            tasks_due_today_container.appendChild(task_card);
        } else if (task_due_date > current_date) {
            tasks_due_later_container.appendChild(task_card);
        } else {
            past_due_items_container.appendChild(task_card);
        }
    });
}






function edit_task_by_details(task_name, task_due_date, task_due_time, task_priority) {
    // Find the task in the global task list
    const task = tasks_list.find(t => 
        t.task_name === task_name &&
        t.task_due_date === task_due_date &&
        t.task_due_time === task_due_time &&
        t.task_priority === task_priority
    );

    if (task) {
        // Redirect to add_task.html with the found task_id
        window.location.href = `add_task.html?task_id=${task.task_id}`;
    } else {
        alert("⚠️ Task not found. Please try again.");
    }
}


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
        delete_task(task.task_id);
    };

    const edit_task_button = document.createElement('button');
    edit_task_button.classList.add('edit_button');
    edit_task_button.textContent = 'Edit';
    edit_task_button.onclick = function() {
        edit_task_by_details(task.task_name, task.task_date, task.task_time, task.task_priority);
    };

    // ✅ Convert `task_completed` to boolean
    const isCompleted = task.task_completed === "1" || task.task_completed === 1 || task.task_completed === true; 

    // Adjust the date to local time zone and format it
    const formattedDate = formatDate(task.task_date);
    const formattedTime = formatTime(task.task_time);

    list_items.innerHTML = `📌 <strong>${task.task_name}</strong><br> 
        📅 Due Date: ${formattedDate}<br>
        ⏰ Due Time: ${formattedTime}<br>
        🚦 Priority: ${task.task_priority}`;

    task_card.appendChild(thumbtack);
    task_card.appendChild(list_items);
    task_card.appendChild(delete_task_button);

    if (!isCompleted) {
        // ✅ Task is NOT completed: Allow marking as complete
        const complete_task_button = document.createElement('button');
        complete_task_button.classList.add('completed_card');
        complete_task_button.textContent = 'Complete';
        complete_task_button.onclick = function() {
            complete_task(task.task_id);
        };
        task_card.appendChild(complete_task_button);
        task_card.appendChild(edit_task_button);
    } else {
        // ✅ Task is completed: Apply proper styling
        list_items.innerHTML += `<br><br><span> ✅ Task Completed! </span>`;
        task_card.style.backgroundColor = 'lightgray'; // ✅ Light gray background for completed tasks
        list_items.style.color = 'black'; // ✅ Ensure text color remains readable
    }

    return task_card;
}




// Correctly filter and display tasks due today
function get_tasks_due_today() {
    const tasks_due_today_container = document.querySelector('.tasks_today');
    const current_day = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    const tasks_due_today = tasks_list.filter(task => {
        const task_due_date = new Date(task.task_due_date).toISOString().split('T')[0];
        return task_due_date === current_day && !task.task_completed;
    });

    tasks_due_today_container.innerHTML = '';
    tasks_due_today.forEach(task => {
        const task_card = create_task_card(task);
        tasks_due_today_container.appendChild(task_card);
    });
}

// Correctly filter and display tasks due later
function get_tasks_due_later() {
    const tasks_due_later_container = document.querySelector('.later_tasks');
    const current_day = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    const tasks_due_later = tasks_list.filter(task => {
        const task_due_date = new Date(task.task_due_date).toISOString().split('T')[0];
        return task_due_date > current_day && !task.task_completed;
    });

    tasks_due_later_container.innerHTML = '';
    tasks_due_later.forEach(task => {
        const task_card = create_task_card(task);
        tasks_due_later_container.appendChild(task_card);
    });
}

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

function get_past_due_items() {
    const past_due_items_container = document.querySelector('.past_due_items_container');
    const current_day = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    const tasks_past_due = tasks_list.filter(task => {
        const task_due_date = new Date(task.task_due_date).toISOString().split('T')[0];
        return task_due_date < current_day && !task.task_completed;
    });

    past_due_items_container.innerHTML = '';
    tasks_past_due.forEach(task => {
        const task_card = create_task_card(task);
        past_due_items_container.appendChild(task_card);
    });
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US');
}

function formatTime(timeString) {
    if (!timeString) return '';
    const [hour, minute] = timeString.split(':');
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minute} ${ampm}`;
}

// ✅ Fetch and display the quote of the day with authentication
function get_quote_of_the_day() {
    const quotesContainer = document.getElementById("quotes");
    const currentDate = new Date().toISOString().slice(0, 10); // ISO format: YYYY-MM-DD

    let storedQuoteData = localStorage.getItem('dailyQuote');
    if (storedQuoteData) {
        storedQuoteData = JSON.parse(storedQuoteData);
        if (storedQuoteData.date === currentDate) {
            displayQuote(storedQuoteData.quote, storedQuoteData.author);
            return;
        }
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
        console.error("❌ No access token found. Please log in.");
        return;
    }

    // Replace API Ninjas with Your AWS Lambda API Gateway URL
    const apiLink = `https://ssfjhkn9w2.execute-api.us-east-1.amazonaws.com/dev/get_quote`;

    fetch(apiLink, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("FAILED CONNECTING TO QUOTE API");
        }
        return response.json();
    })
    .then(data => {
        if (data && data.length > 0) {
            const firstQuote = data[0];
            displayQuote(firstQuote.quote, firstQuote.author);
            localStorage.setItem('dailyQuote', JSON.stringify({
                quote: firstQuote.quote,
                author: firstQuote.author,
                date: currentDate
            }));
        }
    })
    .catch(error => {
        console.error("Error getting quote:", error);
    });
}

// ✅ Display the quote
function displayQuote(quote, author) {
    const quoteElement = document.createElement('p');
    quoteElement.innerHTML = `"${quote}"<br> -${author}`;
    document.getElementById("quotes").appendChild(quoteElement);
}

function displayQuote(quote, author) {
    const quoteElement = document.createElement('p');
    quoteElement.innerHTML = `"${quote}"<br> -${author}`;
    document.getElementById("quotes").appendChild(quoteElement);
}


function displayQuote(quote, author) {
    const quoteElement = document.createElement('p');
    quoteElement.innerHTML = `"${quote}"<br> -${author}`;
    document.getElementById("quotes").appendChild(quoteElement);
}





