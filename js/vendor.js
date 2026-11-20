/* vendor.js  -  Everything the Vendor can do (vendor.html)
   CRUD + Search : My Car Listings (cars array)
   Unique 1      : Car Valuation Estimator
   Unique 2      : Sales Performance Chart and Visitor Counter
   Unique 3      : Listing Expiry and Renewal

   The forms on this page never go to another page: each onsubmit
   handler does its work with JavaScript and returns false. */

// The ids of the sections on this page (used by showSection in common.js)
const sections = ["overviewSection", "listingSection", "valuationSection", "salesSection", "expirySection"];

// The vendor who is logged in
const myVendorId = "VEN-2041";
const myVendorName = "Rahim Motors";

// -1 means "adding a new listing"; any other number is the index being edited
let editCarIndex = -1;


/* OVERVIEW: counters worked out from the cars array */
function renderOverview() {
  let live = 0;
  let waiting = 0;
  let sold = 0;
  let totalViews = 0;
  let totalInquiries = 0;
  let stockValue = 0;

  for (const car of cars) {
    if (car.vendorId !== myVendorId) {
      continue;
    }
    switch (car.status) {
      case "Live":
        live++;
        stockValue += car.price;
        break;
      case "Waiting":
        waiting++;
        break;
      case "Sold":
        sold++;
        break;
    }
    totalViews += car.views;
    totalInquiries += car.inquiries;
  }

  document.getElementById("statLive").innerHTML = live;
  document.getElementById("statWaiting").innerHTML = waiting;
  document.getElementById("statSold").innerHTML = sold;
  document.getElementById("statViews").innerHTML = money(totalViews);
  document.getElementById("statInquiries").innerHTML = totalInquiries;
  document.getElementById("statStock").innerHTML = money(stockValue);

  if (waiting > 0) {
    document.getElementById("statWaiting").style.color = "#EF6C00";
  } else {
    document.getElementById("statWaiting").style.color = "";
  }
}


