/* register.js  -  One registration page for Customer, Vendor, Employee
   Step 1 asks which type of account to open. showTypeFields() then
   displays only the fieldset that type needs, with element.style.display.
   validateRegister() checks every field before the account is added to
   the users array. */

// The three extra fieldsets; only one of them is ever visible
const typeFieldIds = ["customerFields", "vendorFields", "employeeFields"];


/* STEP 1: show the fields that match the chosen type */
function showTypeFields() {
  let chosen = getRadioValue("userRole");

  // Hide all three, then show the one we want
  for (let i = 0; i < typeFieldIds.length; i++) {
    document.getElementById(typeFieldIds[i]).style.display = "none";
  }

  // Take the "selected" highlight off every card
  document.getElementById("typeCardCustomer").className = "type-option";
  document.getElementById("typeCardVendor").className = "type-option";
  document.getElementById("typeCardEmployee").className = "type-option";

  switch (chosen) {
    case "Customer":
      document.getElementById("customerFields").style.display = "block";
      document.getElementById("typeCardCustomer").className = "type-option selected";
      break;
    case "Vendor":
      document.getElementById("vendorFields").style.display = "block";
      document.getElementById("typeCardVendor").className = "type-option selected";
      break;
    case "Employee":
      document.getElementById("employeeFields").style.display = "block";
      document.getElementById("typeCardEmployee").className = "type-option selected";
      break;
  }

  // The rest of the form stays hidden until a type is picked
  if (chosen !== "") {
    document.getElementById("commonFields").style.display = "block";
    document.getElementById("loginFields").style.display = "block";
    document.getElementById("registerButtons").style.display = "block";
    clearError("userRole");
  }
}


/* PASSWORD STRENGTH: runs on every key press in the password box */
function checkStrength() {
  let password = document.getElementById("password").value;
  let meter = document.getElementById("strengthText");

  if (password.length === 0) {
    meter.innerHTML = "";
    meter.style.color = "";
    return;
  }

  let score = 0;
  if (password.length >= 8) { score++; }
  if (password.length >= 12) { score++; }

  let hasLetter = false;
  let hasDigit = false;
  for (let i = 0; i < password.length; i++) {
    if (isDigitsOnly(password[i])) {
      hasDigit = true;
    } else {
      hasLetter = true;
    }
  }
  if (hasLetter && hasDigit) { score++; }

  if (score <= 1) {
    meter.innerHTML = "Weak password";
    meter.style.color = "#C62828";
  } else if (score === 2) {
    meter.innerHTML = "Medium password";
    meter.style.color = "#EF6C00";
  } else {
    meter.innerHTML = "Strong password";
    meter.style.color = "#2E7D32";
  }
}


