/* customer.js  -  Everything the Customer can do (customer.html)
   CRUD + Search : My Inquiries (inquiries array)
   Unique 1      : Car Comparison Tool
   Unique 2      : EMI Calculator
   Unique 3      : Printable Invoice

   The forms on this page never go to another page: each onsubmit
   handler does its work with JavaScript and returns false. */

// The ids of the sections on this page (used by showSection in common.js)
const sections = ["overviewSection", "inquirySection", "compareSection", "emiSection", "invoiceSection"];

// The customer who is logged in
const myId = "CUS-10234";

// -1 means "creating a new inquiry"; any other number is the index being edited
let editInquiryIndex = -1;


/* OVERVIEW: counters worked out from the arrays, plus the profile form */
function renderOverview() {
  let sent = 0;
  let answered = 0;
  let pending = 0;

  for (const inquiry of inquiries) {
    if (inquiry.customerId === myId) {
      sent++;
      if (inquiry.status === "Answered") { answered++; }
      if (inquiry.status === "Pending")  { pending++; }
    }
  }

  let drives = 0;
  for (const drive of testDrives) {
    if (drive.customerName === "Mohammed S Hossain") {
      drives++;
    }
  }

  let myInvoices = 0;
  for (const invoice of invoices) {
    if (invoice.customerId === myId) {
      myInvoices++;
    }
  }

  document.getElementById("statInquiries").innerHTML = sent;
  document.getElementById("statAnswered").innerHTML = answered;
  document.getElementById("statPending").innerHTML = pending;
  document.getElementById("statDrives").innerHTML = drives;
  document.getElementById("statInvoices").innerHTML = myInvoices;

  // Pending inquiries are shown in orange when there are any (element.style)
  if (pending > 0) {
    document.getElementById("statPending").style.color = "#EF6C00";
  } else {
    document.getElementById("statPending").style.color = "";
  }
}


