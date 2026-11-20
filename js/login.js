/* login.js  -  One login form for ALL users (login.html)
   The user types an email (or username) and a password only.
   We find the account in the users array, check its status, and then
   a switch statement on the account's role picks the dashboard page.

   Pattern from Lecture 05 / Lab 04:
     <form onsubmit="return validateLogin()">
     return false  -> the form is not sent, the user stays on the page
     return true   -> the browser opens the page written in "action" */


function validateLogin() {
  // 1. Read what the user typed (.value)
  let account = document.getElementById("loginEmail").value.trim();
  let password = document.getElementById("loginPassword").value;

  let isValid = true;
  clearLoginErrors();

  // 2. Check the fields
  if (isEmpty(account)) {
    showError("loginEmail", "Please enter your email or username.");
    isValid = false;
  }

  if (isEmpty(password)) {
    showError("loginPassword", "Please enter your password.");
    isValid = false;
  } else if (password.length < 8) {
    showError("loginPassword", "Password must be at least 8 characters.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  // 3. Find the account: the username OR the email can be used
  let foundUser = null;
  for (const user of users) {
    let sameName = user.username.toLowerCase() === account.toLowerCase();
    let sameEmail = user.email.toLowerCase() === account.toLowerCase();
    if (sameName || sameEmail) {
      foundUser = user;
    }
  }

  if (foundUser === null || foundUser.password !== password) {
    showMessage("loginMessage", "Wrong email or password. Please try again.", "error");
    return false;
  }

  // 4. Only Active accounts may log in
  if (foundUser.status === "Pending") {
    showMessage("loginMessage", "Hello " + foundUser.name + ", your " + foundUser.role.toLowerCase() +
                " account is waiting for an admin to approve it. Please try again later.", "info");
    return false;
  }
  if (foundUser.status === "Suspended") {
    showMessage("loginMessage", "This account is suspended. Please contact DriveHub support on 16263.", "error");
    return false;
  }
  if (foundUser.status === "Deactivated") {
    showMessage("loginMessage", "This account has been deactivated by the administrator.", "error");
    return false;
  }

  // 5. Open the right dashboard for this role
  let form = document.getElementById("loginForm");
  switch (foundUser.role) {
    case "Admin":
      form.action = "admin.html";
      break;
    case "Employee":
      form.action = "employee.html";
      break;
    case "Vendor":
      form.action = "vendor.html";
      break;
    case "Customer":
      form.action = "customer.html";
      break;
  }

  console.log("Login OK: " + foundUser.name + " (" + foundUser.role + ") -> " + form.action);
  return true;
}


function clearLoginErrors() {
  clearErrors(["loginEmail", "loginPassword"]);
  hideMessage("loginMessage");
}


// "Show password": switch the input type between password and text
function togglePassword() {
  let passwordInput = document.getElementById("loginPassword");
  if (document.getElementById("showPassword").checked) {
    passwordInput.type = "text";
  } else {
    passwordInput.type = "password";
  }
}


// The "Use" buttons in the demo accounts table fill in the form
function fillDemo(account, password) {
  document.getElementById("loginEmail").value = account;
  document.getElementById("loginPassword").value = password;
  clearLoginErrors();
}


/* FORGOT PASSWORD: the security question is checked here */
function resetPassword() {
  let email = document.getElementById("resetEmail").value.trim();
  let question = document.getElementById("resetQuestion").value;
  let answer = document.getElementById("resetAnswer").value.trim();
  let newPassword = document.getElementById("resetNew").value;
  let confirmPassword = document.getElementById("resetConfirm").value;

  let isValid = true;
  clearErrors(["resetEmail", "resetQuestion", "resetAnswer", "resetNew", "resetConfirm"]);
  hideMessage("resetMessage");

  if (isValidEmail(email) === false) {
    showError("resetEmail", "Please enter a valid email address.");
    isValid = false;
  }

  if (question === "") {
    showError("resetQuestion", "Please choose your security question.");
    isValid = false;
  }

  if (isEmpty(answer)) {
    showError("resetAnswer", "Please type your answer.");
    isValid = false;
  }

  if (newPassword.length < 8) {
    showError("resetNew", "The new password must be at least 8 characters.");
    isValid = false;
  }

  if (newPassword !== confirmPassword) {
    showError("resetConfirm", "The two passwords are not the same.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  // Find the account and change its password in the users array
  let position = -1;
  for (let i = 0; i < users.length; i++) {
    if (users[i].email.toLowerCase() === email.toLowerCase()) {
      position = i;
    }
  }

  if (position === -1) {
    showMessage("resetMessage", "No DriveHub account uses that email address.", "error");
    return false;
  }

  users[position].password = newPassword;
  showMessage("resetMessage", "The password for <strong>" + users[position].name +
              "</strong> has been reset. You can log in with it now.", "success");
  document.getElementById("resetForm").reset();
  return false;   // never leave the page
}


/* START: runs once when the page has loaded */
console.log("Login page ready. " + users.length + " accounts loaded.");
