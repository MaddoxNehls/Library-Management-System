# README

## Project Name
**Library Management System**

## Overview
This project implements a web-based interface for the Riverside City Library to manage books, copies, authors, genres, patrons, and loans. It allows staff to add, view, edit, and delete records for each entity, including handling many-to-many relationships (Books ↔ Authors, Books ↔ Genres) via intersection tables. The application uses a MySQL database, Node.js/Express on the server side, and vanilla HTML/CSS/JavaScript on the client side.

## Usage Instructions
### Database Setup
1. Import `DDL.sql` into your MySQL or MariaDB instance to create all tables.
2. Import `DML.sql` (if separate) or run the included `INSERT` statements to populate sample data.

### Server
1. Add and Edit `.env` with your own database credentials.
```
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_DATABASE=
DB_CONNECTION_LIMIT=
PORT=
```
2. Run `npm install` (or the appropriate package manager commands) to install dependencies.
3. Start the server using:
   ```sh
   node server.js
   ```
   or
   ```sh
   npm run start
   ```

### Client
1. Access the site from a browser at the URL/port where your server is running.
2. Use the navigation links to browse, add, edit, or delete records for each table.

## Code Structure
- **`server.js` (or `app.js`)**: Main entry point for the Node/Express server.
- **`db.js`**: Database connection pool, adapted from CS 340 starter code.
- **`routes/`**: Contains routers for Books, Authors, Copies, Genres, Loans, and Patrons, each referencing the Express.js Routing Guide.
- **`frontend/`**: Contains all HTML, CSS, and client-side JS files for the front end (e.g., `inventory_books.html`, `patrons_add.html`, etc.).

## Citations & Credits
### 1) CS 340 Starter Code
- **File**: `db.js`
- **Date**: 02/24/2025
- **Based On**: CS340 Starter Code
- **Notes**: Adapted the `createPool` outline and general connection logic for MySQL. Credentials were sanitized and default settings adjusted to fit project needs.

### 2) Express.js Routing Guide
- **Files**: `authors.js`, `books.js`, `copies.js`, `genres.js`, `loans.js`, `patrons.js` (server-side routing files)
- **Date**: 02/27/2025
- **URL**: Express.js Routing
- **Notes**: Used official Express documentation for route definitions (`app.get`, `app.post`, etc.) and parameter handling. Query logic (`SELECT`, `INSERT`) was implemented independently.

### 3) Fetch API Documentation
- **Files**:
  - `inventory_books.html`
  - `inventory_books_add.html`
  - `inventory_books_delete.html`
  - `inventory_books_edit.html`
  - `loans_edit.html`
- **Date**: 02/26/2025
- **URL**: [MDN Web Docs: Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- **Notes**: Consulted for implementing HTTP requests, handling JSON responses, and dynamically updating the DOM. Request logic (body data formation, error handling) was implemented independently.

## Notable Additions
- **Update M:N**: Custom logic was implemented to add or remove relationships without deleting base records in `Books`, `Authors`, or `Genres`.
- **Nullable Relationship**: Implemented `ON DELETE SET NULL` in `Loans` for `patronID` and `copyID` foreign keys to preserve loan history after a `Patron` or `Copy` is removed. UI and server logic to allow a `Patron` or `Copy` to be set to `NULL` were developed uniquely.

## License 
This project is primarily for academic demonstration under CS 340 at Oregon State University. No commercial or production use intended.