function saveProfile() {
  let name = document.getElementById("profileName").value.trim();
  let email = document.getElementById("profileEmail").value.trim();
  let phone = document.getElementById("profilePhone").value.trim();
  let password = document.getElementById("profilePassword").value;

  let isValid = true;
  clearErrors(["profileName", "profileEmail", "profilePhone", "profilePassword"]);

  if (name.length < 3) {
    showError("profileName", "The name must be at least 3 characters.");
    isValid = false;
  }
  if (isValidEmail(email) === false) {
    showError("profileEmail", "Please enter a valid email address.");
    isValid = false;
  }
  if (isValidPhone(phone) === false) {
    showError("profilePhone", "Enter an 11 digit number that starts with 01.");
    isValid = false;
  }
  if (password.length > 0 && password.length < 8) {
    showError("profilePassword", "A new password must be at least 8 characters.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  let position = findIndexById(users, myId);
  users[position].name = name;
  users[position].email = email;
  users[position].phone = phone;
  users[position].city = document.getElementById("profileCity").value;
  if (password.length >= 8) {
    users[position].password = password;
  }

  showMessage("profileMessage", "Your profile has been saved.", "success");
  return false;
}


/* MY INQUIRIES: CREATE, READ, UPDATE, DELETE, SEARCH */

// Fills the car dropdown from the cars array so it is never out of date
function fillCarChoices() {
  let options = "<option value=''>-- Select Car --</option>";
  for (const car of cars) {
    if (car.status === "Live") {
      options += "<option value='" + car.id + "'>" + car.name + ", " + car.vendorName + "</option>";
    }
  }
  document.getElementById("inqCar").innerHTML = options;

  // The two comparison dropdowns use the same list
  let compareOptions = "<option value=''>-- Select Car --</option>";
  for (const car of cars) {
    if (car.status === "Live") {
      compareOptions += "<option value='" + car.id + "'>" + car.name + "</option>";
    }
  }
  document.getElementById("carOne").innerHTML = compareOptions;
  document.getElementById("carTwo").innerHTML = compareOptions;
}


// READ + SEARCH: draw the table rows with a loop and innerHTML
function renderInquiries() {
  let keyword = document.getElementById("inqSearch").value;
  let statusFilter = document.getElementById("inqStatusFilter").value;

  let rows = "";
  let shown = 0;
  let mine = 0;

  for (let i = 0; i < inquiries.length; i++) {
    let inquiry = inquiries[i];
    if (inquiry.customerId !== myId) {
      continue;                       // only my own inquiries
    }
    mine++;

    let matchesKeyword = containsText(inquiry.carName, keyword) || containsText(inquiry.id, keyword) ||
                         containsText(inquiry.vendorName, keyword) || containsText(inquiry.topic, keyword);
    let matchesStatus = (statusFilter === "All" || inquiry.status === statusFilter);

    if (matchesKeyword && matchesStatus) {
      let statusColour;
      switch (inquiry.status) {
        case "Answered":
          statusColour = "green";
          break;
        case "Pending":
          statusColour = "orange";
          break;
        default:
          statusColour = "grey";
      }

      // Only a pending or answered inquiry can still be edited
      let editButton = "";
      if (inquiry.status !== "Closed") {
        editButton = "<button type='button' class='btn btn-small' onclick='editInquiry(" + i + ")'>Edit</button>";
      }

      rows += "<tr>" +
                "<td>" + inquiry.id + "</td>" +
                "<td><strong>" + inquiry.carName + "</strong></td>" +
                "<td>" + inquiry.vendorName + "</td>" +
                "<td>" + inquiry.topic + "</td>" +
                "<td>" + longDate(inquiry.date) + "</td>" +
                "<td><span class='badge " + statusColour + "'>" + inquiry.status + "</span></td>" +
                "<td>" + inquiry.reply + "</td>" +
                "<td>" + editButton +
                  "<button type='button' class='btn btn-small btn-danger' onclick='deleteInquiry(" + i + ")'>Delete</button>" +
                "</td>" +
              "</tr>";
      shown++;
    }
  }

  if (shown === 0) {
    rows = "<tr><td colspan='8' class='empty-row'>No inquiries match your search.</td></tr>";
  }

  document.getElementById("inquiryTableBody").innerHTML = rows;
  document.getElementById("inquiryCount").innerHTML = "Showing " + shown + " of " + mine + " inquiries";
}


// CREATE or UPDATE: runs when the inquiry form is submitted
function saveInquiry() {
  let carId = document.getElementById("inqCar").value;
  let topic = document.getElementById("inqTopic").value;
  let replyMethod = getRadioValue("replyMethod");
  let message = document.getElementById("inqMessage").value.trim();

  let isValid = true;
  clearErrors(["inqCar", "inqTopic", "replyMethod", "inqMessage"]);

  if (carId === "") {
    showError("inqCar", "Please choose the car you are asking about.");
    isValid = false;
  }
  if (topic === "") {
    showError("inqTopic", "Please choose a topic.");
    isValid = false;
  }
  if (replyMethod === "") {
    showError("replyMethod", "Please choose how the vendor should reply.");
    isValid = false;
  }
  if (message.length < 10) {
    showError("inqMessage", "Please write at least 10 characters.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  let car = cars[findIndexById(cars, carId)];

  if (editInquiryIndex === -1) {
    // CREATE: build a new object and push() it to the end of the array
    let newInquiry = { id: nextId("INQ", inquiries), customerId: myId,
                       customerName: "Mohammed S Hossain",
                       carId: car.id, carName: car.name, vendorName: car.vendorName,
                       topic: topic, replyMethod: replyMethod, message: message,
                       date: todayString(), status: "Pending", reply: "Waiting for the vendor",
                       vendorReplied: false };
    inquiries.push(newInquiry);
    showMessage("inquiryMessage", "Inquiry <strong>" + newInquiry.id + "</strong> was sent to " +
                car.vendorName + ".", "success");
  } else {
    // UPDATE: change the properties of the object that is being edited
    let inquiry = inquiries[editInquiryIndex];
    inquiry.carId = car.id;
    inquiry.carName = car.name;
    inquiry.vendorName = car.vendorName;
    inquiry.topic = topic;
    inquiry.replyMethod = replyMethod;
    inquiry.message = message;
    showMessage("inquiryMessage", "Inquiry <strong>" + inquiry.id + "</strong> was updated.", "success");
  }

  resetInquiryForm();
  renderInquiries();
  renderOverview();
  return false;   // never leave the page
}


// UPDATE step 1: copy the inquiry's values into the form
function editInquiry(index) {
  let inquiry = inquiries[index];
  editInquiryIndex = index;

  document.getElementById("inqCar").value = inquiry.carId;
  document.getElementById("inqTopic").value = inquiry.topic;
  setRadioValue("replyMethod", inquiry.replyMethod);
  document.getElementById("inqMessage").value = inquiry.message;

  document.getElementById("inquiryFormTitle").innerHTML = "Edit Inquiry " + inquiry.id;
  document.getElementById("inquirySaveButton").value = "Update Inquiry";
  hideMessage("inquiryMessage");
  countInquiryCharacters();
}


// DELETE: remove the inquiry from the array
function deleteInquiry(index) {
  let inquiry = inquiries[index];
  inquiries = removeAt(inquiries, index);

  showMessage("inquiryMessage", "Inquiry <strong>" + inquiry.id + "</strong> was deleted.", "info");
  resetInquiryForm();
  renderInquiries();
  renderOverview();
}


// Clears the form and goes back to "Create" mode
function resetInquiryForm() {
  editInquiryIndex = -1;
  document.getElementById("inquiryForm").reset();
  clearErrors(["inqCar", "inqTopic", "replyMethod", "inqMessage"]);
  document.getElementById("inquiryFormTitle").innerHTML = "Create a New Inquiry";
  document.getElementById("inquirySaveButton").value = "Create Inquiry";
  countInquiryCharacters();
}


// Counts the characters as the customer types (onkeyup)
function countInquiryCharacters() {
  let typed = document.getElementById("inqMessage").value.length;
  document.getElementById("messageCounter").innerHTML = typed + " / 300";

  if (typed > 300) {
    document.getElementById("messageCounter").style.color = "#C62828";
  } else {
    document.getElementById("messageCounter").style.color = "";
  }
}


/* UNIQUE FEATURE 1: CAR COMPARISON TOOL */
function compareCars() {
  let firstId = document.getElementById("carOne").value;
  let secondId = document.getElementById("carTwo").value;

  let isValid = true;
  clearErrors(["carOne", "carTwo"]);

  if (firstId === "") {
    showError("carOne", "Please choose the first car.");
    isValid = false;
  }
  if (secondId === "") {
    showError("carTwo", "Please choose the second car.");
    isValid = false;
  }
  if (firstId !== "" && firstId === secondId) {
    showError("carTwo", "Please choose two different cars.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  let first = cars[findIndexById(cars, firstId)];
  let second = cars[findIndexById(cars, secondId)];

  // Which rows the customer ticked
  let wanted = document.getElementsByName("compareOn");
  let rows = "";

  rows += "<tr><th>Specification</th><th>" + first.name + "</th><th>" + second.name + "</th></tr>";
  rows += "<tr><td>Photo</td>" +
            "<td><img src='" + first.photo + "' alt='" + first.name + "' width='200' height='120' class='car-photo'></td>" +
            "<td><img src='" + second.photo + "' alt='" + second.name + "' width='200' height='120' class='car-photo'></td></tr>";

  for (let i = 0; i < wanted.length; i++) {
    if (wanted[i].checked === false) {
      continue;
    }
    switch (wanted[i].value) {
      case "Price":
        rows += comparisonRow("Price (BDT)", money(first.price), money(second.price));
        break;
      case "Mileage":
        rows += comparisonRow("Mileage", money(first.mileage) + " km", money(second.mileage) + " km");
        break;
      case "Engine":
        rows += comparisonRow("Engine", first.engine + " cc", second.engine + " cc");
        break;
      case "Fuel":
        rows += comparisonRow("Fuel Type", first.fuel, second.fuel);
        break;
      case "Features":
        rows += comparisonRow("Features", first.features, second.features);
        break;
    }
  }

  rows += comparisonRow("Transmission", first.transmission, second.transmission);
  rows += comparisonRow("Seating Capacity", first.seats, second.seats);
  rows += comparisonRow("Vendor", first.vendorName, second.vendorName);

  document.getElementById("compareBody").innerHTML = rows;
  document.getElementById("compareCaption").innerHTML = first.name + " compared with " + second.name;

  // A short verdict worked out from the two prices
  let cheaper = first;
  let dearer = second;
  if (second.price < first.price) {
    cheaper = second;
    dearer = first;
  }
  let difference = dearer.price - cheaper.price;
  document.getElementById("compareVerdict").innerHTML =
    "<strong>" + cheaper.name + "</strong> is <span class='big'>BDT " + money(difference) +
    "</span> cheaper than " + dearer.name + ".";

  document.getElementById("compareResult").style.display = "block";
  return false;
}


// Builds one row of the comparison table
function comparisonRow(label, firstValue, secondValue) {
  return "<tr><td>" + label + "</td><td>" + firstValue + "</td><td>" + secondValue + "</td></tr>";
}


/* Works out (1 + rate) multiplied by itself "months" times.
   A plain for loop, so the EMI formula needs no built in power function. */
function compound(rate, months) {
  let total = 1;
  for (let i = 0; i < months; i++) {
    total = total * (1 + rate);
  }
  return total;
}


/* Writes 9 as "9.00" and 9.5 as "9.50", for the interest rates */
function twoDecimals(number) {
  let rounded = Math.round(number * 100);     // 9.5 becomes 950
  let whole = Math.floor(rounded / 100);
  let hundredths = rounded - whole * 100;
  if (hundredths < 10) {
    return whole + ".0" + hundredths;
  }
  return whole + "." + hundredths;
}


/* UNIQUE FEATURE 2: EMI CALCULATOR */
function calculateEmi() {
  let price = Number(document.getElementById("emiPrice").value);
  let down = Number(document.getElementById("emiDown").value);
  let years = Number(document.getElementById("emiYears").value);
  let bankName = getRadioValue("bankName");

  let isValid = true;
  clearErrors(["emiPrice", "emiDown", "emiYears", "bankName"]);

  if (price <= 0) {
    showError("emiPrice", "Please enter the price of the car.");
    isValid = false;
  }
  if (down < 0) {
    showError("emiDown", "The down payment cannot be negative.");
    isValid = false;
  }
  if (down >= price && price > 0) {
    showError("emiDown", "The down payment must be smaller than the price.");
    isValid = false;
  }
  if (years === 0) {
    showError("emiYears", "Please choose how long the loan runs.");
    isValid = false;
  }
  if (bankName === "") {
    showError("bankName", "Please choose a bank.");
    isValid = false;
  }

  if (isValid === false) {
    document.getElementById("emiResult").style.display = "none";
    return false;
  }

  // Find the bank's rules in the banks array
  let bank = banks[0];
  for (const item of banks) {
    if (item.name === bankName) {
      bank = item;
    }
  }

  let downPercent = Math.round(down / price * 100);
  if (downPercent < bank.minDown) {
    showError("emiDown", bank.name + " asks for at least " + bank.minDown + " percent down, you gave " +
              downPercent + " percent.");
    document.getElementById("emiResult").style.display = "none";
    return false;
  }
  if (years > bank.maxYears) {
    showError("emiYears", bank.name + " lends for at most " + bank.maxYears + " years.");
    document.getElementById("emiResult").style.display = "none";
    return false;
  }

  // The standard EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
  let principal = price - down;
  let monthlyRate = bank.rate / 100 / 12;
  let months = years * 12;
  let growth = compound(monthlyRate, months);
  let emi = principal * monthlyRate * growth / (growth - 1);
  let totalPayable = emi * months;
  let totalInterest = totalPayable - principal;

  document.getElementById("emiBank").innerHTML = bank.name + " at " + twoDecimals(bank.rate) + " percent";
  document.getElementById("emiLoan").innerHTML = "BDT " + money(principal);
  document.getElementById("emiMonthly").innerHTML = "BDT " + money(emi);
  document.getElementById("emiMonths").innerHTML = months + " monthly payments";
  document.getElementById("emiInterest").innerHTML = "BDT " + money(totalInterest);
  document.getElementById("emiTotal").innerHTML = "BDT " + money(totalPayable);
  document.getElementById("emiResult").style.display = "block";

  renderEmiChart(principal, bank.rate);
  return false;
}


// A small table showing the same loan over 1, 3, 5 and 7 years
function renderEmiChart(principal, rate) {
  let durations = [1, 3, 5, 7];
  let rows = "";

  for (const years of durations) {
    let monthlyRate = rate / 100 / 12;
    let months = years * 12;
    let growth = compound(monthlyRate, months);
    let emi = principal * monthlyRate * growth / (growth - 1);
    let total = emi * months;

    rows += "<tr>" +
              "<td>" + years + " Year(s)</td>" +
              "<td>" + money(emi) + "</td>" +
              "<td>" + money(total - principal) + "</td>" +
              "<td>" + money(total) + "</td>" +
            "</tr>";
  }

  document.getElementById("emiChartBody").innerHTML = rows;
  document.getElementById("emiChartCaption").innerHTML =
    "Monthly Instalment for a BDT " + money(principal) + " Loan at " + twoDecimals(rate) + " percent";
}


// Fills the bank rate table from the banks array
function renderBankTable() {
  let rows = "";
  for (const bank of banks) {
    rows += "<tr>" +
              "<td>" + bank.name + "</td>" +
              "<td>" + twoDecimals(bank.rate) + " percent</td>" +
              "<td>" + bank.minDown + " percent</td>" +
              "<td>" + bank.maxYears + " Years</td>" +
            "</tr>";
  }
  document.getElementById("bankBody").innerHTML = rows;
}


/* UNIQUE FEATURE 3: PRINTABLE INVOICE */
function renderInvoiceList() {
  let rows = "";
  let shown = 0;

  for (const invoice of invoices) {
    if (invoice.customerId !== myId) {
      continue;
    }
    rows += "<tr>" +
              "<td>" + invoice.id + "</td>" +
              "<td>" + invoice.orderId + "</td>" +
              "<td>" + invoice.carName + "</td>" +
              "<td>" + money(invoice.total) + "</td>" +
              "<td>" + longDate(invoice.date) + "</td>" +
              "<td><span class='badge green'>" + invoice.payment + "</span></td>" +
              "<td><button type='button' class='btn btn-small' onclick=\"openInvoice('" + invoice.id + "')\">Open</button></td>" +
            "</tr>";
    shown++;
  }

  if (shown === 0) {
    rows = "<tr><td colspan='7' class='empty-row'>You have no invoices yet.</td></tr>";
  }
  document.getElementById("invoiceListBody").innerHTML = rows;
}


// Builds the full invoice, with every line worked out in JavaScript
function openInvoice(invoiceId) {
  let invoice = invoices[findIndexById(invoices, invoiceId)];

  document.getElementById("invoiceNumber").innerHTML = "Invoice " + invoice.id;
  document.getElementById("billedToBody").innerHTML =
    "<tr><td>Customer Name</td><td>" + invoice.customerName + "</td></tr>" +
    "<tr><td>Customer ID</td><td>" + invoice.customerId + "</td></tr>" +
    "<tr><td>Address</td><td>" + invoice.address + "</td></tr>" +
    "<tr><td>Sold By</td><td>" + invoice.vendorName + ", " + invoice.vendorId + "</td></tr>" +
    "<tr><td>Invoice Date</td><td>" + longDate(invoice.date) + "</td></tr>";

  let subtotal = invoice.carPrice + invoice.registration + invoice.insurance + invoice.serviceCharge;
  let vat = Math.round(subtotal * invoice.vatPercent / 100);
  let grandTotal = subtotal + vat - invoice.discount;

  document.getElementById("invoiceItemsBody").innerHTML =
    "<tr><td>" + invoice.carName + ", Chassis " + invoice.chassis + "</td><td>1</td><td>" +
      money(invoice.carPrice) + "</td><td>" + money(invoice.carPrice) + "</td></tr>" +
    "<tr><td>Registration and Documentation Fee</td><td>1</td><td>" +
      money(invoice.registration) + "</td><td>" + money(invoice.registration) + "</td></tr>" +
    "<tr><td>One Year Comprehensive Insurance</td><td>1</td><td>" +
      money(invoice.insurance) + "</td><td>" + money(invoice.insurance) + "</td></tr>" +
    "<tr><td>DriveHub Platform Service Charge</td><td>1</td><td>" +
      money(invoice.serviceCharge) + "</td><td>" + money(invoice.serviceCharge) + "</td></tr>" +
    "<tr><td colspan='3'>Subtotal</td><td>" + money(subtotal) + "</td></tr>" +
    "<tr><td colspan='3'>VAT at " + invoice.vatPercent + " percent</td><td>" + money(vat) + "</td></tr>" +
    "<tr><td colspan='3'>Discount</td><td>" + money(invoice.discount) + "</td></tr>" +
    "<tr><th colspan='3'>Grand Total</th><th>BDT " + money(grandTotal) + "</th></tr>";

  document.getElementById("invoiceDetail").style.display = "block";
}


// Sends a copy of the invoice to an email address
function emailInvoice() {
  let address = document.getElementById("invoiceEmail").value.trim();
  clearError("invoiceEmail");

  if (isValidEmail(address) === false) {
    showError("invoiceEmail", "Please enter a valid email address.");
    return false;
  }

  showMessage("invoiceMessage", "A copy of the invoice has been queued for <strong>" + address + "</strong>.", "success");
  document.getElementById("invoiceEmailForm").reset();
  return false;
}


// The browser's own print dialogue, so the invoice can be saved as a PDF
function printInvoice() {
  window.print();
}


/* START: runs once when the page has loaded
   (scripts are at the end of <body>, so every element already exists) */
fillCarChoices();
renderOverview();
renderInquiries();
renderBankTable();
renderInvoiceList();
countInquiryCharacters();
showSection("overviewSection");

// Each time the customer opens the Overview, the counters are worked out again
document.getElementById("nav-overviewSection").addEventListener("click", renderOverview);
