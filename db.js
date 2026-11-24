'use strict';

// Hämtar mysql2 med promise-stöd, så att vi kan använda async/await.
const mysql = require('mysql2/promise');

// Läser in hemligheterna från .env-filen till process.env.
require('dotenv').config();

// Skapar en anslutning till vår MySQL-databas.
// En pool håller några anslutningar öppna och återanvänder dem,
// i stället för att öppna en ny anslutning för varje anrop.
// Alla uppgifter hämtas från .env, så inga lösenord finns i koden.
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Gör pool tillgänglig i andra filer.
module.exports = pool;