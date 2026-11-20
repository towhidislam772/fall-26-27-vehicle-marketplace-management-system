/* home.js  -  The home page (index.html)
   The home page needs two things: the public car catalogue search and
   the list of verified vendors. renderCatalog() lives in common.js
   because the search box has the same ids on every page that uses it. */


// Fills the vendor table from the vendors array
function renderVendors() {
  let rows = "";

  for (const vendor of vendors) {
    let ratingColour = "grey";
    switch (vendor.rating) {
      case "Excellent":
        ratingColour = "green";
        break;
      case "Very Good":
        ratingColour = "blue";
        break;
      default:
        ratingColour = "orange";
    }

    rows += "<tr>" +
              "<td>" + vendor.id + "</td>" +
              "<td><strong>" + vendor.name + "</strong></td>" +
              "<td>" + vendor.city + "</td>" +
              "<td>" + vendor.listings + "</td>" +
              "<td>" + vendor.sold + "</td>" +
              "<td>" + vendor.since + "</td>" +
              "<td><span class='badge " + ratingColour + "'>" + vendor.rating + "</span></td>" +
            "</tr>";
  }

  document.getElementById("vendorBody").innerHTML = rows;
}


// Counts the live listings and shows the number in the feature strip
function showLiveCount() {
  let live = 0;
  for (const car of cars) {
    if (car.status === "Live") {
      live++;
    }
  }
  document.getElementById("liveCount").innerHTML = live;
  document.getElementById("vendorCount").innerHTML = vendors.length;
}


/* START: runs once when the page has loaded */
renderCatalog();
renderVendors();
showLiveCount();
