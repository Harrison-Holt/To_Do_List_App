document.getElementById("submit_login_button").addEventListener("click", async function (event) {
    event.preventDefault();

    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value.trim();

    if (!username || !password) {
        showNotification("All fields are required!", "error");
        return;
    }

    try {
        const response = await fetch("https://ssfjhkn9w2.execute-api.us-east-1.amazonaws.com/dev/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();

            // Store authentication tokens in localStorage
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("idToken", data.idToken);
            localStorage.setItem("refreshToken", data.refreshToken);

            console.log("✅ Tokens saved successfully!");

            // Decode the JWT to extract `user_id`
            const decodedPayload = JSON.parse(atob(data.idToken.split(".")[1]));
            const user_id = decodedPayload.sub; // Cognito's unique user identifier

            // Store `user_id` in localStorage
            localStorage.setItem("user_id", user_id);

            console.log("✅ User ID stored:", user_id);

            showNotification("Login Successful!", "success");
            window.location.href = "./index.html"; // Redirect to homepage

        } else {
            const error = await response.json();
            showNotification(`Error: ${error.message}`, "error");
            console.error("❌ Login failed:", error);
        }
    } catch (error) {
        console.error("❌ Network error:", error);
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
