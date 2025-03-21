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
        showNotification("All fields are required!", "warning");
        return;
    }

    check_for_strong_password();
    if (!password_input.checkValidity()) {
        showNotification(password_input.validationMessage, "warning");
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
            const responseData = await response.json(); 
            showNotification("Registration successful! Check your email for the confirmation code.");

            if (responseData.user_id) {
                localStorage.setItem("user_id", responseData.user_id);
                console.log("✅ User ID stored:", responseData.user_id);
            } else {
                console.warn("❌ No user_id returned from API.");
            }
        } else {
            const error = await response.json();
            showNotification(`Error: ${error.message}`, "error");
            console.error("Error:", error);
        }
    } catch (error) {
        console.error("Network error:", error);
        showNotification("An error occurred. Please try again later.", "error");
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
        showNotification("All fields are required for verification!");
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
            showNotification("Verification successful! You can now log in.", "success");
            window.location.href = "./login.html";
        } else {
            const error = await response.json();
            showNotification(`Error: ${error.message}`, "error");
            console.error("Error:", error);
        }
    } catch (error) {
        console.error("Network error:", error);
        showNotification("An error occurred. Please try again later.", "error");
    }
});

function showNotification(message, type = "success", duration = 6000) {
    const notification = document.getElementById("notification");
    notification.innerText = message;
    notification.className = `notification ${type} show`;

    // Hide after a few seconds
    setTimeout(() => {
        notification.classList.remove("show");
    }, duration);
}