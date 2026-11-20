/* data.js  -  Sample data for the whole system
   Every list is an ARRAY OF OBJECTS (Lecture 05: "Arrays of objects").
   Each object groups related values as  name: value  pairs.

   IMPORTANT (frontend only):
   This data lives in the browser's memory. When you reload a page or
   move to another page, it starts again from these values.
   When the backend (PHP + MySQL) is built later, these arrays will be
   replaced by data that comes from the database. */


/* Users of the platform (Login, Register and Admin)
   status: "Active"      = can log in
           "Pending"     = registered, waiting for an admin to approve
           "Suspended"   = temporarily stopped by an admin
           "Deactivated" = switched off by an admin */
let users = [
  { id: "ADM-001", name: "Md. Murad Hasan", username: "admin", password: "admin1234",
    email: "murad.hasan@drivehub.com.bd", phone: "01700000000", city: "Dhaka",
    role: "Admin", status: "Active", registered: "2023-01-01" },

  { id: "EMP-104", name: "Shafayat Jamil", username: "employee", password: "employee123",
    email: "shafayat.jamil@drivehub.com.bd", phone: "01766554433", city: "Dhaka",
    role: "Employee", status: "Active", registered: "2024-01-11",
    department: "Customer Operations", shift: "Morning" },
  { id: "EMP-118", name: "Tahmina Akter", username: "tahmina", password: "tahmina123",
    email: "tahmina.akter@drivehub.com.bd", phone: "01766551200", city: "Chattogram",
    role: "Employee", status: "Pending", registered: "2026-10-18",
    department: "Listing Moderation", shift: "Evening" },

  { id: "VEN-2041", name: "Rahim Motors", username: "vendor", password: "vendor1234",
    email: "info@rahimmotors.com.bd", phone: "01711111111", city: "Dhaka",
    role: "Vendor", status: "Active", registered: "2019-02-08",
    tradeLicence: "TRAD-DH-2019-41200", showroom: "House 14, Road 7, Tejgaon Industrial Area, Dhaka 1208" },
  { id: "VEN-2055", name: "Karim Auto House", username: "karim", password: "karim1234",
    email: "sales@karimauto.com.bd", phone: "01811222333", city: "Chattogram",
    role: "Vendor", status: "Active", registered: "2021-05-19",
    tradeLicence: "TRAD-CTG-2021-55180", showroom: "Plot 9, GEC Circle, Chattogram 4000" },
  { id: "VEN-2088", name: "Dhaka Motors Ltd", username: "dhakamotors", password: "dhaka1234",
    email: "contact@dhakamotors.com.bd", phone: "01911888999", city: "Dhaka",
    role: "Vendor", status: "Active", registered: "2018-03-27",
    tradeLicence: "TRAD-DH-2018-88040", showroom: "Bijoy Sarani, Tejgaon, Dhaka 1215" },
  { id: "VEN-2065", name: "Fast Track Autos", username: "fasttrack", password: "fast1234",
    email: "contact@fasttrack.com.bd", phone: "01611445566", city: "Chattogram",
    role: "Vendor", status: "Deactivated", registered: "2021-11-22",
    tradeLicence: "TRAD-CTG-2021-65900", showroom: "Agrabad Commercial Area, Chattogram 4100" },

  { id: "CUS-10234", name: "Mohammed S Hossain", username: "customer", password: "customer123",
    email: "customer@drivehub.com.bd", phone: "01755123456", city: "Dhaka",
    role: "Customer", status: "Active", registered: "2025-03-14" },
  { id: "CUS-10891", name: "Nusrat Jahan", username: "nusrat", password: "nusrat1234",
    email: "nusrat.j@example.com", phone: "01733445566", city: "Dhaka",
    role: "Customer", status: "Active", registered: "2025-07-02" },
  { id: "CUS-11002", name: "Sadia Islam", username: "sadia", password: "sadia1234",
    email: "sadia.islam@example.com", phone: "01788990011", city: "Chattogram",
    role: "Customer", status: "Active", registered: "2025-11-09" },
  { id: "USR-4412", name: "Jamal Uddin", username: "jamal", password: "jamal1234",
    email: "jamal.u@example.com", phone: "01644778899", city: "Khulna",
    role: "Customer", status: "Suspended", registered: "2026-09-23" }
];


