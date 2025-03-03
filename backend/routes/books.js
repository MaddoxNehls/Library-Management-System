/*
 * Citation: 
 * Date: 02/21/2025
 * Based on: https://expressjs.com/en/guide/routing.html
 * Title: Express.js Routing Guide
 * Author: Express.js Team
 * Notes: Used for reference in structuring routing logic
 */


const express = require('express');
const router = express.Router();
const { query } = require('../config/db');

// GET /books – Retrieve all books
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT Books.isbn, Books.title, 
             GROUP_CONCAT(DISTINCT CONCAT(Authors.firstName, ' ', Authors.lastName) SEPARATOR ', ') AS authors, 
             GROUP_CONCAT(DISTINCT Genres.genreName SEPARATOR ', ') AS genres, 
             Books.publicationYear, Books.edition, 
             COUNT(DISTINCT Copies.copyID) AS numberOfCopies
      FROM Books
        LEFT JOIN Copies ON Books.isbn = Copies.isbn
        LEFT JOIN BookAuthors ON Books.isbn = BookAuthors.isbn
        LEFT JOIN Authors ON BookAuthors.authorID = Authors.authorID
        LEFT JOIN BookGenres ON Books.isbn = BookGenres.isbn
        LEFT JOIN Genres ON BookGenres.genreID = Genres.genreID
      GROUP BY Books.isbn
      ORDER BY Books.isbn ASC;
    `;
    const results = await query(sql);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// NEW: GET /books/:isbn – Retrieve a single book by ISBN
router.get('/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const sql = `
      SELECT Books.isbn, Books.title, 
             GROUP_CONCAT(DISTINCT CONCAT(Authors.firstName, ' ', Authors.lastName) SEPARATOR ', ') AS authors, 
             GROUP_CONCAT(DISTINCT Genres.genreName SEPARATOR ', ') AS genres, 
             Books.publicationYear, Books.edition, 
             COUNT(DISTINCT Copies.copyID) AS numberOfCopies
      FROM Books
        LEFT JOIN Copies ON Books.isbn = Copies.isbn
        LEFT JOIN BookAuthors ON Books.isbn = BookAuthors.isbn
        LEFT JOIN Authors ON BookAuthors.authorID = Authors.authorID
        LEFT JOIN BookGenres ON Books.isbn = BookGenres.isbn
        LEFT JOIN Genres ON BookGenres.genreID = Genres.genreID
      WHERE Books.isbn = ?
      GROUP BY Books.isbn;
    `;
    const results = await query(sql, [isbn]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'Book not found.' });
    }
    res.json(results[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /books – Add a new book with relationships
router.post('/', async (req, res) => {
  try {
    // Expect req.body to contain:
    // { isbn, title, publicationYear, edition, authors: [author names], genres: [genre names] }
    const { isbn, title, publicationYear, edition, authors = [], genres = [] } = req.body;

    // Insert the new book record.
    const sqlInsertBook = `
      INSERT INTO Books (isbn, title, publicationYear, edition)
      VALUES (?, ?, ?, ?)
    `;
    await query(sqlInsertBook, [isbn, title, publicationYear, edition]);

    // Process authors array.
    // For each author, check that they exist. If not, return an error.
    if (Array.isArray(authors)) {
      for (const authorName of authors) {
        const results = await query(
          `SELECT authorID FROM Authors WHERE CONCAT(firstName, ' ', lastName) = ?`,
          [authorName]
        );
        if (results.length === 0) {
          return res.status(400).json({ error: `Author "${authorName}" does not exist.` });
        }
        const authorID = results[0].authorID;
        await query(
          `INSERT INTO BookAuthors (isbn, authorID) VALUES (?, ?)`,
          [isbn, authorID]
        );
      }
    }

    // Process genres array.
    // For each genre, check that it exists. If not, return an error.
    if (Array.isArray(genres)) {
      for (const genreName of genres) {
        const results = await query(
          `SELECT genreID FROM Genres WHERE genreName = ?`,
          [genreName]
        );
        if (results.length === 0) {
          return res.status(400).json({ error: `Genre "${genreName}" does not exist.` });
        }
        const genreID = results[0].genreID;
        await query(
          `INSERT INTO BookGenres (isbn, genreID) VALUES (?, ?)`,
          [isbn, genreID]
        );
      }
    }

    res.json({ message: 'Book created successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /books/:isbn – Update an existing book and its relationships
router.put('/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const { title, publicationYear, edition, authorsToAdd, authorsToDelete, genresToAdd, genresToDelete } = req.body;

    const sqlUpdateBook = `
      UPDATE Books
      SET title = ?, publicationYear = ?, edition = ?
      WHERE isbn = ?
    `;
    await query(sqlUpdateBook, [title, publicationYear, edition, isbn]);

    if (Array.isArray(authorsToAdd)) {
      for (const authorName of authorsToAdd) {
        const sqlFindAuthor = `
          SELECT authorID FROM Authors WHERE CONCAT(firstName, ' ', lastName) = ?
        `;
        const result = await query(sqlFindAuthor, [authorName]);
        let authorID;
        if (result.length === 0) {
          const nameParts = authorName.split(' ');
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(' ');
          const sqlInsertNewAuthor = `
            INSERT INTO Authors (firstName, lastName)
            VALUES (?, ?)
          `;
          const insertResult = await query(sqlInsertNewAuthor, [firstName, lastName]);
          authorID = insertResult.insertId;
        } else {
          authorID = result[0].authorID;
        }
        const sqlInsertAuthor = `
          INSERT INTO BookAuthors (isbn, authorID)
          VALUES (?, ?)
        `;
        await query(sqlInsertAuthor, [isbn, authorID]);
      }
    }
    if (Array.isArray(authorsToDelete)) {
      for (const authorName of authorsToDelete) {
        const sqlDeleteAuthor = `
          DELETE FROM BookAuthors
          WHERE isbn = ? AND authorID = (SELECT authorID FROM Authors WHERE CONCAT(firstName, ' ', lastName) = ?)
        `;
        await query(sqlDeleteAuthor, [isbn, authorName]);
      }
    }
    if (Array.isArray(genresToAdd)) {
      for (const genreName of genresToAdd) {
        const sqlInsertGenre = `
          INSERT INTO BookGenres (isbn, genreID)
          VALUES (?, (SELECT genreID FROM Genres WHERE genreName = ?))
        `;
        await query(sqlInsertGenre, [isbn, genreName]);
      }
    }
    if (Array.isArray(genresToDelete)) {
      for (const genreName of genresToDelete) {
        const sqlDeleteGenre = `
          DELETE FROM BookGenres
          WHERE isbn = ? AND genreID = (SELECT genreID FROM Genres WHERE genreName = ?)
        `;
        await query(sqlDeleteGenre, [isbn, genreName]);
      }
    }
    res.json({ message: 'Book updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /books/:isbn – Delete a book (and cascade delete its relationships)
router.delete('/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const sqlDelete = `
      DELETE FROM Books
      WHERE isbn = ?
    `;
    await query(sqlDelete, [isbn]);
    res.json({ message: 'Book deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
