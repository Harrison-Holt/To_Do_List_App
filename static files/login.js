document.getElementById("submit_login_button").addEventListener("click", async function (event) {
    event.preventDefault();

    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("All fields are required!");
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

            // ✅ Store authentication tokens in localStorage
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("idToken", data.idToken);
            localStorage.setItem("refreshToken", data.refreshToken);

            console.log("✅ Tokens saved successfully!");

            // ✅ Decode the JWT to extract `user_id`
            const decodedPayload = JSON.parse(atob(data.idToken.split(".")[1]));
            const user_id = decodedPayload.sub; // Cognito's unique user identifier

            // ✅ Store `user_id` in localStorage
            localStorage.setItem("user_id", user_id);

            console.log("✅ User ID stored:", user_id);

            alert("Login Successful!");
            window.location.href = "./index.html"; // Redirect to homepage

        } else {
            const error = await response.json();
            alert(`Error: ${error.message}`);
            console.error("❌ Login failed:", error);
        }
    } catch (error) {
        console.error("❌ Network error:", error);
        alert("An error occurred. Please try again later.");
    }
});
