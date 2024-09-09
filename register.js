
document.getElementById("submit_register_button").addEventListener('click', async function(event) {
    event.preventDefault(); 

    let username = document.getElementById("username").value.trim(); 
    let email = document.getElementById("email").value.trim(); 
    let password = document.getElementById("password").value.trim(); 

    if(!username || !email || !password) {
        alert("All fields are required!"); 
        return; 
    }
    try {
        const response = await fetch('/api/register', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify({ username, email, password})
        }); 

        if(response.ok) {
            window.location.href = './index.html'; 
        } else {
            const error = await response.json();
            console.error("Error: ", error); 
        }

    } catch(error) {
        console.error("Error sensing user data: ", error); 
        alert("An error occurred. Please try again later."); 
    }
}); 