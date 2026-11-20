/* employee.js  -  Everything the Employee can do (employee.html)
   CRUD + Search : Moderation Records (moderationRecords array)
   Unique 1      : Test Drive Calendar View
   Unique 2      : Printable Daily Report
   Unique 3      : Inquiry and Test Drive Handling

   The forms on this page never go to another page: each onsubmit
   handler does its work with JavaScript and returns false. */

// The ids of the sections on this page (used by showSection in common.js)
const sections = ["overviewSection", "moderationSection", "calendarSection",
                  "reportSection", "inquiryHandlingSection"];

// The employee who is logged in
const myEmployeeId = "EMP-104";
const myEmployeeName = "Shafayat Jamil";

// The time slots of the weekly calendar and the days it covers
const timeSlots = ["10:00 AM", "11:00 AM", "12:00 PM", "3:00 PM", "5:00 PM"];
const weekDays = ["2026-10-26", "2026-10-27", "2026-10-28", "2026-10-29",
                  "2026-10-30", "2026-10-31", "2026-11-01"];

// -1 means "creating a new record"; any other number is the index being edited
let editRecordIndex = -1;


/* OVERVIEW: today's workload, counted from the arrays */
function renderOverview() {
  let waitingListings = 0;
  for (const car of cars) {
    if (car.status === "Waiting") {
      waitingListings++;
    }
  }

  let openInquiries = 0;
  for (const inquiry of inquiries) {
    if (inquiry.status === "Pending") {
      openInquiries++;
    }
  }

  let pendingDrives = 0;
  let completedDrives = 0;
  for (const drive of testDrives) {
    if (drive.status === "Pending") { pendingDrives++; }
    if (drive.status === "Completed") { completedDrives++; }
  }

  let myDecisions = 0;
  for (const record of moderationRecords) {
    if (record.employee === myEmployeeName) {
      myDecisions++;
    }
  }

  document.getElementById("statWaiting").innerHTML = waitingListings;
  document.getElementById("statOpen").innerHTML = openInquiries;
  document.getElementById("statDrives").innerHTML = pendingDrives;
  document.getElementById("statCompleted").innerHTML = completedDrives;
  document.getElementById("statDecisions").innerHTML = myDecisions;

  if (waitingListings > 0) {
    document.getElementById("statWaiting").style.color = "#EF6C00";
  } else {
    document.getElementById("statWaiting").style.color = "";
  }

  // The workload bar chart
  drawBarChart("workloadChart",
               ["Listings to moderate", "Open inquiries", "Test drives pending"],
               [waitingListings, openInquiries, pendingDrives],
               waitingListings + openInquiries + pendingDrives);
}


