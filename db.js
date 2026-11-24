'use strict';

const mysql = require('mysql2/promise');
require('dotenv').config();

// Skapar en anslutning till vår MySQL-databas.
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Gör pool tillgänglig i andra filer.
module.exports = pool;