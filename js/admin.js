/* admin.js  -  Everything the Admin can do (admin.html)
   CRUD + Search : User Accounts (users array)
   Unique 1      : User Activity Audit Log
   Unique 2      : Platform Analytics
   Unique 3      : Export Data to CSV

   The forms on this page never go to another page: each onsubmit
   handler does its work with JavaScript and returns false. */

// The ids of the sections on this page (used by showSection in common.js)
const sections = ["overviewSection", "userSection", "auditSection", "analyticsSection", "exportSection"];

// The admin who is logged in
const myAdminId = "ADM-001";

// -1 means "adding a new account"; any other number is the index being edited
let editUserIndex = -1;


/* SHARED: write an entry into the audit log */
function addLog(action, detail, severity) {
  // concat() joins two arrays, so the newest entry ends up at the top
  let entry = { id: nextId("LOG", auditLog), time: nowString(), userId: myAdminId,
                name: "Md. Murad Hasan", role: "Admin", action: action,
                detail: detail, severity: severity };
  auditLog = [entry].concat(auditLog);
}


/* OVERVIEW: platform totals, all counted from the arrays */
function renderOverview() {
  let roleCounts = { Customer: 0, Vendor: 0, Employee: 0, Admin: 0 };
  let active = 0;
  let pending = 0;
  let suspended = 0;

  for (const user of users) {
    roleCounts[user.role]++;            // bracket notation: roleCounts["Vendor"]++
    switch (user.status) {
      case "Active":    active++;    break;
      case "Pending":   pending++;   break;
      case "Suspended": suspended++; break;
    }
  }

  let live = 0;
  let waiting = 0;
  let sold = 0;
  let listedValue = 0;
  for (const car of cars) {
    switch (car.status) {
      case "Live":    live++; listedValue += car.price; break;
      case "Waiting": waiting++; break;
      case "Sold":    sold++; break;
    }
  }

  // Platform revenue is the commission on every sale this year
  let revenue = 0;
  for (const record of monthlySales) {
    revenue += record.platformRevenue * platformRules.commissionPercent / 100;
  }

  document.getElementById("statUsers").innerHTML = users.length;
  document.getElementById("statCustomers").innerHTML = roleCounts.Customer;
  document.getElementById("statVendors").innerHTML = roleCounts.Vendor;
  document.getElementById("statEmployees").innerHTML = roleCounts.Employee;
  document.getElementById("statPending").innerHTML = pending;
  document.getElementById("statLive").innerHTML = live;
  document.getElementById("statWaiting").innerHTML = waiting;
  document.getElementById("statSold").innerHTML = sold;
  document.getElementById("statRevenue").innerHTML = money(revenue);
  document.getElementById("overviewTime").innerHTML = "Refreshed at " + nowString();

  if (pending > 0) {
    document.getElementById("statPending").style.color = "#EF6C00";
  } else {
    document.getElementById("statPending").style.color = "";
  }

  renderPendingActions();

  drawBarChart("roleChart",
               ["Customers", "Vendors", "Employees", "Admins"],
               [roleCounts.Customer, roleCounts.Vendor, roleCounts.Employee, roleCounts.Admin],
               users.length);
}


// Everything that is waiting for the admin to decide
function renderPendingActions() {
  let rows = "";
  let shown = 0;

  for (let i = 0; i < users.length; i++) {
    if (users[i].status !== "Pending") {
      continue;
    }
    rows += "<tr>" +
              "<td>" + users[i].role + " Application</td>" +
              "<td>" + users[i].id + "</td>" +
              "<td>" + users[i].name + " is waiting to be approved as " + users[i].role.toLowerCase() + "</td>" +
              "<td>" + longDate(users[i].registered) + "</td>" +
              "<td><button type='button' class='btn btn-small btn-success' onclick='approveUser(" + i + ")'>Approve</button></td>" +
            "</tr>";
    shown++;
  }

  for (const car of cars) {
    if (car.status === "Waiting") {
      rows += "<tr>" +
                "<td>Listing Moderation</td>" +
                "<td>" + car.id + "</td>" +
                "<td>" + car.name + " from " + car.vendorName + " is waiting for review</td>" +
                "<td>" + longDate(car.listedOn) + "</td>" +
                "<td><span class='hint'>With the employees</span></td>" +
              "</tr>";
      shown++;
    }
  }

  if (shown === 0) {
    rows = "<tr><td colspan='5' class='empty-row'>Nothing is waiting for your decision.</td></tr>";
  }
  document.getElementById("pendingBody").innerHTML = rows;
}