function saveProfile() {
  let name = document.getElementById("empName").value.trim();
  let email = document.getElementById("empEmail").value.trim();
  let phone = document.getElementById("empPhone").value.trim();
  let password = document.getElementById("empPassword").value;

  let isValid = true;
  clearErrors(["empName", "empEmail", "empPhone", "empPassword"]);

  if (name.length < 3) {
    showError("empName", "The name must be at least 3 characters.");
    isValid = false;
  }
  if (isValidEmail(email) === false) {
    showError("empEmail", "Please enter a valid work email address.");
    isValid = false;
  }
  if (isValidPhone(phone) === false) {
    showError("empPhone", "Enter an 11 digit number that starts with 01.");
    isValid = false;
  }
  if (password.length > 0 && password.length < 8) {
    showError("empPassword", "A new password must be at least 8 characters.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  let position = findIndexById(users, myEmployeeId);
  users[position].name = name;
  users[position].email = email;
  users[position].phone = phone;
  users[position].department = document.getElementById("empDept").value;
  users[position].shift = getRadioValue("empShift");
  if (password.length >= 8) {
    users[position].password = password;
  }

  showMessage("profileMessage", "Your profile has been saved.", "success");
  return false;
}


/* MODERATION RECORDS: CREATE, READ, UPDATE, DELETE, SEARCH */

// The queue of listings that still need a decision
function renderQueue() {
  let rows = "";
  let options = "<option value=''>-- Select Listing --</option>";
  let shown = 0;

  for (const car of cars) {
    if (car.status !== "Waiting") {
      continue;
    }
    rows += "<tr>" +
              "<td>" + car.id + "</td>" +
              "<td><strong>" + car.name + "</strong></td>" +
              "<td>" + car.vendorName + "</td>" +
              "<td>" + money(car.price) + "</td>" +
              "<td>" + longDate(car.listedOn) + "</td>" +
              "<td>" + car.condition + "</td>" +
              "<td><span class='badge orange'>Waiting</span></td>" +
            "</tr>";
    options += "<option value='" + car.id + "'>" + car.id + " " + car.name + ", " + car.vendorName + "</option>";
    shown++;
  }

  if (shown === 0) {
    rows = "<tr><td colspan='7' class='empty-row'>The moderation queue is empty.</td></tr>";
  }

  document.getElementById("queueBody").innerHTML = rows;
  document.getElementById("queueCount").innerHTML = shown + " listing(s) waiting for review";
  document.getElementById("modListing").innerHTML = options;
}


// READ + SEARCH
function renderRecords() {
  let keyword = document.getElementById("modSearch").value;
  let decisionFilter = document.getElementById("modDecisionFilter").value;
  let vendorFilter = document.getElementById("modVendorFilter").value;

  let rows = "";
  let shown = 0;

  for (let i = 0; i < moderationRecords.length; i++) {
    let record = moderationRecords[i];

    let matchesKeyword = containsText(record.carName, keyword) || containsText(record.listingId, keyword) ||
                         containsText(record.id, keyword);
    let matchesDecision = (decisionFilter === "All" || record.decision === decisionFilter);
    let matchesVendor = (vendorFilter === "All" || record.vendorId === vendorFilter);

    if (matchesKeyword && matchesDecision && matchesVendor) {
      let colour;
      switch (record.decision) {
        case "Approved":
          colour = "green";
          break;
        case "Rejected":
          colour = "red";
          break;
        default:
          colour = "orange";
      }

      rows += "<tr>" +
                "<td>" + record.id + "</td>" +
                "<td>" + record.listingId + "</td>" +
                "<td><strong>" + record.carName + "</strong></td>" +
                "<td>" + record.vendorName + "</td>" +
                "<td><span class='badge " + colour + "'>" + record.decision + "</span></td>" +
                "<td>" + record.reason + "</td>" +
                "<td>" + longDate(record.date) + "</td>" +
                "<td>" +
                  "<button type='button' class='btn btn-small' onclick='editRecord(" + i + ")'>Edit</button>" +
                  "<button type='button' class='btn btn-small btn-danger' onclick='deleteRecord(" + i + ")'>Delete</button>" +
                "</td>" +
              "</tr>";
      shown++;
    }
  }

  if (shown === 0) {
    rows = "<tr><td colspan='8' class='empty-row'>No records match your search.</td></tr>";
  }

  document.getElementById("recordTableBody").innerHTML = rows;
  document.getElementById("recordCount").innerHTML =
    "Showing " + shown + " of " + moderationRecords.length + " records";
}


// CREATE or UPDATE
function saveRecord() {
  let listingId = document.getElementById("modListing").value;
  let decision = getRadioValue("modDecision");
  let reason = document.getElementById("modReason").value;
  let note = document.getElementById("modNote").value.trim();
  let date = document.getElementById("modDate").value;
  let checks = getCheckedValues("modChecks");

  let isValid = true;
  clearErrors(["modListing", "modDecision", "modReason", "modNote", "modDate", "modChecks"]);

  if (listingId === "" && editRecordIndex === -1) {
    showError("modListing", "Please choose the listing you reviewed.");
    isValid = false;
  }
  if (decision === "") {
    showError("modDecision", "Please choose a decision.");
    isValid = false;
  }
  // A rejection always needs a reason and a note for the vendor
  if (decision === "Reject" && reason === "") {
    showError("modReason", "A rejection needs a reason.");
    isValid = false;
  }
  if (decision !== "Approve" && note.length < 10) {
    showError("modNote", "Write at least 10 characters so the vendor knows what to fix.");
    isValid = false;
  }
  if (decision === "Approve" && checks === "") {
    showError("modChecks", "Tick the checks you completed before approving.");
    isValid = false;
  }
  if (isEmpty(date)) {
    showError("modDate", "Please choose the decision date.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  // Turn the radio value into the word stored in the record
  let decisionText = "Approved";
  if (decision === "Reject") { decisionText = "Rejected"; }
  if (decision === "Request Changes") { decisionText = "Changes Requested"; }

  let reasonText = reason;
  if (reasonText === "") {
    reasonText = "All checks passed";
  }

  if (editRecordIndex === -1) {
    let car = cars[findIndexById(cars, listingId)];

    let newRecord = { id: nextId("MOD", moderationRecords), listingId: car.id, carName: car.name,
                      vendorId: car.vendorId, vendorName: car.vendorName,
                      decision: decisionText, reason: reasonText, note: note,
                      date: date, employee: myEmployeeName };
    moderationRecords.push(newRecord);

    // The decision changes the listing itself
    switch (decisionText) {
      case "Approved":
        car.status = "Live";
        break;
      case "Rejected":
        car.status = "Rejected";
        break;
      default:
        car.status = "Waiting";
    }

    showMessage("recordMessage", "Record <strong>" + newRecord.id + "</strong> saved. " +
                car.name + " is now " + car.status + ".", "success");
  } else {
    let record = moderationRecords[editRecordIndex];
    record.decision = decisionText;
    record.reason = reasonText;
    record.note = note;
    record.date = date;
    showMessage("recordMessage", "Record <strong>" + record.id + "</strong> was updated.", "success");
  }

  resetRecordForm();
  renderRecords();
  renderQueue();
  renderOverview();
  return false;
}


// UPDATE step 1: copy the record into the form
function editRecord(index) {
  let record = moderationRecords[index];
  editRecordIndex = index;

  // The listing cannot be changed on an existing record
  document.getElementById("modListing").innerHTML =
    "<option value='" + record.listingId + "'>" + record.listingId + " " + record.carName + "</option>";

  let decisionValue = "Approve";
  if (record.decision === "Rejected") { decisionValue = "Reject"; }
  if (record.decision === "Changes Requested") { decisionValue = "Request Changes"; }
  setRadioValue("modDecision", decisionValue);

  document.getElementById("modNote").value = record.note;
  document.getElementById("modDate").value = record.date;

  document.getElementById("recordFormTitle").innerHTML = "Edit Record " + record.id;
  document.getElementById("recordSaveButton").value = "Update Record";
  hideMessage("recordMessage");
}


// DELETE
function deleteRecord(index) {
  let record = moderationRecords[index];
  moderationRecords = removeAt(moderationRecords, index);

  showMessage("recordMessage", "Record <strong>" + record.id + "</strong> for " + record.carName +
              " was deleted.", "info");

  resetRecordForm();
  renderRecords();
  renderOverview();
}


function resetRecordForm() {
  editRecordIndex = -1;
  document.getElementById("recordForm").reset();
  clearErrors(["modListing", "modDecision", "modReason", "modNote", "modDate", "modChecks"]);
  document.getElementById("recordFormTitle").innerHTML = "Create a Moderation Record";
  document.getElementById("recordSaveButton").value = "Create Record";
  renderQueue();
}


/* UNIQUE FEATURE 1: TEST DRIVE CALENDAR VIEW */
function renderCalendar() {
  let vendorFilter = document.getElementById("calVendor").value;
  let wanted = getCheckedValues("calShow");

  // ----- The header row: one column for each day -----
  let html = "<tr><th>Time Slot</th>";
  for (const day of weekDays) {
    html += "<th>" + shortDay(day) + "</th>";
  }
  html += "</tr>";

  let booked = 0;

  // ----- One row per time slot -----
  for (const slot of timeSlots) {
    html += "<tr><th>" + slot + "</th>";

    for (const day of weekDays) {
      let cell = "<td class='slot-free'>Free</td>";

      for (const drive of testDrives) {
        let sameSlot = (drive.date === day && drive.slot === slot);
        let matchesVendor = (vendorFilter === "All" || drive.vendorName === vendorFilter);
        let matchesStatus = containsText(wanted, drive.status);

        if (sameSlot && matchesVendor && matchesStatus) {
          cell = "<td class='slot-booked'>" + drive.id + "<br>" + drive.carName + "</td>";
          booked++;
        }
      }
      html += cell;
    }
    html += "</tr>";
  }

  document.getElementById("calendarTable").innerHTML = html;
  document.getElementById("calendarCount").innerHTML =
    booked + " booking(s) shown between " + longDate(weekDays[0]) + " and " + longDate(weekDays[6]);

  renderWeekDetails(vendorFilter, wanted);
}


// Turns "2026-10-28" into "Wed 28"
function shortDay(dateText) {
  let names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let date = new Date(dateText + "T00:00");
  return names[date.getDay()] + " " + dateText.slice(8);
}


// The full list under the calendar grid
function renderWeekDetails(vendorFilter, wanted) {
  let rows = "";
  let shown = 0;

  for (const drive of testDrives) {
    let inWeek = (drive.date >= weekDays[0] && drive.date <= weekDays[6]);
    let matchesVendor = (vendorFilter === "All" || drive.vendorName === vendorFilter);
    let matchesStatus = containsText(wanted, drive.status);

    if (inWeek && matchesVendor && matchesStatus) {
      let colour;
      switch (drive.status) {
        case "Completed":
          colour = "grey";
          break;
        case "Approved":
          colour = "green";
          break;
        case "In Progress":
          colour = "blue";
          break;
        default:
          colour = "orange";
      }

      rows += "<tr>" +
                "<td>" + drive.id + "</td>" +
                "<td>" + longDate(drive.date) + "</td>" +
                "<td>" + drive.slot + "</td>" +
                "<td>" + drive.customerName + "</td>" +
                "<td>" + drive.carName + "</td>" +
                "<td>" + drive.vendorName + "</td>" +
                "<td><span class='badge " + colour + "'>" + drive.status + "</span></td>" +
              "</tr>";
      shown++;
    }
  }

  if (shown === 0) {
    rows = "<tr><td colspan='7' class='empty-row'>No bookings match these filters.</td></tr>";
  }
  document.getElementById("weekDetailBody").innerHTML = rows;
}


/* UNIQUE FEATURE 2: PRINTABLE DAILY REPORT */
function generateReport() {
  let date = document.getElementById("reportDate").value;
  let type = document.getElementById("reportType").value;
  let chosen = getCheckedValues("reportSections");

  let isValid = true;
  clearErrors(["reportDate", "reportType", "reportSections"]);

  if (isEmpty(date)) {
    showError("reportDate", "Please choose the report date.");
    isValid = false;
  }
  if (type === "") {
    showError("reportType", "Please choose the report type.");
    isValid = false;
  }
  if (chosen === "") {
    showError("reportSections", "Tick at least one section to include.");
    isValid = false;
  }

  if (isValid === false) {
    document.getElementById("reportBody").style.display = "none";
    return false;
  }

  // ----- Work the figures out from the arrays -----
  let newInquiries = 0;
  let answered = 0;
  let pending = 0;
  for (const inquiry of inquiries) {
    if (inquiry.status === "Answered") { answered++; }
    if (inquiry.status === "Pending")  { pending++; }
    newInquiries++;
  }

  let driveRequests = 0;
  let driveApproved = 0;
  let driveCompleted = 0;
  let drivePending = 0;
  for (const drive of testDrives) {
    driveRequests++;
    if (drive.status === "Approved")  { driveApproved++; }
    if (drive.status === "Completed") { driveCompleted++; }
    if (drive.status === "Pending")   { drivePending++; }
  }

  let listingsLive = 0;
  let listingsWaiting = 0;
  let listingsRejected = 0;
  let listingsSold = 0;
  for (const car of cars) {
    switch (car.status) {
      case "Live":     listingsLive++;     break;
      case "Waiting":  listingsWaiting++;  break;
      case "Rejected": listingsRejected++; break;
      default:         listingsSold++;
    }
  }

  let html = "";
  html += "<h3>Report Header</h3>" +
          "<table class='data-table'><tbody>" +
            "<tr><td>Report Date</td><td>" + longDate(date) + "</td></tr>" +
            "<tr><td>Report Type</td><td>" + type + " Summary</td></tr>" +
            "<tr><td>Prepared By</td><td>" + myEmployeeName + ", " + myEmployeeId + "</td></tr>" +
            "<tr><td>Generated At</td><td>" + nowString() + "</td></tr>" +
          "</tbody></table>";

  if (containsText(chosen, "Inquiries")) {
    html += "<h3>Section 1: Inquiry Activity</h3>" +
            "<table class='data-table'>" +
              "<thead><tr><th>Metric</th><th>Count</th></tr></thead><tbody>" +
              "<tr><td>Inquiries on record</td><td>" + newInquiries + "</td></tr>" +
              "<tr><td>Inquiries answered</td><td>" + answered + "</td></tr>" +
              "<tr><td>Inquiries still pending</td><td>" + pending + "</td></tr>" +
            "</tbody></table>";
  }

  if (containsText(chosen, "Test Drives")) {
    html += "<h3>Section 2: Test Drive Activity</h3>" +
            "<table class='data-table'>" +
              "<thead><tr><th>Metric</th><th>Count</th></tr></thead><tbody>" +
              "<tr><td>Requests on record</td><td>" + driveRequests + "</td></tr>" +
              "<tr><td>Requests approved</td><td>" + driveApproved + "</td></tr>" +
              "<tr><td>Test drives completed</td><td>" + driveCompleted + "</td></tr>" +
              "<tr><td>Still waiting for a decision</td><td>" + drivePending + "</td></tr>" +
            "</tbody></table>";
  }

  if (containsText(chosen, "Listings")) {
    html += "<h3>Section 3: Listing Moderation</h3>" +
            "<table class='data-table'>" +
              "<thead><tr><th>Metric</th><th>Count</th></tr></thead><tbody>" +
              "<tr><td>Listings live</td><td>" + listingsLive + "</td></tr>" +
              "<tr><td>Listings waiting</td><td>" + listingsWaiting + "</td></tr>" +
              "<tr><td>Listings rejected</td><td>" + listingsRejected + "</td></tr>" +
              "<tr><td>Decisions I made</td><td>" + moderationRecords.length + "</td></tr>" +
            "</tbody></table>";
  }

  if (containsText(chosen, "Sales")) {
    html += "<h3>Section 4: Sales</h3>" +
            "<table class='data-table'>" +
              "<thead><tr><th>Metric</th><th>Count</th></tr></thead><tbody>" +
              "<tr><td>Cars marked as sold</td><td>" + listingsSold + "</td></tr>" +
              "<tr><td>Invoices issued</td><td>" + invoices.length + "</td></tr>" +
            "</tbody></table>";
  }

  html += "<h3>Notes for the Manager</h3>" +
          "<p>" + document.getElementById("reportNotes").value + "</p>" +
          "<h5>Signature: ____________________</h5>";

  document.getElementById("reportBody").innerHTML = html;
  document.getElementById("reportBody").style.display = "block";
  return false;
}


function printReport() {
  window.print();
}


/* UNIQUE FEATURE 3: INQUIRY AND TEST DRIVE HANDLING */
function renderOpenInquiries() {
  let rows = "";
  let options = "<option value=''>-- Select Inquiry --</option>";
  let shown = 0;

  for (const inquiry of inquiries) {
    if (inquiry.status !== "Pending") {
      continue;
    }

    let waiting = daysBetween(inquiry.date, todayString());
    let colour = "orange";
    if (waiting >= 2) {
      colour = "red";
    }

    rows += "<tr>" +
              "<td>" + inquiry.id + "</td>" +
              "<td>" + inquiry.customerName + "</td>" +
              "<td>" + inquiry.carName + "</td>" +
              "<td>" + inquiry.vendorName + "</td>" +
              "<td>" + inquiry.topic + "</td>" +
              "<td>" + longDate(inquiry.date) + "</td>" +
              "<td><span class='badge " + colour + "'>" + waiting + " day(s)</span></td>" +
            "</tr>";
    options += "<option value='" + inquiry.id + "'>" + inquiry.id + " " + inquiry.customerName +
               ", " + inquiry.carName + "</option>";
    shown++;
  }

  if (shown === 0) {
    rows = "<tr><td colspan='7' class='empty-row'>Every inquiry has been answered.</td></tr>";
  }

  document.getElementById("openInquiryBody").innerHTML = rows;
  document.getElementById("openInquiryCount").innerHTML = shown + " inquiry(ies) need attention";
  document.getElementById("empInquiry").innerHTML = options;
}


function sendReply() {
  let inquiryId = document.getElementById("empInquiry").value;
  let reply = document.getElementById("empReply").value.trim();
  let action = getRadioValue("empAction");

  let isValid = true;
  clearErrors(["empInquiry", "empReply", "empAction"]);

  if (inquiryId === "") {
    showError("empInquiry", "Please choose the inquiry you are handling.");
    isValid = false;
  }
  if (action === "") {
    showError("empAction", "Please choose the action you took.");
    isValid = false;
  }
  if (action === "Reply" && reply.length < 10) {
    showError("empReply", "Write at least 10 characters for the customer.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  let inquiry = inquiries[findIndexById(inquiries, inquiryId)];

  switch (action) {
    case "Reply":
      inquiry.status = "Answered";
      inquiry.reply = reply;
      showMessage("handlingMessage", "Reply sent to <strong>" + inquiry.customerName +
                  "</strong> for " + inquiry.id + ".", "success");
      break;
    case "Remind Vendor":
      showMessage("handlingMessage", "A reminder was sent to <strong>" + inquiry.vendorName +
                  "</strong> about " + inquiry.id + ".", "info");
      break;
    default:
      showMessage("handlingMessage", "Inquiry <strong>" + inquiry.id +
                  "</strong> has been escalated to the admin.", "info");
  }

  document.getElementById("replyForm").reset();
  renderOpenInquiries();
  renderOverview();
  return false;
}


function renderPendingDrives() {
  let rows = "";
  let options = "<option value=''>-- Select Request --</option>";
  let shown = 0;

  for (const drive of testDrives) {
    if (drive.status !== "Pending") {
      continue;
    }

    let licence = "No";
    let licenceColour = "red";
    if (drive.licence) {
      licence = "Yes";
      licenceColour = "green";
    }

    rows += "<tr>" +
              "<td>" + drive.id + "</td>" +
              "<td>" + drive.customerName + "</td>" +
              "<td>" + drive.carName + "</td>" +
              "<td>" + drive.vendorName + "</td>" +
              "<td>" + longDate(drive.date) + "</td>" +
              "<td>" + drive.slot + "</td>" +
              "<td><span class='badge " + licenceColour + "'>" + licence + "</span></td>" +
            "</tr>";
    options += "<option value='" + drive.id + "'>" + drive.id + " " + drive.carName +
               ", " + longDate(drive.date) + "</option>";
    shown++;
  }

  if (shown === 0) {
    rows = "<tr><td colspan='7' class='empty-row'>No test drive requests are waiting.</td></tr>";
  }

  document.getElementById("pendingDriveBody").innerHTML = rows;
  document.getElementById("tdRequest").innerHTML = options;
}


function saveDriveDecision() {
  let requestId = document.getElementById("tdRequest").value;
  let decision = getRadioValue("tdDecision");
  let checks = getCheckedValues("tdChecks");
  let newDate = document.getElementById("newSlotDate").value;
  let note = document.getElementById("tdReason").value.trim();

  let isValid = true;
  clearErrors(["tdRequest", "tdDecision", "tdChecks", "newSlotDate", "tdReason"]);

  if (requestId === "") {
    showError("tdRequest", "Please choose the request.");
    isValid = false;
  }
  if (decision === "") {
    showError("tdDecision", "Please choose a decision.");
    isValid = false;
  }
  if (decision === "Approve" && containsText(checks, "Licence") === false) {
    showError("tdChecks", "A test drive can only be approved once the licence is verified.");
    isValid = false;
  }
  if (decision === "Reschedule" && isEmpty(newDate)) {
    showError("newSlotDate", "Please choose the new date.");
    isValid = false;
  }
  if (decision !== "Approve" && note.length < 10) {
    showError("tdReason", "Explain the decision in at least 10 characters.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  let drive = testDrives[findIndexById(testDrives, requestId)];

  switch (decision) {
    case "Approve":
      drive.status = "Approved";
      showMessage("handlingMessage", "Test drive <strong>" + drive.id + "</strong> is approved for " +
                  longDate(drive.date) + " at " + drive.slot + ".", "success");
      break;
    case "Reject":
      drive.status = "Rejected";
      showMessage("handlingMessage", "Test drive <strong>" + drive.id + "</strong> was rejected.", "info");
      break;
    default:
      drive.date = newDate;
      drive.status = "Approved";
      showMessage("handlingMessage", "Test drive <strong>" + drive.id + "</strong> was moved to " +
                  longDate(newDate) + ".", "success");
  }

  document.getElementById("driveForm").reset();
  renderPendingDrives();
  renderCalendar();
  renderOverview();
  return false;
}


/* START: runs once when the page has loaded */
renderOverview();
renderQueue();
renderRecords();
renderCalendar();
renderOpenInquiries();
renderPendingDrives();
showSection("overviewSection");

// Fresh numbers every time these sections are opened
document.getElementById("nav-overviewSection").addEventListener("click", renderOverview);
document.getElementById("nav-calendarSection").addEventListener("click", renderCalendar);