/* VALIDATE AND CREATE THE ACCOUNT */
function validateRegister() {
  let role = getRadioValue("userRole");
  let fullName = document.getElementById("fullName").value.trim();
  let email = document.getElementById("userEmail").value.trim();
  let phone = document.getElementById("userPhone").value.trim();
  let nid = document.getElementById("userNid").value.trim();
  let dob = document.getElementById("userDob").value;
  let city = document.getElementById("userCity").value;
  let username = document.getElementById("userName").value.trim();
  let password = document.getElementById("password").value;
  let confirmPassword = document.getElementById("confirmPassword").value;
  let question = document.getElementById("securityQuestion").value;
  let answer = document.getElementById("securityAnswer").value.trim();
  let agreed = document.getElementById("agreeTerms").checked;

  let isValid = true;
  clearErrors(["userRole", "fullName", "userEmail", "userPhone", "userNid", "userDob",
               "userCity", "userName", "password", "confirmPassword",
               "securityQuestion", "securityAnswer", "agreeTerms"]);
  hideMessage("registerMessage");

  // ----- Step 1 -----
  if (role === "") {
    showError("userRole", "Please choose the type of account you want.");
    isValid = false;
  }

  // ----- Personal information -----
  if (fullName.length < 3) {
    showError("fullName", "The name must be at least 3 characters.");
    isValid = false;
  }

  if (isValidEmail(email) === false) {
    showError("userEmail", "Please enter a valid email address.");
    isValid = false;
  } else if (emailAlreadyUsed(email)) {
    showError("userEmail", "An account with this email already exists.");
    isValid = false;
  }

  if (isValidPhone(phone) === false) {
    showError("userPhone", "Enter an 11 digit number that starts with 01.");
    isValid = false;
  }

  if (isDigitsOnly(nid) === false || nid.length < 10) {
    showError("userNid", "The NID number must be at least 10 digits.");
    isValid = false;
  }

  if (isEmpty(dob)) {
    showError("userDob", "Please choose your date of birth.");
    isValid = false;
  } else if (daysBetween(dob, todayString()) < 18 * 365) {
    showError("userDob", "You must be at least 18 years old to register.");
    isValid = false;
  }

  if (city === "") {
    showError("userCity", "Please choose your city.");
    isValid = false;
  }

  // ----- Extra fields that only one type needs -----
  if (role === "Vendor") {
    clearErrors(["shopName", "tradeLicence"]);
    if (document.getElementById("shopName").value.trim().length < 3) {
      showError("shopName", "Please enter the showroom name.");
      isValid = false;
    }
    if (isEmpty(document.getElementById("tradeLicence").value)) {
      showError("tradeLicence", "A trade licence number is required for vendors.");
      isValid = false;
    }
  }

  if (role === "Employee") {
    clearErrors(["empDept", "empStaffId"]);
    if (document.getElementById("empDept").value === "") {
      showError("empDept", "Please choose your department.");
      isValid = false;
    }
    if (isEmpty(document.getElementById("empStaffId").value)) {
      showError("empStaffId", "Enter the staff reference the admin gave you.");
      isValid = false;
    }
  }

  // ----- Login credentials -----
  if (username.length < 4) {
    showError("userName", "The username must be at least 4 characters.");
    isValid = false;
  } else if (usernameAlreadyUsed(username)) {
    showError("userName", "That username is already taken.");
    isValid = false;
  }

  if (password.length < 8) {
    showError("password", "The password must be at least 8 characters.");
    isValid = false;
  }

  if (password !== confirmPassword) {
    showError("confirmPassword", "The two passwords are not the same.");
    isValid = false;
  }

  if (question === "") {
    showError("securityQuestion", "Please choose a security question.");
    isValid = false;
  }

  if (isEmpty(answer)) {
    showError("securityAnswer", "Please type the answer to your question.");
    isValid = false;
  }

  if (agreed === false) {
    showError("agreeTerms", "You must agree to the Terms and Conditions.");
    isValid = false;
  }

  if (isValid === false) {
    showMessage("registerMessage", "Some fields need your attention. Please check the red messages.", "error");
    return false;
  }

  // ----- Create the account -----
  // Customers are active at once; vendors and employees wait for the admin
  let status = "Active";
  let prefix = "CUS";
  if (role === "Vendor") {
    status = "Pending";
    prefix = "VEN";
  }
  if (role === "Employee") {
    status = "Pending";
    prefix = "EMP";
  }

  let newUser = { id: makeId(prefix), name: fullName, username: username, password: password,
                  email: email, phone: phone, city: city, role: role, status: status,
                  registered: todayString() };
  users.push(newUser);

  if (status === "Active") {
    showMessage("registerMessage", "Welcome, <strong>" + fullName + "</strong>. Your customer account " +
                newUser.id + " is ready. You can log in now.", "success");
  } else {
    showMessage("registerMessage", "Thank you, <strong>" + fullName + "</strong>. Your " + role.toLowerCase() +
                " account " + newUser.id + " is waiting for an admin to approve it.", "info");
  }

  console.log("Registered: " + newUser.id + " " + newUser.name + " (" + newUser.role + ")");
  document.getElementById("registerForm").reset();
  showTypeFields();
  return false;   // stay on the page so the message can be read
}


// true when another account already uses this email
function emailAlreadyUsed(email) {
  for (const user of users) {
    if (user.email.toLowerCase() === email.toLowerCase()) {
      return true;
    }
  }
  return false;
}

// true when another account already uses this username
function usernameAlreadyUsed(username) {
  for (const user of users) {
    if (user.username.toLowerCase() === username.toLowerCase()) {
      return true;
    }
  }
  return false;
}

// Builds the next id for one prefix, e.g. "CUS-11003"
function makeId(prefix) {
  let sameKind = [];
  for (const user of users) {
    if (user.id.slice(0, prefix.length) === prefix) {
      sameKind.push(user);
    }
  }
  if (sameKind.length === 0) {
    return prefix + "-1001";
  }
  return nextId(prefix, sameKind);
}


/* START: runs once when the page has loaded */
showTypeFields();   // nothing is picked yet, so only Step 1 is visible