/* Approved vendors shown on the public home page */
let vendors = [
  { id: "VEN-2041", name: "Rahim Motors",     city: "Dhaka",      listings: 24, sold: 112, since: 2019, rating: "Excellent" },
  { id: "VEN-2055", name: "Karim Auto House", city: "Chattogram", listings: 17, sold: 68,  since: 2021, rating: "Very Good" },
  { id: "VEN-2088", name: "Dhaka Motors Ltd", city: "Dhaka",      listings: 31, sold: 204, since: 2018, rating: "Excellent" },
  { id: "VEN-2104", name: "Sylhet Car Zone",  city: "Sylhet",     listings: 12, sold: 39,  since: 2023, rating: "Good" }
];


/* Car listings (home page, vendor and employee pages)
   status: "Live", "Waiting", "Rejected" or "Sold"
   listedOn and expiresOn are written as "YYYY-MM-DD", the format an
   <input type="date"> gives. */
let cars = [
  { id: "LST-7701", name: "Toyota Corolla 2023", brand: "Toyota", year: 2023, price: 2800000,
    fuel: "Petrol", mileage: 15000, engine: 1500, transmission: "Automatic", seats: 5,
    condition: "Used", features: "AC, GPS, Reverse Camera",
    vendorId: "VEN-2041", vendorName: "Rahim Motors", city: "Dhaka",
    views: 842, inquiries: 9, status: "Live", listedOn: "2026-10-12", duration: 60, expiresOn: "2026-12-11",
    photo: "image/car1.png",
    description: "Well maintained sedan with low mileage. Single owner, full service history." },

  { id: "LST-7705", name: "Honda Civic 2022", brand: "Honda", year: 2022, price: 3200000,
    fuel: "Octane", mileage: 22000, engine: 1800, transmission: "Automatic", seats: 5,
    condition: "Used", features: "AC, GPS, Sunroof, Leather Seats",
    vendorId: "VEN-2055", vendorName: "Karim Auto House", city: "Chattogram",
    views: 729, inquiries: 8, status: "Live", listedOn: "2026-09-20", duration: 90, expiresOn: "2026-12-19",
    photo: "image/car2.png",
    description: "Turbo petrol sedan in showroom condition. Imported and registered in 2022." },

  { id: "LST-7709", name: "Nissan X-Trail 2021", brand: "Nissan", year: 2021, price: 4150000,
    fuel: "Hybrid", mileage: 38000, engine: 2000, transmission: "Automatic", seats: 7,
    condition: "Reconditioned", features: "AC, GPS, Alloy Wheels",
    vendorId: "VEN-2088", vendorName: "Dhaka Motors Ltd", city: "Dhaka",
    views: 655, inquiries: 7, status: "Live", listedOn: "2026-10-01", duration: 90, expiresOn: "2026-12-30",
    photo: "image/car3.png",
    description: "Seven seater family SUV. Reconditioned from Japan with a full auction sheet." },

  { id: "LST-7688", name: "Mitsubishi Pajero 2020", brand: "Mitsubishi", year: 2020, price: 5500000,
    fuel: "Diesel", mileage: 52000, engine: 2400, transmission: "Automatic", seats: 7,
    condition: "Used", features: "AC, GPS, Sunroof, Alloy Wheels",
    vendorId: "VEN-2041", vendorName: "Rahim Motors", city: "Dhaka",
    views: 611, inquiries: 6, status: "Live", listedOn: "2026-09-29", duration: 60, expiresOn: "2026-11-28",
    photo: "image/car4.png",
    description: "Full size diesel SUV, highway driven, papers updated to 2027." },

  { id: "LST-7714", name: "Toyota Axio 2019", brand: "Toyota", year: 2019, price: 2100000,
    fuel: "Hybrid", mileage: 61000, engine: 1500, transmission: "Automatic", seats: 5,
    condition: "Used", features: "AC, Alloy Wheels",
    vendorId: "VEN-2055", vendorName: "Karim Auto House", city: "Chattogram",
    views: 488, inquiries: 5, status: "Live", listedOn: "2026-10-05", duration: 60, expiresOn: "2026-12-04",
    photo: "image/car5.png",
    description: "Economical hybrid sedan, ideal for daily city driving." },

  { id: "LST-7716", name: "BMW 320i 2018", brand: "BMW", year: 2018, price: 6800000,
    fuel: "Octane", mileage: 44000, engine: 2000, transmission: "Automatic", seats: 5,
    condition: "Used", features: "AC, GPS, Sunroof, Leather Seats",
    vendorId: "VEN-2088", vendorName: "Dhaka Motors Ltd", city: "Dhaka",
    views: 902, inquiries: 11, status: "Live", listedOn: "2026-09-15", duration: 90, expiresOn: "2026-12-14",
    photo: "image/car6.png",
    description: "Executive saloon with service record from the authorised dealer." },

  { id: "LST-7654", name: "Toyota Premio 2021", brand: "Toyota", year: 2021, price: 3450000,
    fuel: "Petrol", mileage: 29000, engine: 1800, transmission: "Automatic", seats: 5,
    condition: "Used", features: "AC, GPS",
    vendorId: "VEN-2041", vendorName: "Rahim Motors", city: "Dhaka",
    views: 503, inquiries: 4, status: "Live", listedOn: "2026-08-02", duration: 90, expiresOn: "2026-10-31",
    photo: "image/car7.png",
    description: "Comfortable executive sedan kept in a covered garage." },

  { id: "LST-7640", name: "Toyota Noah 2020", brand: "Toyota", year: 2020, price: 3800000,
    fuel: "Hybrid", mileage: 47000, engine: 2000, transmission: "Automatic", seats: 8,
    condition: "Reconditioned", features: "AC, GPS, Alloy Wheels",
    vendorId: "VEN-2041", vendorName: "Rahim Motors", city: "Dhaka",
    views: 0, inquiries: 0, status: "Waiting", listedOn: "2026-10-25", duration: 60, expiresOn: "2026-12-24",
    photo: "image/car8.png",
    description: "Eight seater microbus, fresh import, three photos uploaded." },

  { id: "LST-7612", name: "Nissan Sunny 2018", brand: "Nissan", year: 2018, price: 1950000,
    fuel: "Petrol", mileage: 72000, engine: 1500, transmission: "Manual", seats: 5,
    condition: "Used", features: "AC",
    vendorId: "VEN-2041", vendorName: "Rahim Motors", city: "Dhaka",
    views: 0, inquiries: 0, status: "Rejected", listedOn: "2026-10-20", duration: 60, expiresOn: "2026-12-19",
    photo: "image/car5.png",
    description: "Budget saloon. Listing rejected because the photos were unclear." },

  { id: "LST-7588", name: "Toyota Allion 2019", brand: "Toyota", year: 2019, price: 2600000,
    fuel: "Petrol", mileage: 55000, engine: 1500, transmission: "Automatic", seats: 5,
    condition: "Used", features: "AC, GPS",
    vendorId: "VEN-2041", vendorName: "Rahim Motors", city: "Dhaka",
    views: 1104, inquiries: 14, status: "Sold", listedOn: "2026-07-18", duration: 90, expiresOn: "2026-10-16",
    photo: "image/car7.png",
    description: "Sold in October 2026 to a customer in Dhaka." },

  { id: "LST-7520", name: "Honda Vezel 2019", brand: "Honda", year: 2019, price: 2950000,
    fuel: "Hybrid", mileage: 41000, engine: 1500, transmission: "Automatic", seats: 5,
    condition: "Used", features: "AC, GPS, Sunroof",
    vendorId: "VEN-2041", vendorName: "Rahim Motors", city: "Dhaka",
    views: 377, inquiries: 3, status: "Live", listedOn: "2026-07-14", duration: 90, expiresOn: "2026-10-12",
    photo: "image/car3.png",
    description: "Compact hybrid SUV. The listing has expired and needs renewal." },

  { id: "LST-7712", name: "Honda Fit 2019", brand: "Honda", year: 2019, price: 1850000,
    fuel: "Hybrid", mileage: 58000, engine: 1300, transmission: "Automatic", seats: 5,
    condition: "Used", features: "AC",
    vendorId: "VEN-2055", vendorName: "Karim Auto House", city: "Chattogram",
    views: 142, inquiries: 2, status: "Live", listedOn: "2026-10-26", duration: 60, expiresOn: "2026-12-25",
    photo: "image/car2.png",
    description: "Small hybrid hatchback with very low running cost." },

  { id: "LST-7718", name: "Audi A4 2017", brand: "BMW", year: 2017, price: 6200000,
    fuel: "Octane", mileage: 63000, engine: 2000, transmission: "Automatic", seats: 5,
    condition: "Used", features: "AC, GPS, Leather Seats",
    vendorId: "VEN-2088", vendorName: "Dhaka Motors Ltd", city: "Dhaka",
    views: 0, inquiries: 0, status: "Waiting", listedOn: "2026-10-27", duration: 90, expiresOn: "2027-01-25",
    photo: "image/car6.png",
    description: "European saloon. Waiting for moderation, insurance paper missing." },

  { id: "LST-7720", name: "Toyota Hiace 2021", brand: "Toyota", year: 2021, price: 4800000,
    fuel: "Diesel", mileage: 35000, engine: 2800, transmission: "Manual", seats: 12,
    condition: "Reconditioned", features: "AC",
    vendorId: "VEN-2104", vendorName: "Sylhet Car Zone", city: "Sylhet",
    views: 0, inquiries: 0, status: "Waiting", listedOn: "2026-10-27", duration: 60, expiresOn: "2026-12-26",
    photo: "image/car8.png",
    description: "Twelve seater microbus for tour operators. One photo uploaded." }
];


