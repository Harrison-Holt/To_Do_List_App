export function checkLoginStatus() {
    const token = localStorage.getItem('token');

    // Check if the token exists
    if (!token) {
        window.location.href = '/login.html'; // Redirect to login if no token
        return;
    }

    // Decode the JWT token to check for expiration
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isTokenExpired = payload.exp * 1000 < Date.now();

        if (isTokenExpired) {
            alert('Your session has expired. Please log in again.');
            localStorage.removeItem('token');
            window.location.href = '/login.html';
            return;
        }
    } catch (e) {
        console.error('Failed to decode token:', e);
        window.location.href = '/login.html';
        return;
    }

    // Attempt to verify the token by calling a protected API endpoint
    fetch('/api/verify', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`, // Ensure the token is correctly formatted
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            document.getElementById('protected-content').style.display = 'block'; // Show content if the token is valid
        } else {
            throw new Error('Failed to verify token');
        }
    })
    .catch(error => {
        console.error('Error verifying token:', error);
        localStorage.removeItem('token');
    });
}

// Automatically check login status on page load
window.onload = checkLoginStatus;
