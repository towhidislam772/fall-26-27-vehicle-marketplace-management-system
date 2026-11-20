/* common.js  -  Helper functions shared by every page
   Loaded after data.js and before each page's own script:
     <script src="js/data.js"></script>
     <script src="js/common.js"></script>
     <script src="js/admin.js"></script>
   An external .js file contains only JavaScript, no <script> tags. */


/* 1. SHOW ONE SECTION AT A TIME
   Each dashboard page declares an array called "sections" with the ids
   of its sections. Clicking a menu button calls showSection("id").
   We change the CSS with the DOM:  element.style.display = "block" */
function showSection(sectionId) {
  for (let i = 0; i < sections.length; i++) {
    let section = document.getElementById(sections[i]);
    let navButton = document.getElementById("nav-" + sections[i]);

    if (sections[i] === sectionId) {
      section.style.display = "block";
      navButton.className = "active";
    } else {
      section.style.display = "none";
      navButton.className = "";
    }
  }
}


/* 2. SHOWING AND CLEARING ERRORS
   Every field has a <span class="error" id="fieldIdError"></span>
   next to it. We write the message with innerHTML and colour the
   field's border red with element.style. */
function showError(fieldId, message) {
  document.getElementById(fieldId + "Error").innerHTML = message;

  // Radio-button groups have no single element with this id, so check first
  let field = document.getElementById(fieldId);
  if (field != null) {
    field.style.border = "2px solid red";
  }
}

function clearError(fieldId) {
  document.getElementById(fieldId + "Error").innerHTML = "";

  let field = document.getElementById(fieldId);
  if (field != null) {
    field.style.border = "";   // "" gives the border back to the CSS file
  }
}

// Clears the errors of many fields at once; fieldIds is an array
function clearErrors(fieldIds) {
  for (let i = 0; i < fieldIds.length; i++) {
    clearError(fieldIds[i]);
  }
}


/* 3. MESSAGE BOXES
   type is "success", "error" or "info" (these are CSS classes) */
function showMessage(boxId, text, type) {
  let box = document.getElementById(boxId);
  box.innerHTML = text;
  box.className = "message " + type;
  box.style.display = "block";
}

function hideMessage(boxId) {
  document.getElementById(boxId).style.display = "none";
}


/* 4. SMALL VALIDATION HELPERS
   Each returns true or false, so they can be used inside if ( ... ) */

// true when the user typed nothing (or only spaces)
function isEmpty(value) {
  return value.trim() === "";
}

// A simple e-mail check: something@something.something
function isValidEmail(email) {
  let atPosition = email.indexOf("@");
  let dotPosition = email.indexOf(".", atPosition);

  if (atPosition < 1) {
    return false;                       // no @, or @ is the first character
  }
  if (dotPosition < atPosition + 2) {
    return false;                       // no dot after the @
  }
  if (dotPosition === email.length - 1) {
    return false;                       // the dot is the last character
  }
  return true;
}

// true when every character of text is a digit 0-9
function isDigitsOnly(text) {
  if (text.length === 0) {
    return false;
  }
  let digits = "0123456789";
  for (let i = 0; i < text.length; i++) {
    if (digits.indexOf(text[i]) === -1) {
      return false;
    }
  }
  return true;
}

// A Bangladeshi mobile number: 11 digits starting with 01
function isValidPhone(phone) {
  if (isDigitsOnly(phone) === false) {
    return false;
  }
  if (phone.length !== 11) {
    return false;
  }
  return phone.slice(0, 2) === "01";
}

// Returns the value of the ticked radio button in a group, or "" if none
// (Lecture 01: document.getElementsByName("Gender"))
function getRadioValue(groupName) {
  let radios = document.getElementsByName(groupName);
  for (let i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      return radios[i].value;
    }
  }
  return "";
}

// Ticks the radio button whose value matches (used when editing a record)
function setRadioValue(groupName, value) {
  let radios = document.getElementsByName(groupName);
  for (let i = 0; i < radios.length; i++) {
    radios[i].checked = (radios[i].value === value);
  }
}

// Collects the values of every ticked checkbox in a group into one text
function getCheckedValues(groupName) {
  let boxes = document.getElementsByName(groupName);
  let chosen = [];
  for (let i = 0; i < boxes.length; i++) {
    if (boxes[i].checked) {
      chosen.push(boxes[i].value);
    }
  }
  return chosen.join(", ");
}


/* 5. SEARCH HELPER
   true when "text" contains "keyword", ignoring upper/lower case.
   Uses the string methods toLowerCase() and indexOf() from Lecture 03. */
function containsText(text, keyword) {
  return String(text).toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
}


/* 6. ARRAY HELPERS */

// Finds the position (index) of the object whose id matches, or -1
function findIndexById(list, id) {
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      return i;
    }
  }
  return -1;
}

// Returns a NEW array without the element at "index".
// slice() copies part of an array and concat() joins two arrays (Lecture 05).
function removeAt(list, index) {
  return list.slice(0, index).concat(list.slice(index + 1));
}

// Makes the next id, e.g. nextId("LST", cars) gives "LST-7721".
// It looks for the biggest number already used and adds 1.
function nextId(prefix, list) {
  let biggest = 0;
  let digits = 4;
  for (let i = 0; i < list.length; i++) {
    let numberText = list[i].id.slice(prefix.length + 1);   // "LST-7701" -> "7701"
    digits = numberText.length;
    if (Number(numberText) > biggest) {
      biggest = Number(numberText);
    }
  }

  // Add zeros at the front until the number has enough digits: 8 -> "0008"
  let newNumber = String(biggest + 1);
  while (newNumber.length < digits) {
    newNumber = "0" + newNumber;
  }
  return prefix + "-" + newNumber;
}


