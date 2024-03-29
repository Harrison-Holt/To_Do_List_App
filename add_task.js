const submit_task_info_button = document.getElementById("submit_task_info_button"); 
let tasks = JSON.parse(localStorage.getItem('tasks')) || []; 

function get_task_info() {

    const task_name = document.getElementById("task_name").value; 
    const task_date = document.getElementById("due_date").value;
    const task_time = document.getElementById("due_time").value; 
    const priority = document.getElementById("select_priority").value; 
    const task_completed = false;  

    let id = new Date().getTime(); 
    let task_info = {task_name, task_date, task_time, priority, id, task_completed}; 

    return task_info; 
}

submit_task_info_button.addEventListener('click', function(event) {

    event.preventDefault(); 
    console.log("New task added:", tasks); 

    let task_info = get_task_info(); 
    tasks.push(task_info); 

    localStorage.setItem('tasks', JSON.stringify(tasks)); 
    window.location.href='list.html'; 

}); 
