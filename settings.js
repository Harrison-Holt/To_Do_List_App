const confirmDeleteButton = document.getElementById('confirmDeleteButton');

confirmDeleteButton.addEventListener('click', async () => {
    try {
        // Call the DELETE API endpoint using fetch with JWT in headers
        const response = await fetch('/api/delete_account', { 
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Include JWT token for authentication
            }
        });

        // Check the response status
        if (response.ok) {
            alert('Account deleted successfully.');
            window.location.href = './login.html'; 
        } else {
            const errorData = await response.json();
            console.error('Failed to delete account:', errorData.message);
            alert(`Error: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        alert('An error occurred while deleting the account. Please try again later.');
    }

    // Close the modal after the API call
    const confirmDeleteModal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal'));
    confirmDeleteModal.hide();
});
