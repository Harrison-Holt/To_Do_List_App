
const display_username = document.getElementById("username"); 
const display_email = document.getElementById("email"); 

const token = localStorage.getItem('token'); 

const payload = JSON.parse(atob(token.split('.')[1])); 

const username = payload.username; 
const email = payload.email; 

display_username.innerHTML = `${username}`; 
display_email.innerHTML = `${email}`; 