/* 7. DATE HELPERS
   Dates are kept as text "YYYY-MM-DD", like <input type="date"> gives. */

// Today's date as "YYYY-MM-DD"
function todayString() {
  let now = new Date();
  let month = now.getMonth() + 1;          // months count from 0
  let day = now.getDate();
  if (month < 10) { month = "0" + month; }
  if (day < 10) { day = "0" + day; }
  return now.getFullYear() + "-" + month + "-" + day;
}

// Adds "days" to a date text and returns the new date text
function addDays(dateText, days) {
  let date = new Date(dateText + "T00:00");   // T00:00 = midnight, local time
  date.setDate(date.getDate() + days);
  let month = date.getMonth() + 1;
  let day = date.getDate();
  if (month < 10) { month = "0" + month; }
  if (day < 10) { day = "0" + day; }
  return date.getFullYear() + "-" + month + "-" + day;
}

// Number of days from firstDate to secondDate (negative if secondDate is earlier)
function daysBetween(firstDate, secondDate) {
  let oneDay = 1000 * 60 * 60 * 24;          // milliseconds in one day
  let difference = new Date(secondDate + "T00:00") - new Date(firstDate + "T00:00");
  return Math.round(difference / oneDay);
}

// The current date and time as "YYYY-MM-DD HH:MM" (for the audit log)
function nowString() {
  let now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  if (hours < 10) { hours = "0" + hours; }
  if (minutes < 10) { minutes = "0" + minutes; }
  return todayString() + " " + hours + ":" + minutes;
}

// Turns "2026-10-28" into "28 October 2026"
function longDate(dateText) {
  let monthNames = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];
  let parts = dateText.split("-");
  let monthNumber = Number(parts[1]) - 1;
  return parts[2] + " " + monthNames[monthNumber] + " " + parts[0];
}


/* 8. MONEY HELPER
   Writes 2800000 as "28,00,000" using the Bangladeshi grouping:
   the last three digits, then two digits at a time. */
function money(amount) {
  let text = String(Math.round(amount));
  if (text.length <= 3) {
    return text;
  }

  let lastThree = text.slice(text.length - 3);
  let rest = text.slice(0, text.length - 3);
  let grouped = "";

  while (rest.length > 2) {
    grouped = "," + rest.slice(rest.length - 2) + grouped;
    rest = rest.slice(0, rest.length - 2);
  }
  return rest + grouped + "," + lastThree;
}


/* 9. SEARCH THE PUBLIC CAR CATALOGUE (read only)
   Used by index.html. The page has the ids catalogSearch, catalogBrand,
   catalogMaxPrice, catalogCount and catalogBody. */
function renderCatalog() {
  let keyword = document.getElementById("catalogSearch").value;
  let brand = document.getElementById("catalogBrand").value;
  let maxPrice = document.getElementById("catalogMaxPrice").value;

  let rows = "";
  let shown = 0;

  for (const car of cars) {
    // Cars waiting for moderation or rejected never appear in public
    if (car.status !== "Live") {
      continue;
    }

    let matchesKeyword = containsText(car.name, keyword) || containsText(car.brand, keyword) ||
                         containsText(car.id, keyword) || containsText(car.vendorName, keyword);
    let matchesBrand = (brand === "All" || car.brand === brand);
    let matchesPrice = (isEmpty(maxPrice) || car.price <= Number(maxPrice));

    if (matchesKeyword && matchesBrand && matchesPrice) {
      rows += "<tr>" +
                "<td>" + car.id + "</td>" +
                "<td><strong>" + car.name + "</strong></td>" +
                "<td>" + car.brand + "</td>" +
                "<td>" + car.year + "</td>" +
                "<td>" + money(car.price) + "</td>" +
                "<td>" + car.fuel + "</td>" +
                "<td>" + money(car.mileage) + " km</td>" +
                "<td><span class='badge plum'>" + car.condition + "</span></td>" +
                "<td>" + car.vendorName + "</td>" +
              "</tr>";
      shown++;
    }
  }

  if (shown === 0) {
    rows = "<tr><td colspan='9' class='empty-row'>No cars match your search.</td></tr>";
  }

  document.getElementById("catalogBody").innerHTML = rows;
  document.getElementById("catalogCount").innerHTML = shown + " car(s) found";
}


/* 10. BAR CHART
   Draws simple horizontal bars. names[i] is the label of the bar with
   the value counts[i]. Each bar's width is set as a percentage with an
   inline style, exactly as element.style.width would do. */
function drawBarChart(chartId, names, counts, total) {
  let html = "";

  for (let i = 0; i < names.length; i++) {
    let percent = 0;
    if (total > 0) {
      percent = Math.round(counts[i] / total * 100);
    }
    html += "<div class='bar-row'>" +
              "<div class='bar-label'>" + names[i] + "</div>" +
              "<div class='bar-track'><div class='bar-fill' style='width:" + percent + "%'></div></div>" +
              "<div class='bar-value'>" + counts[i] + "</div>" +
            "</div>";
  }

  document.getElementById(chartId).innerHTML = html;
}
