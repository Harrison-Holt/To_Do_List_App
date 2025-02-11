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

document.getElementById("submit_register_button").addEventListener("click", async function (event) {
    event.preventDefault();

    let username = document.getElementById("username").value.trim();
    let email = document.getElementById("email").value.trim();
    let password_input = document.getElementById("password");
    let password = password_input.value.trim();

    if (!username || !email || !password) {
        alert("All fields are required!");
        return;
    }

    check_for_strong_password();
    if (!password_input.checkValidity()) {
        alert(password_input.validationMessage);
        return;
    }

    try {
        const response = await fetch("https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, email, password })
        });

        if (response.ok) {
            alert("Registration successful! Check your email to confirm.");
            window.location.href = "./index.html";
        } else {
            const error = await response.json();
            alert(`Error: ${error.message}`);
            console.error("Error:", error);
        }
    } catch (error) {
        console.error("Network error:", error);
        alert("An error occurred. Please try again later.");
    }
});