/* Customer inquiries sent to vendors
   status: "Pending", "Answered" or "Closed" */
let inquiries = [
  { id: "INQ-5521", customerId: "CUS-10234", customerName: "Mohammed S Hossain",
    carId: "LST-7701", carName: "Toyota Corolla 2023", vendorName: "Rahim Motors",
    topic: "Price Negotiation", replyMethod: "Email", message: "What is the best price you can offer?",
    date: "2026-10-26", status: "Answered", reply: "Best price is BDT 27,50,000", vendorReplied: true },

  { id: "INQ-5498", customerId: "CUS-10234", customerName: "Mohammed S Hossain",
    carId: "LST-7705", carName: "Honda Civic 2022", vendorName: "Karim Auto House",
    topic: "Car Condition and History", replyMethod: "Phone", message: "Has the car ever been in an accident?",
    date: "2026-10-23", status: "Pending", reply: "Waiting for the vendor", vendorReplied: false },

  { id: "INQ-5471", customerId: "CUS-10234", customerName: "Mohammed S Hossain",
    carId: "LST-7709", carName: "Nissan X-Trail 2021", vendorName: "Dhaka Motors Ltd",
    topic: "Bank Loan and EMI", replyMethod: "Email", message: "Which banks do you work with for car loans?",
    date: "2026-10-19", status: "Answered", reply: "City Bank loan at 9 percent", vendorReplied: true },

  { id: "INQ-5440", customerId: "CUS-10234", customerName: "Mohammed S Hossain",
    carId: "LST-7714", carName: "Toyota Axio 2019", vendorName: "Karim Auto House",
    topic: "Documents and Registration", replyMethod: "SMS", message: "Are all the papers up to date?",
    date: "2026-10-15", status: "Closed", reply: "All papers clear", vendorReplied: true },

  { id: "INQ-5402", customerId: "CUS-10234", customerName: "Mohammed S Hossain",
    carId: "LST-7716", carName: "BMW 320i 2018", vendorName: "Dhaka Motors Ltd",
    topic: "Delivery and Handover", replyMethod: "Email", message: "Do you deliver inside Dhaka?",
    date: "2026-10-11", status: "Closed", reply: "Free delivery inside Dhaka", vendorReplied: true },

  { id: "INQ-5519", customerId: "CUS-10891", customerName: "Nusrat Jahan",
    carId: "LST-7688", carName: "Mitsubishi Pajero 2020", vendorName: "Rahim Motors",
    topic: "Car Condition and History", replyMethod: "Phone", message: "Is the engine original?",
    date: "2026-10-26", status: "Pending", reply: "", vendorReplied: false },

  { id: "INQ-5510", customerId: "CUS-11002", customerName: "Arif Hossain",
    carId: "LST-7654", carName: "Toyota Premio 2021", vendorName: "Rahim Motors",
    topic: "Bank Loan and EMI", replyMethod: "Email", message: "Can I get a five year loan?",
    date: "2026-10-25", status: "Pending", reply: "", vendorReplied: false },

  { id: "INQ-5495", customerId: "CUS-11002", customerName: "Tanvir Ahmed",
    carId: "LST-7520", carName: "Honda Vezel 2019", vendorName: "Rahim Motors",
    topic: "Documents and Registration", replyMethod: "SMS", message: "Is the tax token valid?",
    date: "2026-10-24", status: "Pending", reply: "", vendorReplied: false },

  { id: "INQ-5505", customerId: "CUS-11002", customerName: "Sadia Islam",
    carId: "LST-7705", carName: "Honda Civic 2022", vendorName: "Karim Auto House",
    topic: "Delivery and Handover", replyMethod: "Email", message: "How long does handover take?",
    date: "2026-10-25", status: "Answered", reply: "Handover takes three working days", vendorReplied: true }
];


