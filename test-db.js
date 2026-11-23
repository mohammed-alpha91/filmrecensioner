'use strict';

const pool = require('./db');

async function testConnection() {
    try {
        const [rows] = await pool.query('SELECT * FROM movies');

        console.log('Anslutningen fungerar!');
        console.log(rows);

    } catch (error) {
        console.log('Kunde inte ansluta till databasen:', error.message);

    } finally {
        await pool.end();
    }
}

testConnection();