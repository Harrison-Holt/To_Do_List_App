// ✅ Display User Info Section
const display_username = document.getElementById("username"); 
const display_email = document.getElementById("email"); 

document.addEventListener("DOMContentLoaded", async () => {

const token = localStorage.getItem('accessToken');
const user_id = localStorage.getItem('user_id'); // ✅ Retrieve user_id directly

if (!token || !user_id || isTokenExpired(token)) {
    alert("⚠️ Unauthorized access. Please log in.");
    window.location.href = './login.html'; // Redirect unauthorized users
    return;
}
});

function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp * 1000; // Convert to milliseconds
        return Date.now() > expiry; // ✅ True if expired, false if still valid
    } catch (error) {
        console.error("❌ Error decoding token:", error);
        return true; // ✅ Assume expired if decoding fails
    }
}

try {
    const payload = JSON.parse(atob(token.split('.')[1])); 

    const username = payload.username || "Unknown User"; 
    const email = payload.email || "No Email Found"; 

    display_username.innerHTML = `${username}`; 
    display_email.innerHTML = `${email}`; 
} catch (error) {
    console.error("❌ Error decoding token:", error);
    alert("⚠️ Invalid session. Please log in again.");
    window.location.href = "./login.html";
}

// ✅ Delete Account Function
async function delete_account() {
    try {
        const response = await fetch('https://ssfjhkn9w2.execute-api.us-east-1.amazonaws.com/dev/delete_account', {
            method: 'DELETE', 
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // ✅ Ensure token is sent
            }, 
            body: JSON.stringify({ username, user_id }) // ✅ Send user_id from localStorage
        }); 

        if (response.ok) {
            const data = await response.json();
            console.log("✅", data.message);
            alert("✅ Account deleted successfully.");
            localStorage.clear(); // ✅ Remove user session
            window.location.href = './login.html'; 
        } else {
            const errorText = await response.text();
            console.error("❌ Failed to delete account:", errorText);
            alert("⚠️ Failed to delete account. Please try again.");
        }
    } catch (error) {
        console.error('❌ Error deleting account:', error);
        alert("⚠️ Error deleting account. Please try again.");
    }
}

// ✅ Attach Delete Button Event Listener
document.getElementById('delete_account_button').addEventListener('click', () => {
    const confirmDelete = confirm("⚠️ Are you sure you want to delete your account? This action is irreversible.");
    if (confirmDelete) {
        delete_account(); 
    }
});