/* Moderation records written by employees
   decision: "Approved", "Rejected" or "Changes Requested" */
let moderationRecords = [
  { id: "MOD-4412", listingId: "LST-7701", carName: "Toyota Corolla 2023", vendorId: "VEN-2041",
    vendorName: "Rahim Motors", decision: "Approved", reason: "All checks passed",
    note: "Photos, price and papers all in order.", date: "2026-10-12", employee: "Shafayat Jamil" },

  { id: "MOD-4428", listingId: "LST-7612", carName: "Nissan Sunny 2018", vendorId: "VEN-2041",
    vendorName: "Rahim Motors", decision: "Rejected", reason: "Photos unclear or missing",
    note: "Please upload clear daylight photos of all four sides.", date: "2026-10-22", employee: "Shafayat Jamil" },

  { id: "MOD-4390", listingId: "LST-7688", carName: "Mitsubishi Pajero 2020", vendorId: "VEN-2041",
    vendorName: "Rahim Motors", decision: "Approved", reason: "All checks passed",
    note: "Auction sheet attached and verified.", date: "2026-09-29", employee: "Shafayat Jamil" },

  { id: "MOD-4405", listingId: "LST-7714", carName: "Toyota Axio 2019", vendorId: "VEN-2055",
    vendorName: "Karim Auto House", decision: "Changes Requested", reason: "Description does not match the car",
    note: "Mileage did not match the odometer photo.", date: "2026-10-18", employee: "Shafayat Jamil" },

  { id: "MOD-4435", listingId: "LST-7712", carName: "Honda Fit 2019", vendorId: "VEN-2055",
    vendorName: "Karim Auto House", decision: "Approved", reason: "All checks passed",
    note: "Clean listing, published straight away.", date: "2026-10-28", employee: "Shafayat Jamil" }
];


