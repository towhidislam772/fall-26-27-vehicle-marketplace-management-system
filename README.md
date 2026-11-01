# Vehicle Marketplace Management System

**Course:** CSC 3215 Web Technologies
**Semester:** Fall 2026-27
**University:** American International University-Bangladesh

A multi vendor vehicle marketplace where verified vendors list cars and customers
browse, compare, book test drives and buy. Front end only, written in plain HTML.

## Project Structure

```
vehicle-marketplace-management-system/
├── index.html        Home page, catalogue and search
├── login.html        Login for all four users, plus password reset
├── register.html     Signup for customer, vendor and employee
├── customer.html     Customer dashboard
├── vendor.html       Vendor dashboard
├── employee.html     Employee dashboard
├── admin.html        Admin dashboard
├── image/            Photos, logos and icons
└── README.md
```

## The Four Users

| User | Manages (full CRUD) | Unique Feature 1 | Unique Feature 2 | Unique Feature 3 |
|---|---|---|---|---|
| Customer | Inquiries | Car comparison tool | EMI calculator | Invoices |
| Vendor | Car listings | Valuation estimator | Sales chart and visitor counter | Listing expiry and renewal |
| Employee | Moderation records | Test drive calendar | Printable daily report | Inquiry and test drive handling |
| Admin | User accounts | Activity audit log | Platform analytics | CSV data export |

No unique feature is shared between two users.

## Dashboard Layout

Every dashboard is a single HTML file holding five sections:

1. **Overview** — summary figures and the profile update form
2. **CRUD section** — create, read, update, delete and search on that user's own records
3. **Unique feature 1**
4. **Unique feature 2**
5. **Unique feature 3**

A navigation bar at the top of each dashboard links to every section.

## Current Phase

This submission is the **HTML phase**. The project uses plain HTML only:

- No CSS
- No JavaScript
- No framework or external library
- All data is written directly into the HTML

Styling is added in the CSS phase. Section switching, form validation and the
calculations for EMI and valuation are added in the JavaScript phase. Login,
sessions and the database come in the PHP phase.

## How to Run

Open `index.html` in any web browser. No server is required.

## Login Details for Testing

Open `login.html` and use the links at the bottom to reach each dashboard directly.

## Team

| Name | Student ID | Responsibility |
|---|---|---|
| | | Customer dashboard |
| | | Vendor dashboard |
| | | Employee dashboard |
| | | Admin dashboard |
