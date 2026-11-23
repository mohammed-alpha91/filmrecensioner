'use strict';

const mysql = require('mysql2/promise');
require('dotenv').config();

// Skapar en anslutning till vår MySQL-databas.
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'filmrecensioner'
});

// Gör pool tillgänglig i andra filer.
module.exports = pool;