
const display_username = document.getElementById("username"); 

const payload = JSON.parse(atob(token.split('.')[1]));

console.log(payload); 
