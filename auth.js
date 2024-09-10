// auth.js

export function checkLoginStatus() {
    const token = localStorage.getItem('token');

    // If no token is found, redirect to the login page
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    // Check if the token is expired by decoding its payload
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

    // Verify the token by making a request to a protected endpoint
    fetch('/api/verify', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
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
        alert('Verification failed. Please log in again.');
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    });
}

// Automatically check login status on page load
window.onload = checkLoginStatus;
