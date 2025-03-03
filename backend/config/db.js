// Citation for the `createPool` outline:
// Date: 02/24/2025
// Adapted from: CS340 Starter Code
// Source URL: https://github.com/osu-cs340-ecampus/react-starter-app/blob/main/App/backend/database/config.js

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST,               
  user: process.env.DB_USER,               
  password: process.env.DB_PASSWORD,       
  database: process.env.DB_DATABASE,       
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10
});

function query(sql, params) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (error, results) => {
      if (error) return reject(error);
      resolve(results);
    });
  });
}

module.exports = { pool, query };
