//GETTING BOTH REGISTER AND LOGIN BUTTONS AND ADDING CLICK EVENTS TO THEM : IF REG IS CLICKED LOGIN GOES INCTIVE AND VICEVERSA

const loginBtn = document.getElementById("loginBtn");
console.log(loginBtn);
const registerBtn = document.getElementById("registerBtn");

loginBtn.addEventListener("click", () => {
    loginBtn.classList.add("active");
    registerBtn.classList.remove("active");
});

registerBtn.addEventListener("click", () => {
    registerBtn.classList.add("active");
    loginBtn.classList.remove("active");
});









