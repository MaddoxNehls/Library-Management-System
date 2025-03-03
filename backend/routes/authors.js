/*
 * Citation: 
 * Date: 02/27/2025
 * Based on: https://expressjs.com/en/guide/routing.html
 * Title: Express.js Routing Guide
 * Author: Express.js Team
 * Notes: Used for reference in structuring routing logic
 */


const express = require('express');
const router = express.Router();
const { query } = require('../config/db');

// GET /authors – Retrieve all authors
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT Authors.authorID, Authors.firstName, Authors.lastName, 
             COUNT(BookAuthors.isbn) AS numberOfBooks
      FROM Authors
      LEFT JOIN BookAuthors ON Authors.authorID = BookAuthors.authorID
      GROUP BY Authors.authorID
      ORDER BY Authors.authorID ASC;
    `;
    const results = await query(sql);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /authors/:authorID – Retrieve a single author
router.get('/:authorID', async (req, res) => {
  try {
    const authorID = req.params.authorID;
    const sql = `
      SELECT Authors.authorID, Authors.firstName, Authors.lastName, 
             COUNT(BookAuthors.isbn) AS numberOfBooks
      FROM Authors
      LEFT JOIN BookAuthors ON Authors.authorID = BookAuthors.authorID
      WHERE Authors.authorID = ?
      GROUP BY Authors.authorID;
    `;
    const results = await query(sql, [authorID]);
    if (results.length === 0) return res.status(404).json({ error: "Author not found" });
    res.json(results[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /authors – Create a new author
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const sql = `
      INSERT INTO Authors (firstName, lastName)
      VALUES (?, ?)
    `;
    const result = await query(sql, [firstName, lastName]);
    res.json({ message: "Author created successfully.", authorID: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /authors/:authorID – Update an existing author
router.put('/:authorID', async (req, res) => {
  try {
    const authorID = req.params.authorID;
    const { firstName, lastName } = req.body;
    const sql = `
      UPDATE Authors
      SET firstName = ?, lastName = ?
      WHERE authorID = ?
    `;
    await query(sql, [firstName, lastName, authorID]);
    res.json({ message: "Author updated successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /authors/:authorID – Delete an author (and cascade removal from junction table)
router.delete('/:authorID', async (req, res) => {
  try {
    const authorID = req.params.authorID;
    const sql = `
      DELETE FROM Authors
      WHERE authorID = ?
    `;
    await query(sql, [authorID]);
    res.json({ message: "Author deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