/* Test drive requests
   status: "Pending", "Approved", "In Progress", "Completed" or "Rejected" */
let testDrives = [
  { id: "TD-2205", customerName: "Sadia Islam",         carName: "Honda Civic 2022",        vendorName: "Karim Auto House", date: "2026-10-28", slot: "10:00 AM", licence: true,  status: "Completed" },
  { id: "TD-2208", customerName: "Tanvir Ahmed",        carName: "Nissan X-Trail 2021",     vendorName: "Dhaka Motors Ltd", date: "2026-10-28", slot: "12:00 PM", licence: true,  status: "In Progress" },
  { id: "TD-2211", customerName: "Mohammed S Hossain",  carName: "Toyota Corolla 2023",     vendorName: "Rahim Motors",     date: "2026-10-30", slot: "11:00 AM", licence: true,  status: "Approved" },
  { id: "TD-2190", customerName: "Nusrat Jahan",        carName: "Toyota Premio 2021",      vendorName: "Rahim Motors",     date: "2026-10-31", slot: "10:00 AM", licence: true,  status: "Approved" },
  { id: "TD-2198", customerName: "Mohammed S Hossain",  carName: "Mitsubishi Pajero 2020",  vendorName: "Rahim Motors",     date: "2026-11-01", slot: "3:00 PM",  licence: true,  status: "Pending" },
  { id: "TD-2214", customerName: "Sadia Islam",         carName: "Honda Vezel 2019",        vendorName: "Rahim Motors",     date: "2026-10-29", slot: "12:00 PM", licence: true,  status: "Pending" },
  { id: "TD-2217", customerName: "Rafiq Mia",           carName: "Nissan Sunny 2018",       vendorName: "Rahim Motors",     date: "2026-10-30", slot: "5:00 PM",  licence: false, status: "Pending" },
  { id: "TD-2180", customerName: "Imran Khan",          carName: "Honda Vezel 2019",        vendorName: "Rahim Motors",     date: "2026-10-26", slot: "10:00 AM", licence: true,  status: "Completed" },
  { id: "TD-2186", customerName: "Rina Begum",          carName: "Toyota Noah 2020",        vendorName: "Rahim Motors",     date: "2026-10-26", slot: "3:00 PM",  licence: true,  status: "Completed" },
  { id: "TD-2192", customerName: "Faisal Ahmed",        carName: "Toyota Axio 2019",        vendorName: "Karim Auto House", date: "2026-10-27", slot: "11:00 AM", licence: true,  status: "Completed" },
  { id: "TD-2201", customerName: "Shamim Reza",         carName: "Toyota Allion 2019",      vendorName: "Rahim Motors",     date: "2026-10-27", slot: "5:00 PM",  licence: true,  status: "Completed" },
  { id: "TD-2220", customerName: "Hasan Mahmud",        carName: "BMW 320i 2018",           vendorName: "Dhaka Motors Ltd", date: "2026-11-01", slot: "11:00 AM", licence: true,  status: "Approved" }
];