function saveProfile() {
  let name = document.getElementById("vendorName").value.trim();
  let email = document.getElementById("vendorEmail").value.trim();
  let phone = document.getElementById("vendorPhone").value.trim();
  let address = document.getElementById("vendorAddress").value.trim();
  let password = document.getElementById("vendorPassword").value;

  let isValid = true;
  clearErrors(["vendorName", "vendorEmail", "vendorPhone", "vendorAddress", "vendorPassword"]);

  if (name.length < 3) {
    showError("vendorName", "The business name must be at least 3 characters.");
    isValid = false;
  }
  if (isValidEmail(email) === false) {
    showError("vendorEmail", "Please enter a valid email address.");
    isValid = false;
  }
  if (isValidPhone(phone) === false) {
    showError("vendorPhone", "Enter an 11 digit number that starts with 01.");
    isValid = false;
  }
  if (address.length < 10) {
    showError("vendorAddress", "Please write the full showroom address.");
    isValid = false;
  }
  if (password.length > 0 && password.length < 8) {
    showError("vendorPassword", "A new password must be at least 8 characters.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  let position = findIndexById(users, myVendorId);
  users[position].name = name;
  users[position].email = email;
  users[position].phone = phone;
  users[position].showroom = address;
  if (password.length >= 8) {
    users[position].password = password;
  }

  showMessage("profileMessage", "Your business profile has been saved.", "success");
  return false;
}


/* MY LISTINGS: CREATE, READ, UPDATE, DELETE, SEARCH */

// READ + SEARCH
function renderListings() {
  let keyword = document.getElementById("lstSearch").value;
  let statusFilter = document.getElementById("lstStatusFilter").value;
  let brandFilter = document.getElementById("lstBrandFilter").value;

  let rows = "";
  let shown = 0;
  let mine = 0;

  for (let i = 0; i < cars.length; i++) {
    let car = cars[i];
    if (car.vendorId !== myVendorId) {
      continue;                        // only my own cars
    }
    mine++;

    let matchesKeyword = containsText(car.name, keyword) || containsText(car.id, keyword) ||
                         containsText(car.brand, keyword);
    let matchesStatus = (statusFilter === "All" || car.status === statusFilter);
    let matchesBrand = (brandFilter === "All" || car.brand === brandFilter);

    if (matchesKeyword && matchesStatus && matchesBrand) {
      let statusColour;
      switch (car.status) {
        case "Live":
          statusColour = "green";
          break;
        case "Waiting":
          statusColour = "orange";
          break;
        case "Sold":
          statusColour = "blue";
          break;
        default:
          statusColour = "red";
      }

      // A car that is already sold cannot be edited any more
      let actions = "Not editable";
      if (car.status !== "Sold") {
        actions = "<button type='button' class='btn btn-small' onclick='editCar(" + i + ")'>Edit</button>" +
                  "<button type='button' class='btn btn-small btn-danger' onclick='deleteCar(" + i + ")'>Delete</button>";
      }

      rows += "<tr>" +
                "<td>" + car.id + "</td>" +
                "<td><strong>" + car.name + "</strong><br><span class='hint'>" + car.brand + "</span></td>" +
                "<td>" + car.year + "</td>" +
                "<td>" + money(car.price) + "</td>" +
                "<td>" + money(car.views) + "</td>" +
                "<td>" + car.inquiries + "</td>" +
                "<td><span class='badge " + statusColour + "'>" + car.status + "</span></td>" +
                "<td>" + actions + "</td>" +
              "</tr>";
      shown++;
    }
  }

  if (shown === 0) {
    rows = "<tr><td colspan='8' class='empty-row'>No listings match your search.</td></tr>";
  }

  document.getElementById("listingTableBody").innerHTML = rows;
  document.getElementById("listingCount").innerHTML = "Showing " + shown + " of " + mine + " listings";
}


// CREATE or UPDATE
function saveCar() {
  let name = document.getElementById("carName").value.trim();
  let brand = document.getElementById("carBrand").value;
  let year = Number(document.getElementById("carYear").value);
  let price = Number(document.getElementById("carPrice").value);
  let mileage = Number(document.getElementById("carMileage").value);
  let engine = Number(document.getElementById("carEngine").value);
  let fuel = getRadioValue("fuelType");
  let condition = getRadioValue("carCondition");
  let features = getCheckedValues("features");
  let listDate = document.getElementById("listDate").value;
  let description = document.getElementById("carDesc").value.trim();
  let agreed = document.getElementById("vendorAgree").checked;

  let isValid = true;
  clearErrors(["carName", "carBrand", "carYear", "carPrice", "carMileage", "carEngine",
               "fuelType", "carCondition", "listDate", "carDesc", "vendorAgree"]);

  if (name.length < 3) {
    showError("carName", "Please write the full car name.");
    isValid = false;
  }
  if (brand === "") {
    showError("carBrand", "Please choose a brand.");
    isValid = false;
  }
  if (year < 1990 || year > 2026) {
    showError("carYear", "Enter a year between 1990 and 2026.");
    isValid = false;
  }
  if (price < 100000) {
    showError("carPrice", "The price must be at least BDT 1,00,000.");
    isValid = false;
  }
  if (mileage < 0) {
    showError("carMileage", "The mileage cannot be negative.");
    isValid = false;
  }
  if (engine < 600 || engine > 6000) {
    showError("carEngine", "Enter an engine size between 600 cc and 6000 cc.");
    isValid = false;
  }
  if (fuel === "") {
    showError("fuelType", "Please choose the fuel type.");
    isValid = false;
  }
  if (condition === "") {
    showError("carCondition", "Please choose the condition.");
    isValid = false;
  }
  if (isEmpty(listDate)) {
    showError("listDate", "Please choose the listing date.");
    isValid = false;
  }
  if (description.length < 20) {
    showError("carDesc", "Please describe the car in at least 20 characters.");
    isValid = false;
  }
  if (agreed === false) {
    showError("vendorAgree", "You must confirm that the information is true.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  if (editCarIndex === -1) {
    // CREATE: a brand new listing always starts as "Waiting" for moderation
    let newCar = { id: nextId("LST", cars), name: name, brand: brand, year: year, price: price,
                   fuel: fuel, mileage: mileage, engine: engine, transmission: "Automatic", seats: 5,
                   condition: condition, features: features,
                   vendorId: myVendorId, vendorName: myVendorName, city: "Dhaka",
                   views: 0, inquiries: 0, status: "Waiting",
                   listedOn: listDate, duration: 60, expiresOn: addDays(listDate, 60),
                   photo: "image/car1.png", description: description };
    cars.push(newCar);
    showMessage("listingMessage", "Listing <strong>" + newCar.id + "</strong> was created and sent " +
                "to an employee for moderation.", "success");
  } else {
    // UPDATE
    let car = cars[editCarIndex];
    car.name = name;
    car.brand = brand;
    car.year = year;
    car.price = price;
    car.fuel = fuel;
    car.mileage = mileage;
    car.engine = engine;
    car.condition = condition;
    car.features = features;
    car.listedOn = listDate;
    car.expiresOn = addDays(listDate, car.duration);
    car.description = description;
    showMessage("listingMessage", "Listing <strong>" + car.id + "</strong> was updated.", "success");
  }

  resetCarForm();
  renderListings();
  renderOverview();
  renderExpiry();
  fillRenewChoices();
  return false;
}


// UPDATE step 1: copy the car into the form
function editCar(index) {
  let car = cars[index];
  editCarIndex = index;

  document.getElementById("carName").value = car.name;
  document.getElementById("carBrand").value = car.brand;
  document.getElementById("carYear").value = car.year;
  document.getElementById("carPrice").value = car.price;
  document.getElementById("carMileage").value = car.mileage;
  document.getElementById("carEngine").value = car.engine;
  setRadioValue("fuelType", car.fuel);
  setRadioValue("carCondition", car.condition);
  document.getElementById("listDate").value = car.listedOn;
  document.getElementById("carDesc").value = car.description;
  document.getElementById("vendorAgree").checked = true;

  // Tick the feature boxes this car already has
  let boxes = document.getElementsByName("features");
  for (let i = 0; i < boxes.length; i++) {
    boxes[i].checked = containsText(car.features, boxes[i].value);
  }

  document.getElementById("listingFormTitle").innerHTML = "Edit Listing " + car.id;
  document.getElementById("listingSaveButton").value = "Update Listing";
  hideMessage("listingMessage");
  previewListing(index);
}


// DELETE
function deleteCar(index) {
  let car = cars[index];

  if (car.status === "Sold") {
    showMessage("listingMessage", "A sold car cannot be removed, it belongs to the sales record.", "error");
    return;
  }

  cars = removeAt(cars, index);
  showMessage("listingMessage", "Listing <strong>" + car.id + " " + car.name +
              "</strong> was removed from the marketplace.", "info");

  resetCarForm();
  renderListings();
  renderOverview();
  renderExpiry();
  fillRenewChoices();
}


// Clears the form and goes back to "Add" mode
function resetCarForm() {
  editCarIndex = -1;
  document.getElementById("listingForm").reset();
  clearErrors(["carName", "carBrand", "carYear", "carPrice", "carMileage", "carEngine",
               "fuelType", "carCondition", "listDate", "carDesc", "vendorAgree"]);
  document.getElementById("listingFormTitle").innerHTML = "Add a New Listing";
  document.getElementById("listingSaveButton").value = "Create Listing";
  document.getElementById("listingPreview").innerHTML =
    "<p class='hint'>Choose Edit on a listing to see its public preview here.</p>";
}


// Shows what the public will see for this listing
function previewListing(index) {
  let car = cars[index];
  document.getElementById("listingPreview").innerHTML =
    "<img src='" + car.photo + "' alt='" + car.name + "' width='400' height='240' class='car-photo'>" +
    "<h4>" + car.name + "</h4>" +
    "<p>" + car.description + "</p>" +
    "<p><strong>Price: BDT " + money(car.price) + "</strong> &middot; " +
      car.fuel + " &middot; " + money(car.mileage) + " km &middot; " + car.features + "</p>" +
    "<p class='hint'>Views: " + money(car.views) + " &middot; Inquiries: " + car.inquiries +
      " &middot; Status: " + car.status + "</p>";
}


/* UNIQUE FEATURE 1: CAR VALUATION ESTIMATOR */
function estimateValue() {
  let original = Number(document.getElementById("valOriginal").value);
  let year = Number(document.getElementById("valYear").value);
  let mileage = Number(document.getElementById("valMileage").value);
  let condition = getRadioValue("valCondition");

  let isValid = true;
  clearErrors(["valBrand", "valOriginal", "valYear", "valMileage", "valCondition"]);

  if (document.getElementById("valBrand").value === "") {
    showError("valBrand", "Please choose the brand.");
    isValid = false;
  }
  if (original < 100000) {
    showError("valOriginal", "Enter the original showroom price.");
    isValid = false;
  }
  if (year < 1990 || year > 2026) {
    showError("valYear", "Enter a year between 1990 and 2026.");
    isValid = false;
  }
  if (mileage < 0) {
    showError("valMileage", "The mileage cannot be negative.");
    isValid = false;
  }
  if (condition === "") {
    showError("valCondition", "Please choose the condition.");
    isValid = false;
  }

  if (isValid === false) {
    document.getElementById("valuationResult").style.display = "none";
    return false;
  }

  // ----- Depreciation for age: 10 percent a year, capped by the rules -----
  let age = 2026 - year;
  let agePercent = age * 10;
  if (agePercent > platformRules.maxDepreciation) {
    agePercent = platformRules.maxDepreciation;
  }
  let ageAmount = original * agePercent / 100;

  // ----- Deduction for mileage: 1 percent for every 10,000 km past 20,000 -----
  let mileagePercent = 0;
  if (mileage > 20000) {
    mileagePercent = Math.floor((mileage - 20000) / 10000);
  }
  if (mileagePercent > 15) {
    mileagePercent = 15;
  }
  let mileageAmount = original * mileagePercent / 100;

  // ----- Condition adjustment -----
  let conditionPercent = 0;
  switch (condition) {
    case "Excellent":
      conditionPercent = 0;
      break;
    case "Good":
      conditionPercent = 5;
      break;
    case "Average":
      conditionPercent = 12;
      break;
    default:
      conditionPercent = 20;
  }
  let conditionAmount = original * conditionPercent / 100;

  // ----- Extra deductions the vendor ticked -----
  let extraPercent = 0;
  let boxes = document.getElementsByName("valDeductions");
  for (let i = 0; i < boxes.length; i++) {
    if (boxes[i].checked) {
      switch (boxes[i].value) {
        case "Accident":
          extraPercent += 10;
          break;
        case "Repaint":
          extraPercent += 4;
          break;
        default:
          extraPercent += 3;
      }
    }
  }
  let extraAmount = original * extraPercent / 100;

  let suggested = original - ageAmount - mileageAmount - conditionAmount - extraAmount;
  if (suggested < 0) {
    suggested = 0;
  }

  document.getElementById("valuationBody").innerHTML =
    "<tr><td>Original Price</td><td>Not applicable</td><td>" + money(original) + "</td></tr>" +
    "<tr><td>Depreciation for age, " + age + " year(s)</td><td>" + agePercent + " percent</td><td>" + money(ageAmount) + "</td></tr>" +
    "<tr><td>Deduction for mileage</td><td>" + mileagePercent + " percent</td><td>" + money(mileageAmount) + "</td></tr>" +
    "<tr><td>Condition adjustment, " + condition + "</td><td>" + conditionPercent + " percent</td><td>" + money(conditionAmount) + "</td></tr>" +
    "<tr><td>Other deductions</td><td>" + extraPercent + " percent</td><td>" + money(extraAmount) + "</td></tr>" +
    "<tr><th>Suggested Listing Price</th><th>Not applicable</th><th>BDT " + money(suggested) + "</th></tr>";

  document.getElementById("valuationHeadline").innerHTML =
    "Suggested price: <span class='big'>BDT " + money(suggested) + "</span>";
  document.getElementById("valuationResult").style.display = "block";
  return false;
}


// The depreciation reference table, drawn from the same rule
function renderDepreciationTable() {
  let rows = "";
  let ages = [1, 3, 5, 7];

  for (const age of ages) {
    let percent = age * 10;
    let note = "";
    if (percent > platformRules.maxDepreciation) {
      percent = platformRules.maxDepreciation;
      note = ", the maximum";
    }
    rows += "<tr><td>" + age + " Year(s)</td><td>" + percent + " percent" + note + "</td></tr>";
  }

  document.getElementById("depreciationBody").innerHTML = rows;
}


/* UNIQUE FEATURE 2: SALES CHART AND VISITOR COUNTER */
function renderSales() {
  let rows = "";
  let totalSold = 0;
  let totalRevenue = 0;
  let months = [];
  let soldCounts = [];

  for (const record of monthlySales) {
    let average = 0;
    if (record.vendorSold > 0) {
      average = record.vendorRevenue / record.vendorSold;
    }
    rows += "<tr>" +
              "<td>" + record.month + "</td>" +
              "<td>" + record.vendorSold + "</td>" +
              "<td>" + money(record.vendorRevenue) + "</td>" +
              "<td>" + money(average) + "</td>" +
            "</tr>";
    totalSold += record.vendorSold;
    totalRevenue += record.vendorRevenue;
    months.push(record.month);
    soldCounts.push(record.vendorSold);
  }

  let overallAverage = 0;
  if (totalSold > 0) {
    overallAverage = totalRevenue / totalSold;
  }
  rows += "<tr><th>Total</th><th>" + totalSold + "</th><th>" + money(totalRevenue) +
          "</th><th>" + money(overallAverage) + "</th></tr>";

  document.getElementById("salesBody").innerHTML = rows;

  // The bar chart uses the biggest month as 100 percent
  let biggest = 0;
  for (const count of soldCounts) {
    if (count > biggest) {
      biggest = count;
    }
  }
  drawBarChart("salesChart", months, soldCounts, biggest);
}


// The visitor counter: every listing with how many people looked at it
function renderVisitorCounter() {
  let rows = "";

  for (const car of cars) {
    if (car.vendorId !== myVendorId) {
      continue;
    }

    // Conversion is worked out from inquiries per 100 views
    let conversion = "No views yet";
    if (car.status === "Sold") {
      conversion = "Sold";
    } else if (car.views > 0) {
      let rate = car.inquiries / car.views * 100;
      if (rate >= 1) {
        conversion = "High";
      } else if (rate >= 0.7) {
        conversion = "Medium";
      } else {
        conversion = "Low";
      }
    }

    rows += "<tr>" +
              "<td>" + car.id + "</td>" +
              "<td>" + car.name + "</td>" +
              "<td>" + money(car.views) + "</td>" +
              "<td>" + car.inquiries + "</td>" +
              "<td>" + conversion + "</td>" +
            "</tr>";
  }

  document.getElementById("visitorBody").innerHTML = rows;
}


// The report form at the bottom of the sales section
function generateSalesReport() {
  let year = document.getElementById("reportYear").value;
  let included = getCheckedValues("reportInclude");

  clearError("reportInclude");
  if (included === "") {
    showError("reportInclude", "Please tick at least one thing to include.");
    return false;
  }

  showMessage("salesMessage", "Report for <strong>" + year + "</strong> prepared, including: " +
              included + ". Generated at " + nowString() + ".", "success");
  return false;
}


/* UNIQUE FEATURE 3: LISTING EXPIRY AND RENEWAL */
function renderExpiry() {
  let rows = "";
  let cards = "";
  let today = todayString();
  let expiringSoon = 0;

  for (const car of cars) {
    if (car.vendorId !== myVendorId || car.status === "Sold") {
      continue;
    }

    let daysLeft = daysBetween(today, car.expiresOn);
    let state = "Active";
    let colour = "green";

    if (daysLeft < 0) {
      daysLeft = 0;
      state = "Expired";
      colour = "red";
    } else if (daysLeft <= 7) {
      state = "Expiring Soon";
      colour = "orange";
      expiringSoon++;
    }

    rows += "<tr>" +
              "<td>" + car.id + "</td>" +
              "<td>" + car.name + "</td>" +
              "<td>" + longDate(car.listedOn) + "</td>" +
              "<td>" + car.duration + " Days</td>" +
              "<td>" + longDate(car.expiresOn) + "</td>" +
              "<td>" + daysLeft + "</td>" +
              "<td><span class='badge " + colour + "'>" + state + "</span></td>" +
            "</tr>";

    // A card with a progress bar for anything that needs attention
    if (state !== "Active") {
      let used = car.duration - daysLeft;
      let percent = Math.round(used / car.duration * 100);
      if (percent > 100) { percent = 100; }

      cards += "<div class='reminder' style='border-left-color:#C62828;background-color:#FFF4F4'>" +
                 "<h4>" + car.name + " &middot; " + car.id + "</h4>" +
                 "<p class='hint'>" + state + " &middot; " + daysLeft + " day(s) left of " + car.duration + "</p>" +
                 "<div class='progress-track'><div class='progress-fill' style='width:" + percent + "%'>" +
                   percent + "%</div></div>" +
               "</div>";
    }
  }

  if (cards === "") {
    cards = "<p class='hint'>Nothing is expiring in the next seven days.</p>";
  }

  document.getElementById("expiryBody").innerHTML = rows;
  document.getElementById("expiryCards").innerHTML = cards;
  document.getElementById("expirySummary").innerHTML =
    expiringSoon + " listing(s) expire within the next seven days.";
}


// Fills the renewal dropdown with the listings that can be renewed
function fillRenewChoices() {
  let options = "<option value=''>-- Select Listing --</option>";
  let today = todayString();

  for (const car of cars) {
    if (car.vendorId !== myVendorId || car.status === "Sold") {
      continue;
    }
    let daysLeft = daysBetween(today, car.expiresOn);
    let note = daysLeft + " days left";
    if (daysLeft < 0) {
      note = "expired";
    }
    options += "<option value='" + car.id + "'>" + car.id + " " + car.name + ", " + note + "</option>";
  }

  document.getElementById("renewListing").innerHTML = options;
}


// Shows the price before the vendor presses Renew (onchange)
function previewRenewal() {
  let period = Number(getRadioValue("renewPeriod"));
  let listingId = document.getElementById("renewListing").value;

  if (listingId === "" || period === 0) {
    document.getElementById("renewPreview").innerHTML = "Choose a listing and a period to see the price.";
    return;
  }

  let car = cars[findIndexById(cars, listingId)];
  let cost = renewalPrice(period);
  let extras = "";

  let boxes = document.getElementsByName("renewOptions");
  for (let i = 0; i < boxes.length; i++) {
    if (boxes[i].checked) {
      switch (boxes[i].value) {
        case "Featured":
          cost += platformRules.featuredFee;
          extras += " plus Featured";
          break;
        case "Top of Search":
          cost += platformRules.topOfSearchFee;
          extras += " plus Top of Search";
          break;
        default:
          extras += " plus Auto Renewal";
      }
    }
  }

  let newExpiry = addDays(todayString(), period);
  document.getElementById("renewPreview").innerHTML =
    "<strong>" + car.name + "</strong> would stay live until <strong>" + longDate(newExpiry) +
    "</strong>.<br>Total to pay: <span class='big'>BDT " + money(cost) + "</span>" + extras;
}


// Looks the price up in the platformRules object
function renewalPrice(period) {
  switch (period) {
    case 30:
      return platformRules.renewal30;
    case 60:
      return platformRules.renewal60;
    default:
      return platformRules.renewal90;
  }
}


function renewListing() {
  let listingId = document.getElementById("renewListing").value;
  let period = Number(getRadioValue("renewPeriod"));
  let startDate = document.getElementById("renewStart").value;
  let method = document.getElementById("renewPayment").value;

  let isValid = true;
  clearErrors(["renewListing", "renewPeriod", "renewStart", "renewPayment"]);

  if (listingId === "") {
    showError("renewListing", "Please choose the listing to renew.");
    isValid = false;
  }
  if (period === 0) {
    showError("renewPeriod", "Please choose a renewal period.");
    isValid = false;
  }
  if (isEmpty(startDate)) {
    showError("renewStart", "Please choose the start date.");
    isValid = false;
  }
  if (method === "") {
    showError("renewPayment", "Please choose a payment method.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  let car = cars[findIndexById(cars, listingId)];
  let cost = renewalPrice(period);

  let boxes = document.getElementsByName("renewOptions");
  for (let i = 0; i < boxes.length; i++) {
    if (boxes[i].checked) {
      if (boxes[i].value === "Featured") { cost += platformRules.featuredFee; }
      if (boxes[i].value === "Top of Search") { cost += platformRules.topOfSearchFee; }
    }
  }

  // Move the expiry date forward and record the payment
  car.duration = period;
  car.listedOn = startDate;
  car.expiresOn = addDays(startDate, period);

  renewals.push({ id: nextId("REN", renewals), listingId: car.id, carName: car.name,
                  period: period, date: todayString(), amount: cost, method: method });

  showMessage("renewMessage", "<strong>" + car.name + "</strong> is live until " +
              longDate(car.expiresOn) + ". BDT " + money(cost) + " paid by " + method + ".", "success");

  document.getElementById("renewForm").reset();
  document.getElementById("renewPreview").innerHTML = "Choose a listing and a period to see the price.";
  renderExpiry();
  renderRenewalHistory();
  fillRenewChoices();
  return false;
}


function renderRenewalHistory() {
  let rows = "";
  let total = 0;

  for (const renewal of renewals) {
    rows += "<tr>" +
              "<td>" + renewal.id + "</td>" +
              "<td>" + renewal.listingId + " " + renewal.carName + "</td>" +
              "<td>" + renewal.period + " Days</td>" +
              "<td>" + longDate(renewal.date) + "</td>" +
              "<td>" + money(renewal.amount) + "</td>" +
              "<td>" + renewal.method + "</td>" +
            "</tr>";
    total += renewal.amount;
  }

  rows += "<tr><th colspan='4'>Total paid</th><th>BDT " + money(total) + "</th><th></th></tr>";
  document.getElementById("renewalBody").innerHTML = rows;
}


/* START: runs once when the page has loaded */
renderOverview();
renderListings();
renderDepreciationTable();
renderSales();
renderVisitorCounter();
renderExpiry();
renderRenewalHistory();
fillRenewChoices();
resetCarForm();
showSection("overviewSection");

// Fresh numbers every time these two sections are opened
document.getElementById("nav-overviewSection").addEventListener("click", renderOverview);
document.getElementById("nav-expirySection").addEventListener("click", renderExpiry);
