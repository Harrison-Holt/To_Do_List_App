// display user info section 
const display_username = document.getElementById("username"); 
const display_email = document.getElementById("email"); 

const token = localStorage.getItem('token'); 

const payload = JSON.parse(atob(token.split('.')[1])); 

const username = payload.username; 
const email = payload.email; 
const user_id = payload.userId; 

display_username.innerHTML = `${username}`; 
display_email.innerHTML = `${email}`; 


// update user info section 
async function update_username(new_username, user_id) {
    try {
        const response = await fetch('/api/update_username', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify({ new_username, user_id })  
     }); 
        const data = await response.json(); 
        console.log(data.message); 

    } catch(error) {
        console.error("Error fetching data", error); 
    }
}

async function update_email(new_email, user_id) {
    try {
        const response = await fetch('/api/update_email', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify({ new_email, user_id })
        }); 
            const data = response.json(); 
            console.log(data.message); 

    } catch(error) {
        console.error('Error fetching data: ', error)
    }
}

// delete account function 
async function delete_account(user_id) {
    try {
        const response = await fetch('/api/delete_account', {
            method: 'DELETE', 
            headers: {
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify({user_id})
        }); 

        const data = await response.json(); 
        console.log(data.message); 
    } catch(error) {
        console.error('Error fetching data: ', error); 
    }
}

// button listeners for updating info 
document.getElementById('update_username_button').addEventListener('click', (event) => {
    event.preventDefault(); 

    const new_username = document.getElementById('username_input').value; 
    
    update_username(new_username, user_id); 
}); 

document.getElementById('update_email_button').addEventListener('click', (event) => {
    event.preventDefault(); 

    const new_email = document.getElementById('email_input').value; 
    
    update_email(new_email, user_id); 
}); 

document.getElementById('delete_account_button').addEventListener('click', () => {

    delete_account(user_id); 
}); 