/* Orders and invoices (customer page) */
let invoices = [
  { id: "INV-2026-00417", orderId: "ORD-2026-00392", customerId: "CUS-10234",
    customerName: "Mohammed S Hossain", address: "Flat 4B, House 21, Dhanmondi 27, Dhaka 1209",
    carName: "Toyota Corolla 2023", chassis: "NZE161-7654321",
    vendorName: "Rahim Motors", vendorId: "VEN-2041",
    carPrice: 2800000, registration: 45000, insurance: 38000, serviceCharge: 15000,
    vatPercent: 5, discount: 42900, total: 3000000,
    date: "2026-10-28", payment: "Paid" }
];


/* Renewal payments made by vendors */
let renewals = [
  { id: "REN-3312", listingId: "LST-7701", carName: "Toyota Corolla 2023", period: 60, date: "2026-10-12", amount: 900,  method: "bKash" },
  { id: "REN-3290", listingId: "LST-7688", carName: "Mitsubishi Pajero 2020", period: 60, date: "2026-09-29", amount: 1700, method: "Card" },
  { id: "REN-3254", listingId: "LST-7654", carName: "Toyota Premio 2021", period: 90, date: "2026-08-02", amount: 1200, method: "Nagad" }
];


/* Monthly sales figures (vendor and admin charts) */
let monthlySales = [
  { month: "June",      vendorSold: 8, vendorRevenue: 23600000, platformSold: 45, platformRevenue: 134000000 },
  { month: "July",      vendorSold: 3, vendorRevenue: 8800000,  platformSold: 22, platformRevenue: 64400000 },
  { month: "August",    vendorSold: 6, vendorRevenue: 17900000, platformSold: 39, platformRevenue: 115800000 },
  { month: "September", vendorSold: 5, vendorRevenue: 15200000, platformSold: 33, platformRevenue: 97100000 },
  { month: "October",   vendorSold: 7, vendorRevenue: 21400000, platformSold: 47, platformRevenue: 140200000 }
];


