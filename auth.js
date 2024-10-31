 // Check if the user is logged in by verifying the token before displaying the page
 const token = localStorage.getItem('token');
        
 if (!token) {
     // Redirect to login if no token
     window.location.href = '/login.html';
 } else {
     // Attempt to decode the token to check its validity
     try {
         const payload = JSON.parse(atob(token.split('.')[1]));
         const isTokenExpired = payload.exp * 1000 < Date.now();
 
         console.log(payload); 
         
         if (isTokenExpired) {
             alert('Your session has expired. Please log in again.');
             localStorage.removeItem('token');
             window.location.href = '/login.html';
         }
     } catch (e) {
         console.error('Failed to decode token:', e);
         window.location.href = '/login.html';
     }
 }
