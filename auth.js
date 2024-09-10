export function checkLoginStatus() {
    const token = localStorage.getItem('token');
    const content = document.getElementById('protected-content');

    if (!token) {
        // Redirect to login if no token is found
        window.location.href = '/login.html';
        return;
    }

    // Decode the JWT token to check for expiration
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isTokenExpired = payload.exp * 1000 < Date.now();

    if (isTokenExpired) {
        alert('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        window.location.href = '/login.html';
        return;
    }

    // Attempt to verify the token by calling a protected endpoint
    fetch('/api/verify', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            content.style.display = 'block'; // Show content if the token is valid
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

