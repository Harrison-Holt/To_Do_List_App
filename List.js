let tasks_list = []; 

// function to retrieve tasks from localStorage 
function get_tasks() {
    tasks_list = JSON.parse(localStorage.getItem('tasks')) || []; 
}

document.addEventListener("DOMContentLoaded", () => {
    get_tasks(); 
const add_task_button = document.getElementById("add_task_button"); 
const export_task_button = document.getElementById("export_task_button"); 

add_task_button.addEventListener('click', function() {
    window.location.href = 'add_task.html'; 
}); 

export_task_button.addEventListener('click', function() {
    export_tasks(); 
}); 

function export_tasks() {

     
    let json_tasks = JSON.stringify(tasks_list, null, 2); 
    let blob = new Blob([json_tasks], { type: 'application/json'}); 
    let url = URL.createObjectURL(blob); 
    let a = document.createElement('a'); 

    a.href = url; 
    a.download = 'tasks_list.json'; 

    document.body.appendChild(a); 
    a.click(); 
    document.body.removeChild(a); 
}

// function to delete task card from localStorage/List
function delete_task(task_id) {

     

    tasks_list = tasks_list.filter(task => task_id !== task.id); 

    localStorage.setItem('tasks', JSON.stringify(tasks_list)); 
    get_tasks_due_today(); 
    get_tasks_due_later(); 
    get_completed_tasks();
    get_past_due_items();  
}

// function to mark a task card as completed 
function complete_task(task_id) {


    tasks_list = tasks_list.map(task => {
        if(task_id === task.id) {
            task.task_completed = true; 
        }
        return task; 
    }); 

    localStorage.setItem('tasks', JSON.stringify(tasks_list)); 
    get_tasks_due_today();
    get_completed_tasks(); 
    get_tasks_due_later(); 
    get_past_due_items(); 
}
// function to retrieve the current day for later use 
function get_formatted_date() {
    let current_day = new Date(); 
    current_day.setHours(0,0,0,0); 
    
    return current_day.getFullYear() + '-' 
    + ('0' + (current_day.getMonth() + 1)).slice(-2)
    + '-' + ('0' + (current_day.getDate())).slice(-2);
}

// function to create the task card 
function create_task_card(task) {
    const task_card = document.createElement('div');
    task_card.classList.add('task_card');
    const thumbtack = document.createElement('div');
    thumbtack.classList.add('thumbtack');
    
    const list_items = document.createElement('li');
    list_items.classList.add('card_info');
    const delete_task_button = document.createElement('button');
    delete_task_button.classList.add('task_button');
    delete_task_button.textContent = 'Delete';
    delete_task_button.onclick = function() {
        delete_task(task.id);
    }

    list_items.innerHTML = `Name: ${task.task_name}<br> Due Date: ${task.task_date}<br> 
    Due Time: ${task.task_time}<br> Priority: ${task.priority}`;

    task_card.appendChild(thumbtack);
    task_card.appendChild(list_items);
    task_card.appendChild(delete_task_button);

    if (!task.task_completed) {
        const complete_task_button = document.createElement('button');
        complete_task_button.classList.add('completed_card');
        complete_task_button.textContent = 'Complete';
        complete_task_button.onclick = function() {
            complete_task(task.id);
            complete_task_button.remove();
        }
        task_card.appendChild(complete_task_button);
    } else {
        list_items.innerHTML += `<br><br><span> Task Completed! </span>`;
        task_card.style.backgroundColor = 'grey';
    }

    return task_card;
}

// function to display the tasks due on the current date 
function get_tasks_due_today() {

    const tasks_due_today_container = document.querySelector('.tasks_today'); 
    let current_day = get_formatted_date(); 

    let tasks_due_today = tasks_list.filter(task => task.task_date === current_day); 

    tasks_due_today_container.innerHTML = ''; 
    tasks_due_today.forEach(task => {
        if(task.task_completed === false) {
        const task_card = create_task_card(task); 
        tasks_due_today_container.appendChild(task_card); 
        }
    }); 
}
// function to display the tasks due on the current date 
function get_tasks_due_later() {

    const tasks_due_later_container = document.querySelector('.later_tasks'); 
    let current_day = get_formatted_date(); 

    let tasks_due_today = tasks_list.filter(task => task.task_date > current_day); 

    tasks_due_later_container.innerHTML = ''; 
    tasks_due_today.forEach(task => {
        if(task.task_completed === false) {
        const task_card = create_task_card(task); 
        tasks_due_later_container.appendChild(task_card); 
        }
    }); 
}

// function to display the completed tasks 
function get_completed_tasks() {

    const completed_tasks_container = document.querySelector('.completed_tasks'); 

    completed_tasks_container.innerHTML = ''; 
    tasks_list.forEach(task => {
        if(task.task_completed === true) {
            const task_card = create_task_card(task); 
            completed_tasks_container.appendChild(task_card); 
        }
    }); 
}

// function to display past due tasks 
function get_past_due_items() {

    const past_due_items_container = document.querySelector('.past_due_items_container');  

    past_due_items_container.innerHTML = ''; 
    let current_day = get_formatted_date(); 

    let tasks_past_due = tasks_list.filter(task => task.task_date < current_day); 

    past_due_items_container.innerHTML = ''; 
    tasks_past_due.forEach(task => {
        if(task.task_completed === false) {
        const task_card = create_task_card(task); 
        past_due_items_container.appendChild(task_card); 
        }
    }); 
}

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

get_quote_of_the_day();
get_past_due_items(); 
get_tasks_due_today(); 
get_tasks_due_later(); 
get_completed_tasks();
}); 


