/*
 * Citation: 
 * Date: 03/02/2025
 * Based on: https://expressjs.com/en/guide/routing.html
 * Title: Express.js Routing Guide
 * Author: Express.js Team
 * Notes: Used for reference in structuring routing logic
 */

const express = require('express');
const router = express.Router();
const { query } = require('../config/db');

// GET /patrons – Retrieve all patrons
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT 
        p.patronID, 
        p.firstName, 
        p.lastName, 
        p.email, 
        p.phone,
        SUM(CASE WHEN l.loanID IS NOT NULL AND l.returnedDate IS NULL THEN 1 ELSE 0 END) AS itemsCheckedOut,
        SUM(CASE WHEN l.loanID IS NOT NULL AND l.loanStatusID = 2 AND l.returnedDate IS NULL THEN 1 ELSE 0 END) AS itemsOverdue
      FROM Patrons p
      LEFT JOIN Loans l ON p.patronID = l.patronID
      GROUP BY p.patronID
      ORDER BY p.patronID ASC;
    `;
    const results = await query(sql);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /patrons/:patronID – Retrieve a single patron
router.get('/:patronID', async (req, res) => {
  try {
    const patronID = req.params.patronID;
    const sql = `
      SELECT 
        p.patronID, 
        p.firstName, 
        p.lastName, 
        p.email, 
        p.phone,
        SUM(CASE WHEN l.loanID IS NOT NULL AND l.returnedDate IS NULL THEN 1 ELSE 0 END) AS itemsCheckedOut,
        SUM(CASE WHEN l.loanID IS NOT NULL AND l.loanStatusID = 2 AND l.returnedDate IS NULL THEN 1 ELSE 0 END) AS itemsOverdue
      FROM Patrons p
      LEFT JOIN Loans l ON p.patronID = l.patronID
      WHERE p.patronID = ?
      GROUP BY p.patronID
      ORDER BY p.patronID ASC;
    `;
    const results = await query(sql, [patronID]);
    if (results.length === 0) {
      return res.status(404).json({ error: "Patron not found." });
    }
    res.json(results[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /patrons – Create a new patron
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;
    const sql = `
      INSERT INTO Patrons (firstName, lastName, email, phone)
      VALUES (?, ?, ?, ?)
    `;
    const result = await query(sql, [firstName, lastName, email, phone]);
    res.json({ message: "Patron created successfully.", patronID: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /patrons/:patronID – Update an existing patron
router.put('/:patronID', async (req, res) => {
  try {
    const patronID = req.params.patronID;
    const { firstName, lastName, email, phone } = req.body;
    const sql = `
      UPDATE Patrons
      SET firstName = ?, lastName = ?, email = ?, phone = ?
      WHERE patronID = ?
    `;
    await query(sql, [firstName, lastName, email, phone, patronID]);
    res.json({ message: "Patron updated successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /patrons/:patronID – Delete a patron
router.delete('/:patronID', async (req, res) => {
  try {
    const patronID = req.params.patronID;
    const sql = `
      DELETE FROM Patrons
      WHERE patronID = ?
    `;
    await query(sql, [patronID]);
    res.json({ message: "Patron deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
