/*
 * Citation: 
 * Date: 03/01/2025
 * Based on: https://expressjs.com/en/guide/routing.html
 * Title: Express.js Routing Guide
 * Author: Express.js Team
 * Notes: Used for reference in structuring routing logic
 */

const express = require('express');
const router = express.Router();
const { query } = require('../config/db');

// GET /genres – Retrieve all genres
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT g.genreID, g.genreName, COUNT(bg.isbn) AS numberOfBooks
      FROM Genres g
      LEFT JOIN BookGenres bg ON g.genreID = bg.genreID
      GROUP BY g.genreID
      ORDER BY g.genreID ASC;
    `;
    const results = await query(sql);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /genres/:genreID – Retrieve a single genre by its ID
router.get('/:genreID', async (req, res) => {
  try {
    const genreID = req.params.genreID;
    const sql = `
      SELECT g.genreID, g.genreName, COUNT(bg.isbn) AS numberOfBooks
      FROM Genres g
      LEFT JOIN BookGenres bg ON g.genreID = bg.genreID
      WHERE g.genreID = ?
      GROUP BY g.genreID;
    `;
    const results = await query(sql, [genreID]);
    if (results.length === 0) {
      return res.status(404).json({ error: "Genre not found." });
    }
    res.json(results[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /genres – Create a new genre
router.post('/', async (req, res) => {
  try {
    const { genreName } = req.body;
    if (!genreName || genreName.trim() === '') {
      return res.status(400).json({ error: "Genre Name is required." });
    }
    const sql = `INSERT INTO Genres (genreName) VALUES (?)`;
    const result = await query(sql, [genreName.trim()]);
    res.json({ message: "Genre created successfully.", genreID: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /genres/:genreID – Update an existing genre
router.put('/:genreID', async (req, res) => {
  try {
    const genreID = req.params.genreID;
    const { genreName } = req.body;
    if (!genreName || genreName.trim() === '') {
      return res.status(400).json({ error: "Genre Name is required." });
    }
    const sql = `UPDATE Genres SET genreName = ? WHERE genreID = ?`;
    await query(sql, [genreName.trim(), genreID]);
    res.json({ message: "Genre updated successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /genres/:genreID – Delete a genre (cascade deletes BookGenres associations)
router.delete('/:genreID', async (req, res) => {
  try {
    const genreID = req.params.genreID;
    const sql = `DELETE FROM Genres WHERE genreID = ?`;
    await query(sql, [genreID]);
    res.json({ message: "Genre deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
