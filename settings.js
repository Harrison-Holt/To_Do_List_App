
const display_username = document.getElementById("username"); 

const token = localStorage.getItem('token'); 

const payload = JSON.parse(atob(token.split('.')[1])); 

console.log(payload); 

