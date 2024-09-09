document.getElementById("submit_register_button").addEventListener('click', async function(event) {
    event.preventDefault(); 

    let username = document.getElementById("username").value.trim(); 
    let password = document.getElementById("password").value.trim(); 

    if (!username || !password) {
        alert("All fields are required!"); 
        return; 
    }

    try {
        const response = await fetch('/api/login', {
            method: 'GET', 
            headers: {
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify({ username, password })
        }); 

        if (response.ok) {
            window.location.href = './index.html'; // Redirect on success
        } else {
            // Check if response is JSON
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const error = await response.json();
                alert(`Error: ${error.message}`); // Display error message
                console.error("Error: ", error); 
            } else {
                // Handle non-JSON response (like HTML error pages)
                const text = await response.text();
                console.error("Unexpected response:", text);
                alert("An unexpected error occurred. Please try again later.");
            }
        }
    } catch (error) {
        console.error("Error sending user data: ", error); 
        alert("An error occurred. Please try again later."); 
    }
});