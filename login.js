document.getElementById("submit_login_button").addEventListener('click', async function(event) {
    event.preventDefault(); 

    let username = document.getElementById("username").value.trim(); 
    let password = document.getElementById("password").value.trim(); 

    if (!username || !password) {
        alert("All fields are required!"); 
        return; 
    }

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify({ username, password })
        }); 

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token); // Store the JWT token correctly
            window.location.href = './inde.html'; // Redirect to the protected page
        } else {
            const error = await response.json();
            alert(`Error: ${error.message}`); // Display error message from server
        }
    } catch (error) {
        console.error("Error sending user data: ", error); 
        alert("An error occurred. Please try again later."); 
    }
});
