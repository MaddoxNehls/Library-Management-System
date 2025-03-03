const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
require('./config/db');


// Import route modules
const booksRouter = require('./routes/books');
const copiesRouter = require('./routes/copies');
const authorsRouter = require('./routes/authors');
const genresRouter = require('./routes/genres');
const patronsRouter = require('./routes/patrons');
const loansRouter = require('./routes/loans');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Separated route files
app.use('/books', booksRouter);
app.use('/copies', copiesRouter);
app.use('/authors', authorsRouter);
app.use('/genres', genresRouter);
app.use('/patrons', patronsRouter);
app.use('/loans', loansRouter);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
