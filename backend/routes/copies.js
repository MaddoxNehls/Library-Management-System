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

// GET /copies – Retrieve all copies
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT Copies.copyID, Copies.isbn, Books.title, Books.edition, CopyStatuses.statusDescription AS status
      FROM Copies
      INNER JOIN Books ON Copies.isbn = Books.isbn
      INNER JOIN CopyStatuses ON Copies.copyStatusID = CopyStatuses.copyStatusID
      ORDER BY Copies.copyID ASC;
    `;
    const results = await query(sql);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /copies/:copyID – Retrieve a single copy by its copyID
router.get('/:copyID', async (req, res) => {
  try {
    const copyID = req.params.copyID;
    const sql = `
      SELECT Copies.copyID, Copies.isbn, Books.title, Books.edition, CopyStatuses.statusDescription AS status
      FROM Copies
      INNER JOIN Books ON Copies.isbn = Books.isbn
      INNER JOIN CopyStatuses ON Copies.copyStatusID = CopyStatuses.copyStatusID
      WHERE Copies.copyID = ?
    `;
    const results = await query(sql, [copyID]);
    if (results.length === 0) {
      return res.status(404).json({ error: "Copy not found." });
    }
    res.json(results[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /copies – Add a new copy of a book (already exists)
router.post('/', async (req, res) => {
  try {
    const { isbn } = req.body;
    const defaultCopyStatusID = 1; // Default status: Available
    const sqlInsertCopy = `
      INSERT INTO Copies (isbn, copyStatusID)
      VALUES (?, ?)
    `;
    await query(sqlInsertCopy, [isbn, defaultCopyStatusID]);
    res.json({ message: 'New copy added successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /copies/:copyID – Update an existing copy
router.put('/:copyID', async (req, res) => {
  try {
    const copyID = req.params.copyID;
    // For updating, allow changes to the isbn and copyStatusID.
    const { isbn, copyStatusID } = req.body;
    const sql = `
      UPDATE Copies
      SET isbn = ?, copyStatusID = ?
      WHERE copyID = ?
    `;
    await query(sql, [isbn, copyStatusID, copyID]);
    res.json({ message: "Copy updated successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /copies/:copyID – Delete a copy
router.delete('/:copyID', async (req, res) => {
  try {
    const copyID = req.params.copyID;
    const sql = `
      DELETE FROM Copies
      WHERE copyID = ?
    `;
    await query(sql, [copyID]);
    res.json({ message: "Copy deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