function saveProfile() {
  let name = document.getElementById("admName").value.trim();
  let email = document.getElementById("admEmail").value.trim();
  let phone = document.getElementById("admPhone").value.trim();
  let password = document.getElementById("admPassword").value;

  let isValid = true;
  clearErrors(["admName", "admEmail", "admPhone", "admPassword"]);

  if (name.length < 3) {
    showError("admName", "The name must be at least 3 characters.");
    isValid = false;
  }
  if (isValidEmail(email) === false) {
    showError("admEmail", "Please enter a valid work email address.");
    isValid = false;
  }
  if (isValidPhone(phone) === false) {
    showError("admPhone", "Enter an 11 digit number that starts with 01.");
    isValid = false;
  }
  if (password.length > 0 && password.length < 8) {
    showError("admPassword", "A new password must be at least 8 characters.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  let position = findIndexById(users, myAdminId);
  users[position].name = name;
  users[position].email = email;
  users[position].phone = phone;
  if (password.length >= 8) {
    users[position].password = password;
    addLog("Password Changed", "The admin changed their own password", "Critical");
  }

  showMessage("profileMessage", "Your profile has been saved.", "success");
  return false;
}


/* USER ACCOUNTS: CREATE, READ, UPDATE, DELETE, SEARCH */

// READ + SEARCH
function renderUsers() {
  let keyword = document.getElementById("userSearch").value;
  let roleFilter = document.getElementById("userRoleFilter").value;
  let statusFilter = document.getElementById("userStatusFilter").value;
  let cityFilter = document.getElementById("userCityFilter").value;

  let rows = "";
  let shown = 0;

  for (let i = 0; i < users.length; i++) {
    let user = users[i];

    let matchesKeyword = containsText(user.name, keyword) || containsText(user.email, keyword) ||
                         containsText(user.id, keyword) || containsText(user.username, keyword);
    let matchesRole = (roleFilter === "All" || user.role === roleFilter);
    let matchesStatus = (statusFilter === "All" || user.status === statusFilter);
    let matchesCity = (cityFilter === "All" || user.city === cityFilter);

    if (matchesKeyword && matchesRole && matchesStatus && matchesCity) {
      let statusColour;
      let approveButton = "";
      switch (user.status) {
        case "Active":
          statusColour = "green";
          break;
        case "Pending":
          statusColour = "orange";
          approveButton = "<button type='button' class='btn btn-small btn-success' onclick='approveUser(" + i + ")'>Approve</button>";
          break;
        case "Suspended":
          statusColour = "orange";
          break;
        default:
          statusColour = "red";
      }

      rows += "<tr>" +
                "<td>" + user.id + "</td>" +
                "<td><strong>" + user.name + "</strong><br><span class='hint'>" + user.email + "</span></td>" +
                "<td>" + user.username + "</td>" +
                "<td><span class='badge " + user.role.toLowerCase() + "'>" + user.role + "</span></td>" +
                "<td>" + user.city + "</td>" +
                "<td>" + longDate(user.registered) + "</td>" +
                "<td><span class='badge " + statusColour + "'>" + user.status + "</span></td>" +
                "<td>" +
                  approveButton +
                  "<button type='button' class='btn btn-small' onclick='editUser(" + i + ")'>Edit</button>" +
                  "<button type='button' class='btn btn-small btn-danger' onclick='deleteUser(" + i + ")'>Delete</button>" +
                "</td>" +
              "</tr>";
      shown++;
    }
  }

  if (shown === 0) {
    rows = "<tr><td colspan='8' class='empty-row'>No accounts match your search.</td></tr>";
  }

  document.getElementById("userTableBody").innerHTML = rows;
  document.getElementById("userCount").innerHTML = "Showing " + shown + " of " + users.length + " accounts";
  renderAccountTotals();
}


// CREATE or UPDATE
function saveUser() {
  let name = document.getElementById("newUserName").value.trim();
  let username = document.getElementById("newUserUsername").value.trim();
  let email = document.getElementById("newUserEmail").value.trim();
  let phone = document.getElementById("newUserPhone").value.trim();
  let role = getRadioValue("newUserRole");
  let city = document.getElementById("newUserCity").value;
  let joinDate = document.getElementById("newUserJoin").value;
  let password = document.getElementById("newUserPassword").value;
  let status = getRadioValue("newUserStatus");

  let isValid = true;
  clearErrors(["newUserName", "newUserUsername", "newUserEmail", "newUserPhone",
               "newUserRole", "newUserCity", "newUserJoin", "newUserPassword", "newUserStatus"]);

  if (name.length < 3) {
    showError("newUserName", "The name must be at least 3 characters.");
    isValid = false;
  }
  if (username.length < 4) {
    showError("newUserUsername", "The username must be at least 4 characters.");
    isValid = false;
  } else if (usernameUsedByOther(username)) {
    showError("newUserUsername", "Another account already uses this username.");
    isValid = false;
  }
  if (isValidEmail(email) === false) {
    showError("newUserEmail", "Please enter a valid email address.");
    isValid = false;
  } else if (emailUsedByOther(email)) {
    showError("newUserEmail", "Another account already uses this email.");
    isValid = false;
  }
  if (isValidPhone(phone) === false) {
    showError("newUserPhone", "Enter an 11 digit number that starts with 01.");
    isValid = false;
  }
  if (role === "") {
    showError("newUserRole", "Please choose the account role.");
    isValid = false;
  }
  if (city === "") {
    showError("newUserCity", "Please choose a city.");
    isValid = false;
  }
  if (isEmpty(joinDate)) {
    showError("newUserJoin", "Please choose the joining date.");
    isValid = false;
  }
  if (password.length < 8) {
    showError("newUserPassword", "The password must be at least 8 characters.");
    isValid = false;
  }
  if (status === "") {
    showError("newUserStatus", "Please choose the account status.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  if (editUserIndex === -1) {
    // CREATE
    let prefix = "CUS";
    if (role === "Vendor")   { prefix = "VEN"; }
    if (role === "Employee") { prefix = "EMP"; }
    if (role === "Admin")    { prefix = "ADM"; }

    let newUser = { id: makeId(prefix), name: name, username: username, password: password,
                    email: email, phone: phone, city: city, role: role, status: status,
                    registered: joinDate };
    users.push(newUser);

    addLog("Account Created", "Created " + role.toLowerCase() + " account " + newUser.id +
           " for " + name, "Normal");
    showMessage("userMessage", "Account <strong>" + newUser.id + "</strong> was created for " +
                name + ".", "success");
  } else {
    // UPDATE
    let user = users[editUserIndex];
    if (user.status !== status) {
      addLog("Status Changed", "Account " + user.id + " is now " + status, "Critical");
    }
    user.name = name;
    user.username = username;
    user.email = email;
    user.phone = phone;
    user.role = role;
    user.city = city;
    user.status = status;
    user.registered = joinDate;
    if (password.length >= 8) {
      user.password = password;
    }
    addLog("Account Updated", "Updated account " + user.id + " (" + name + ")", "Normal");
    showMessage("userMessage", "Account <strong>" + user.id + "</strong> was updated.", "success");
  }

  resetUserForm();
  renderUsers();
  renderOverview();
  renderLog();
  return false;
}


// true if the username belongs to a DIFFERENT account than the one being edited
function usernameUsedByOther(username) {
  for (let i = 0; i < users.length; i++) {
    if (i !== editUserIndex && users[i].username.toLowerCase() === username.toLowerCase()) {
      return true;
    }
  }
  return false;
}

function emailUsedByOther(email) {
  for (let i = 0; i < users.length; i++) {
    if (i !== editUserIndex && users[i].email.toLowerCase() === email.toLowerCase()) {
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


// UPDATE step 1: copy the account into the form
function editUser(index) {
  let user = users[index];
  editUserIndex = index;

  document.getElementById("newUserName").value = user.name;
  document.getElementById("newUserUsername").value = user.username;
  document.getElementById("newUserEmail").value = user.email;
  document.getElementById("newUserPhone").value = user.phone;
  document.getElementById("newUserCity").value = user.city;
  document.getElementById("newUserJoin").value = user.registered;
  document.getElementById("newUserPassword").value = user.password;
  setRadioValue("newUserRole", user.role);
  setRadioValue("newUserStatus", user.status);

  document.getElementById("userFormTitle").innerHTML = "Edit Account " + user.id;
  document.getElementById("userSaveButton").value = "Update Account";
  hideMessage("userMessage");
}


// DELETE
function deleteUser(index) {
  let user = users[index];

  // The admin who is logged in cannot delete their own account
  if (user.id === myAdminId) {
    showMessage("userMessage", "You cannot delete your own admin account.", "error");
    return;
  }

  users = removeAt(users, index);
  addLog("Account Deleted", "Deleted account " + user.id + " (" + user.name + ")", "Critical");
  showMessage("userMessage", "Account <strong>" + user.id + " " + user.name +
              "</strong> was deleted.", "info");

  resetUserForm();
  renderUsers();
  renderOverview();
  renderLog();
}


// Approve a pending registration: the status becomes Active
function approveUser(index) {
  let user = users[index];
  user.status = "Active";

  addLog("Account Approved", "Approved " + user.role.toLowerCase() + " account " + user.id, "Critical");
  showMessage("userMessage", "<strong>" + user.name + "</strong> was approved and can log in now.", "success");

  renderUsers();
  renderOverview();
  renderLog();
}


function resetUserForm() {
  editUserIndex = -1;
  document.getElementById("userForm").reset();
  clearErrors(["newUserName", "newUserUsername", "newUserEmail", "newUserPhone",
               "newUserRole", "newUserCity", "newUserJoin", "newUserPassword", "newUserStatus"]);
  document.getElementById("userFormTitle").innerHTML = "Create a New Account";
  document.getElementById("userSaveButton").value = "Create Account";
}


// The totals table under the account list
function renderAccountTotals() {
  let roles = ["Customer", "Vendor", "Employee", "Admin"];
  let rows = "";

  for (const role of roles) {
    let active = 0;
    let pending = 0;
    let suspended = 0;
    let deactivated = 0;

    for (const user of users) {
      if (user.role !== role) {
        continue;
      }
      switch (user.status) {
        case "Active":      active++;      break;
        case "Pending":     pending++;     break;
        case "Suspended":   suspended++;   break;
        default:            deactivated++;
      }
    }

    rows += "<tr>" +
              "<td>" + role + "s</td>" +
              "<td>" + active + "</td>" +
              "<td>" + pending + "</td>" +
              "<td>" + suspended + "</td>" +
              "<td>" + deactivated + "</td>" +
              "<td><strong>" + (active + pending + suspended + deactivated) + "</strong></td>" +
            "</tr>";
  }

  document.getElementById("totalsBody").innerHTML = rows;
}


/* UNIQUE FEATURE 1: USER ACTIVITY AUDIT LOG */
function renderLog() {
  let keyword = document.getElementById("logUser").value;
  let roleFilter = document.getElementById("logRoleFilter").value;
  let severity = getRadioValue("logSeverity");
  let fromDate = document.getElementById("logFrom").value;
  let toDate = document.getElementById("logTo").value;

  let board = document.getElementById("logBoard");
  let html = "";
  let shown = 0;
  let critical = 0;

  for (const entry of auditLog) {
    let entryDate = entry.time.slice(0, 10);

    let matchesKeyword = containsText(entry.userId, keyword) || containsText(entry.name, keyword) ||
                         containsText(entry.action, keyword) || containsText(entry.detail, keyword);
    let matchesRole = (roleFilter === "All" || entry.role === roleFilter);
    let matchesSeverity = (severity === "All" || entry.severity === severity);
    let afterFrom = (isEmpty(fromDate) || entryDate >= fromDate);
    let beforeTo = (isEmpty(toDate) || entryDate <= toDate);

    if (matchesKeyword && matchesRole && matchesSeverity && afterFrom && beforeTo) {
      let colour = "#6B2150";
      if (entry.severity === "Critical") {
        colour = "#C62828";
        critical++;
      }

      html += "<div class='log-item' style='border-left-color:" + colour + "'>" +
                "<span class='log-time'>" + entry.time + " &middot; " + entry.id + "</span><br>" +
                "<strong>" + entry.action + "</strong> " +
                "<span class='badge " + entry.role.toLowerCase() + "'>" + entry.role + "</span><br>" +
                entry.detail + "<br>" +
                "<span class='hint'>" + entry.name + " (" + entry.userId + ")</span>" +
              "</div>";
      shown++;
    }
  }

  if (shown === 0) {
    html = "<p class='empty-row'>No log entries match these filters.</p>";
  }

  board.innerHTML = html;
  document.getElementById("logCount").innerHTML =
    shown + " entries shown, " + critical + " of them critical";

  renderLogSummary();
}


// Counts how many entries there are of each action type
function renderLogSummary() {
  let actionNames = [];
  let actionTotals = [];
  let actionCritical = [];

  for (const entry of auditLog) {
    let position = actionNames.indexOf(entry.action);   // -1 if not in the array yet
    if (position === -1) {
      actionNames.push(entry.action);
      actionTotals.push(0);
      actionCritical.push(0);
      position = actionNames.length - 1;
    }
    actionTotals[position]++;
    if (entry.severity === "Critical") {
      actionCritical[position]++;
    }
  }

  let rows = "";
  for (let i = 0; i < actionNames.length; i++) {
    rows += "<tr><td>" + actionNames[i] + "</td><td>" + actionTotals[i] +
            "</td><td>" + actionCritical[i] + "</td></tr>";
  }

  document.getElementById("logSummaryBody").innerHTML = rows;
}


function clearLog() {
  auditLog = [];
  addLog("Log Cleared", "The admin cleared the activity log", "Critical");
  renderLog();
}


/* UNIQUE FEATURE 2: PLATFORM ANALYTICS */
function renderAnalytics() {
  // ----- Monthly sales and commission -----
  let rows = "";
  let totalSold = 0;
  let totalRevenue = 0;
  let totalCommission = 0;
  let months = [];
  let soldCounts = [];

  for (const record of monthlySales) {
    let commission = record.platformRevenue * platformRules.commissionPercent / 100;

    rows += "<tr>" +
              "<td>" + record.month + "</td>" +
              "<td>" + record.platformSold + "</td>" +
              "<td>" + money(record.platformRevenue) + "</td>" +
              "<td>" + money(commission) + "</td>" +
            "</tr>";

    totalSold += record.platformSold;
    totalRevenue += record.platformRevenue;
    totalCommission += commission;
    months.push(record.month);
    soldCounts.push(record.platformSold);
  }

  rows += "<tr><th>Total</th><th>" + totalSold + "</th><th>" + money(totalRevenue) +
          "</th><th>" + money(totalCommission) + "</th></tr>";
  document.getElementById("analyticsSalesBody").innerHTML = rows;

  let biggest = 0;
  for (const count of soldCounts) {
    if (count > biggest) { biggest = count; }
  }
  drawBarChart("monthChart", months, soldCounts, biggest);

  renderBrandTable();
  renderVendorRanking();
}


// Listings and sales grouped by brand, counted from the cars array
function renderBrandTable() {
  let brandNames = [];
  let brandListings = [];
  let brandSold = [];
  let totalSold = 0;

  for (const car of cars) {
    let position = brandNames.indexOf(car.brand);
    if (position === -1) {
      brandNames.push(car.brand);
      brandListings.push(0);
      brandSold.push(0);
      position = brandNames.length - 1;
    }
    if (car.status === "Live") {
      brandListings[position]++;
    }
    if (car.status === "Sold") {
      brandSold[position]++;
      totalSold++;
    }
  }

  let rows = "";
  for (let i = 0; i < brandNames.length; i++) {
    let share = 0;
    if (totalSold > 0) {
      share = Math.round(brandSold[i] / totalSold * 100);
    }
    rows += "<tr>" +
              "<td>" + brandNames[i] + "</td>" +
              "<td>" + brandListings[i] + "</td>" +
              "<td>" + brandSold[i] + "</td>" +
              "<td>" + share + " percent</td>" +
            "</tr>";
  }

  document.getElementById("brandBody").innerHTML = rows;
  drawBarChart("brandChart", brandNames, brandListings, cars.length);
}


// Vendors ranked by how many cars they have listed
function renderVendorRanking() {
  let rows = "";
  let rank = 1;

  for (const vendor of vendors) {
    let listed = 0;
    let listedValue = 0;
    for (const car of cars) {
      if (car.vendorId === vendor.id && car.status === "Live") {
        listed++;
        listedValue += car.price;
      }
    }

    rows += "<tr>" +
              "<td>" + rank + "</td>" +
              "<td><strong>" + vendor.name + "</strong></td>" +
              "<td>" + listed + "</td>" +
              "<td>" + vendor.sold + "</td>" +
              "<td>" + money(listedValue) + "</td>" +
              "<td>" + vendor.rating + "</td>" +
            "</tr>";
    rank++;
  }

  document.getElementById("rankingBody").innerHTML = rows;
}


function generateAnalyticsReport() {
  let metric = document.getElementById("anMetric").value;
  let group = getRadioValue("anGroup");

  let isValid = true;
  clearErrors(["anMetric", "anGroup"]);

  if (metric === "") {
    showError("anMetric", "Please choose the metric to report on.");
    isValid = false;
  }
  if (group === "") {
    showError("anGroup", "Please choose how to group the figures.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  addLog("Report Generated", "Generated a " + metric + " report grouped by " + group, "Normal");
  showMessage("analyticsMessage", "<strong>" + metric + "</strong> report grouped by " + group +
              " was prepared at " + nowString() + ".", "success");
  renderLog();
  return false;
}


/* UNIQUE FEATURE 3: EXPORT DATA TO CSV */

// Which array goes with which name in the dropdown
function chosenDataSet(name) {
  switch (name) {
    case "Users":      return users;
    case "Listings":   return cars;
    case "Inquiries":  return inquiries;
    case "TestDrives": return testDrives;
    case "Moderation": return moderationRecords;
    default:           return auditLog;
  }
}


function renderDataSets() {
  let names = ["Users", "Listings", "Inquiries", "TestDrives", "Moderation", "AuditLog"];
  let labels = ["User Accounts", "Car Listings", "Customer Inquiries",
                "Test Drive Requests", "Moderation Records", "Audit Log"];
  let rows = "";

  for (let i = 0; i < names.length; i++) {
    let list = chosenDataSet(names[i]);
    // A rough file size: about 120 bytes for every record
    let sizeKb = Math.round(list.length * 120 / 1024 * 10) / 10;

    rows += "<tr>" +
              "<td>" + labels[i] + "</td>" +
              "<td>" + list.length + "</td>" +
              "<td>" + sizeKb + " KB</td>" +
            "</tr>";
  }

  document.getElementById("dataSetBody").innerHTML = rows;
}


function generateCsv() {
  let dataSetName = document.getElementById("expTable").value;
  let columns = getCheckedValues("expColumns");
  let fileName = document.getElementById("expFileName").value.trim();
  let separatorName = getRadioValue("expSeparator");
  let reason = document.getElementById("expReason").value.trim();
  let confirmed = document.getElementById("expConfirm").checked;

  let isValid = true;
  clearErrors(["expTable", "expColumns", "expFileName", "expSeparator", "expReason", "expConfirm"]);

  if (dataSetName === "") {
    showError("expTable", "Please choose the data set to export.");
    isValid = false;
  }
  if (columns === "") {
    showError("expColumns", "Tick at least one column.");
    isValid = false;
  }
  if (fileName.length < 3) {
    showError("expFileName", "Please give the file a name of at least 3 characters.");
    isValid = false;
  }
  if (separatorName === "") {
    showError("expSeparator", "Please choose a separator.");
    isValid = false;
  }
  if (reason.length < 10) {
    showError("expReason", "The audit log needs a reason of at least 10 characters.");
    isValid = false;
  }
  if (confirmed === false) {
    showError("expConfirm", "You must confirm that the export follows the data policy.");
    isValid = false;
  }

  if (isValid === false) {
    document.getElementById("csvPreview").style.display = "none";
    return false;
  }

  // Which character separates the columns
  let separator = ",";
  if (separatorName === "Semicolon") { separator = ";"; }
  if (separatorName === "Tab")       { separator = "    "; }

  let list = chosenDataSet(dataSetName);
  let columnNames = columns.split(", ");
  let maskOn = false;
  let headerOn = false;

  let options = document.getElementsByName("expOptions");
  for (let i = 0; i < options.length; i++) {
    if (options[i].checked && options[i].value === "Mask")   { maskOn = true; }
    if (options[i].checked && options[i].value === "Header") { headerOn = true; }
  }

  // ----- Build the file, line by line -----
  let lines = [];
  if (headerOn) {
    lines.push(columnNames.join(separator));
  }

  let limit = list.length;
  if (limit > 8) {
    limit = 8;              // the preview only shows the first eight rows
  }

  for (let i = 0; i < limit; i++) {
    let values = [];
    for (const column of columnNames) {
      values.push(csvValue(list[i], column, maskOn));
    }
    lines.push(values.join(separator));
  }

  // Joined with <br> so the browser shows each record on its own line
  let preview = lines.join("<br>");
  if (list.length > limit) {
    preview += "<br>... and " + (list.length - limit) + " more row(s)";
  }

  document.getElementById("csvText").innerHTML = preview;
  document.getElementById("csvName").innerHTML = fileName + ".csv";
  document.getElementById("csvSummary").innerHTML =
    list.length + " record(s), " + columnNames.length + " column(s), separated by " + separatorName.toLowerCase();
  document.getElementById("csvPreview").style.display = "block";

  // Record the export, in the history and in the audit log
  let record = { id: nextId("EXP", exportHistory), dataSet: dataSetName,
                 records: list.length, date: todayString(), reason: reason };
  exportHistory = [record].concat(exportHistory);
  addLog("Data Exported", "Exported " + list.length + " " + dataSetName + " records to " +
         fileName + ".csv", "Critical");

  showMessage("exportMessage", "<strong>" + fileName + ".csv</strong> is ready with " +
              list.length + " record(s).", "success");

  renderExportHistory();
  renderLog();
  return false;
}


// Reads one column out of one record, masking personal data if asked
function csvValue(record, column, maskOn) {
  let value = "";

  switch (column) {
    case "ID":
      value = record.id;
      break;
    case "Name":
      value = record.name;
      break;
    case "Email":
      value = record.email;
      break;
    case "Phone":
      value = record.phone;
      break;
    case "City":
      value = record.city;
      break;
    case "Date":
      value = record.registered;
      break;
    default:
      value = record.status;
  }

  if (value === undefined) {
    value = "Not applicable";
  }

  // Masking hides the middle of an email address or a phone number
  if (maskOn && (column === "Email" || column === "Phone")) {
    value = String(value).slice(0, 3) + "*****";
  }

  return value;
}


function renderExportHistory() {
  let rows = "";

  for (const record of exportHistory) {
    rows += "<tr>" +
              "<td>" + record.id + "</td>" +
              "<td>" + record.dataSet + "</td>" +
              "<td>" + record.records + "</td>" +
              "<td>" + longDate(record.date) + "</td>" +
              "<td>" + record.reason + "</td>" +
            "</tr>";
  }

  document.getElementById("exportHistoryBody").innerHTML = rows;
}


/* START: runs once when the page has loaded */
renderOverview();
renderUsers();
renderLog();
renderAnalytics();
renderDataSets();
renderExportHistory();
showSection("overviewSection");

// Each time the admin opens Overview or the Audit Log, show fresh data
document.getElementById("nav-overviewSection").addEventListener("click", renderOverview);
document.getElementById("nav-auditSection").addEventListener("click", renderLog);
document.getElementById("nav-analyticsSection").addEventListener("click", renderAnalytics);