/* Bank car-loan rates (customer EMI calculator) */
let banks = [
  { name: "City Bank",    rate: 9.00, minDown: 30, maxYears: 7 },
  { name: "BRAC Bank",    rate: 9.50, minDown: 25, maxYears: 6 },
  { name: "Eastern Bank", rate: 9.25, minDown: 30, maxYears: 7 }
];


/* Platform rules used by several pages
   A single object: its properties are read with dot notation,
   for example platformRules.commissionPercent */
let platformRules = {
  commissionPercent: 1,     // DriveHub keeps 1 percent of every sale
  vatPercent: 5,            // VAT added to an invoice
  maxDepreciation: 60,      // the valuation estimator never goes past this
  renewal30: 500,           // renewal prices in Taka
  renewal60: 900,
  renewal90: 1200,
  featuredFee: 800,
  topOfSearchFee: 600
};


/* Audit log (admin page) */
let auditLog = [
  { id: "LOG-99412", time: "2026-10-28 09:14", userId: "ADM-001",  name: "Md. Murad Hasan",     role: "Admin",    action: "Login",              detail: "Successful admin login",                          severity: "Normal" },
  { id: "LOG-99408", time: "2026-10-28 08:51", userId: "EMP-104",  name: "Shafayat Jamil",      role: "Employee", action: "Listing Approved",   detail: "Approved listing LST-7712 Honda Fit 2019",        severity: "Normal" },
  { id: "LOG-99401", time: "2026-10-28 08:33", userId: "VEN-2041", name: "Rahim Motors",        role: "Vendor",   action: "Listing Created",    detail: "Submitted LST-7640 Toyota Noah 2020",             severity: "Normal" },
  { id: "LOG-99388", time: "2026-10-27 22:07", userId: "USR-4412", name: "Jamal Uddin",         role: "Customer", action: "Failed Login",       detail: "Five failed attempts, account locked",            severity: "Critical" },
  { id: "LOG-99375", time: "2026-10-27 19:44", userId: "CUS-10234", name: "Mohammed S Hossain", role: "Customer", action: "Order Placed",       detail: "Placed ORD-2026-00392 for Toyota Corolla 2023",   severity: "Normal" },
  { id: "LOG-99360", time: "2026-10-27 16:12", userId: "VEN-2088", name: "Dhaka Motors Ltd",    role: "Vendor",   action: "Price Changed",      detail: "Changed LST-7718 price to 62,00,000",             severity: "Normal" },
  { id: "LOG-99322", time: "2026-10-26 11:03", userId: "ADM-001",  name: "Md. Murad Hasan",     role: "Admin",    action: "Account Deactivated", detail: "Deactivated vendor VEN-2065",                    severity: "Critical" },
  { id: "LOG-99288", time: "2026-10-25 17:52", userId: "ADM-001",  name: "Md. Murad Hasan",     role: "Admin",    action: "Data Exported",      detail: "Exported the full user list to CSV",              severity: "Critical" }
];


/* Export history (admin page) */
let exportHistory = [
  { id: "EXP-0912", dataSet: "Orders and Sales",  records: 341,  date: "2026-10-26", reason: "Monthly accounting reconciliation" },
  { id: "EXP-0908", dataSet: "Customer Accounts", records: 8420, date: "2026-10-25", reason: "Quarterly backup" },
  { id: "EXP-0901", dataSet: "Car Listings",      records: 1198, date: "2026-10-20", reason: "Inventory audit" }
];
