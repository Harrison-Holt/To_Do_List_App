const display_username = document.getElementById("username"); 
const display_email = document.getElementById("email"); 

document.addEventListener("DOMContentLoaded", async () => {
    const accessToken = localStorage.getItem("accessToken"); 
    const idToken = localStorage.getItem("idToken");
    const user_id = localStorage.getItem("user_id"); 
    const display_username = document.getElementById("username");
    const display_email = document.getElementById("email");

    if (!accessToken || !idToken || !user_id || isTokenExpired(accessToken)) {
        showNotification("⚠️ Unauthorized access. Please log in.", "warning");
        window.location.href = "./login.html"; // Redirect to login page
        return;
    }

    console.log("✅ User is authenticated.");

    try {
        const accessPayload = JSON.parse(atob(accessToken.split(".")[1])); 
        const username = accessPayload.username || "Unknown User"; 

        const idPayload = JSON.parse(atob(idToken.split(".")[1])); 
        const email = idPayload.email || "No Email Found";

        console.log("🔹 Username:", username);
        console.log("🔹 Email:", email);

        if (display_username) display_username.textContent = username;
        if (display_email) display_email.textContent = email;
    } catch (error) {
        console.error("❌ Error decoding token:", error);
        showNotification("⚠️ Session expired. Please log in again.", "error");
        window.location.href = "./login.html";
    }
});

// Function to Check if Token is Expired
function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
        const expiry = payload.exp * 1000; // Convert to milliseconds
        return Date.now() > expiry; 
    } catch (error) {
        console.error("❌ Error decoding token:", error);
        return true; // Assume expired if decoding fails
    }
}

    
async function delete_account() {
    const token = localStorage.getItem("accessToken"); 
    const user_id = localStorage.getItem("user_id"); 

    const accessPayload = JSON.parse(atob(token.split(".")[1])); 
    const username = accessPayload.username; 
    try {
        const response = await fetch('https://ssfjhkn9w2.execute-api.us-east-1.amazonaws.com/dev/delete_account', {
            method: 'DELETE', 
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }, 
            body: JSON.stringify({ username, user_id })
        }); 

        if (response.ok) {
            const data = await response.json();
            console.log("✅", data.message);
            ("✅ Account deleted successfully.");
            localStorage.clear();
            window.location.href = './login.html'; 
        } else {
            const errorText = await response.text();
            console.error("❌ Failed to delete account:", errorText);
            showNotification("⚠️ Failed to delete account. Please try again.", "error");
        }
    } catch (error) {
        console.error('❌ Error deleting account:', error);
        showNotification("⚠️ Error deleting account. Please try again.", "error");
    }
}

document.getElementById('delete_account_button').addEventListener('click', () => {
    const confirmDelete = confirm("⚠️ Are you sure you want to delete your account? This action is irreversible.");
    if (confirmDelete) {
        delete_account(); 
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

