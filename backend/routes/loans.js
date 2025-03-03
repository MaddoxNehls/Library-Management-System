/*
 * Citation: 
 * Date: 03/03/2025
 * Based on: https://expressjs.com/en/guide/routing.html
 * Title: Express.js Routing Guide
 * Author: Express.js Team
 * Notes: Used for reference in structuring routing logic
 */

const express = require('express');
const router = express.Router();
const { query } = require('../config/db');

// GET /loans – Retrieve all loan records
router.get('/', async (req, res) => {
    try {
      const sql = `
        SELECT l.loanID, l.patronID, CONCAT(p.firstName, ' ', p.lastName) AS patron,
               l.copyID, IFNULL(b.title, 'N/A') AS title, IFNULL(b.edition, 'N/A') AS edition,
               DATE_FORMAT(l.checkoutDate, '%Y-%m-%d') AS checkoutDate,
               DATE_FORMAT(l.dueDate, '%Y-%m-%d') AS dueDate,
               IF(l.returnedDate IS NULL, '', DATE_FORMAT(l.returnedDate, '%Y-%m-%d')) AS returnedDate,
               ls.statusDescription AS status
        FROM Loans l
        INNER JOIN Patrons p ON l.patronID = p.patronID
        LEFT JOIN Copies c ON l.copyID = c.copyID
        LEFT JOIN Books b ON c.isbn = b.isbn
        INNER JOIN LoanStatuses ls ON l.loanStatusID = ls.loanStatusID
        ORDER BY l.loanID ASC;
      `;
      const results = await query(sql);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });  

// GET /loans/:loanID – Retrieve a single loan record
router.get('/:loanID', async (req, res) => {
  try {
    const loanID = req.params.loanID;
    const sql = `
      SELECT l.loanID, l.patronID, CONCAT(p.firstName, ' ', p.lastName) AS patron,
             l.copyID, b.title, b.edition,
             l.checkoutDate, l.dueDate, IFNULL(l.returnedDate, '') AS returnedDate,
             ls.statusDescription AS status
      FROM Loans l
      INNER JOIN Patrons p ON l.patronID = p.patronID
      INNER JOIN Copies c ON l.copyID = c.copyID
      INNER JOIN Books b ON c.isbn = b.isbn
      INNER JOIN LoanStatuses ls ON l.loanStatusID = ls.loanStatusID
      WHERE l.loanID = ?
      ORDER BY l.loanID ASC;
    `;
    const results = await query(sql, [loanID]);
    if (results.length === 0) return res.status(404).json({ error: "Loan not found." });
    res.json(results[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /loans – Create a new loan record
router.post('/', async (req, res) => {
  try {
    // Expected payload: { patronID, copyID, checkoutDate, dueDate }
    const { patronID, copyID, checkoutDate, dueDate } = req.body;
    const loanStatusID = 1; // Active
    const sql = `
      INSERT INTO Loans (patronID, copyID, loanStatusID, checkoutDate, dueDate)
      VALUES (?, ?, ?, ?, ?)
    `;
    await query(sql, [patronID, copyID, loanStatusID, checkoutDate, dueDate]);
    
    // Update the copy status to Checked-Out
    const sqlUpdateCopy = `UPDATE Copies SET copyStatusID = 2 WHERE copyID = ?`;
    await query(sqlUpdateCopy, [copyID]);
    
    res.json({ message: "Loan record created successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /loans/:loanID – Update a loan record (for returning or undoing a return)
router.put('/:loanID', async (req, res) => {
  try {
    const loanID = req.params.loanID;
    // Expected payload: { returnedDate }
    let { returnedDate } = req.body;
    
    // If returnedDate is an empty string, treat it as NULL (undo return)
    // and set the loanStatusID to 1 (Active); otherwise, mark as returned (loanStatusID = 3)
    let loanStatusID;
    if (!returnedDate) {
      returnedDate = null;
      loanStatusID = 1; // Active
    } else {
      loanStatusID = 3; // Returned
    }
    
    const sql = `
      UPDATE Loans
      SET returnedDate = ?, loanStatusID = ?
      WHERE loanID = ?
    `;
    await query(sql, [returnedDate, loanStatusID, loanID]);
    
    // Update the associated copy status correctly:
    // If the loan is being returned, mark the copy as Available (copyStatusID = 1).
    // If undoing a return, mark it as Checked-Out (copyStatusID = 2) to reflect that the item is still loaned.
    const loanResult = await query("SELECT copyID FROM Loans WHERE loanID = ?", [loanID]);
    if (loanResult.length > 0) {
      const copyID = loanResult[0].copyID;
      let sqlUpdateCopy;
      if (loanStatusID === 3) {
        sqlUpdateCopy = `UPDATE Copies SET copyStatusID = 1 WHERE copyID = ?`;
      } else {
        sqlUpdateCopy = `UPDATE Copies SET copyStatusID = 2 WHERE copyID = ?`;
      }
      await query(sqlUpdateCopy, [copyID]);
    }
    res.json({ message: "Loan updated successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /loans/:loanID – Delete a loan record and update the copy status
router.delete('/:loanID', async (req, res) => {
  try {
    const loanID = req.params.loanID;
    // Get the associated copyID
    const loanResult = await query("SELECT copyID FROM Loans WHERE loanID = ?", [loanID]);
    if (loanResult.length === 0) return res.status(404).json({ error: "Loan not found." });
    const copyID = loanResult[0].copyID;
    const sql = `DELETE FROM Loans WHERE loanID = ?`;
    await query(sql, [loanID]);
    
    // Update copy status to Available (copyStatusID = 1)
    const sqlUpdateCopy = `UPDATE Copies SET copyStatusID = 1 WHERE copyID = ?`;
    await query(sqlUpdateCopy, [copyID]);
    res.json({ message: "Loan deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
