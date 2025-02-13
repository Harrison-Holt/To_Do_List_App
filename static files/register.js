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

// Register Button Click Handler
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
        const response = await fetch("https://ssfjhkn9w2.execute-api.us-east-1.amazonaws.com/dev/registration", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "register",
                username,
                email,
                password,
                confirmation_code: "" // Not required for registration
            })
        });

        if (response.ok) {
            alert("Registration successful! Check your email for the confirmation code.");
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

// Verification Button Click Handler
document.getElementById("submit_register_verify").addEventListener("click", async function (event) {
    event.preventDefault();

    let username = document.getElementById("username").value.trim();
    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();
    let confirmation_code = document.getElementById("confirmation_code").value.trim();

    if (!username || !email || !password || !confirmation_code) {
        alert("All fields are required for verification!");
        return;
    }

    try {
        const response = await fetch("https://ssfjhkn9w2.execute-api.us-east-1.amazonaws.com/dev/registration", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "verify",
                username,
                email,
                password,
                confirmation_code
            })
        });

        if (response.ok) {
            alert("Verification successful! You can now log in.");
            window.location.href = "./login.html";
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
