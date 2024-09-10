// Function to check for strong password
function check_for_strong_password() {
    const password_input = document.getElementById("password");
    const password = password_input.value;
    
    // Define the criteria for a strong password
    const password_criteria = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    // Check if the password meets the criteria
    if (!password_criteria.test(password)) {
        password_input.setCustomValidity('Password must be at least 8 characters long and contain an uppercase letter, a number, and a special character.'); 
    } else {
        password_input.setCustomValidity(''); 
    }
}

// Add an input event listener to validate the password in real-time
document.getElementById('password').addEventListener('input', check_for_strong_password); 

// Register form submission event listener
document.getElementById("submit_register_button").addEventListener('click', async function(event) {
    event.preventDefault(); 

    let username = document.getElementById("username").value.trim(); 
    let email = document.getElementById("email").value.trim(); 
    let password_input = document.getElementById("password");
    let password = password_input.value.trim(); 

    // Check if all fields are filled
    if (!username || !email || !password) {
        alert("All fields are required!"); 
        return; 
    }

    // Check the password validity before submission
    check_for_strong_password();

    // If password does not meet criteria, prevent form submission
    if (!password_input.checkValidity()) {
        alert(password_input.validationMessage); // Show the custom error message
        return; 
    }

    // Try to register the user
    try {
        const response = await fetch('/api/register', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify({ username, email, password })
        }); 

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token); 
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

