document.addEventListener("DOMContentLoaded", function() {
    const logoutButton = document.getElementById('logout_button');

    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            // Clear the JWT token from localStorage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user_id');

            // Redirect the user to the login page
            window.location.href = 'login.html';
        });
    }
});
