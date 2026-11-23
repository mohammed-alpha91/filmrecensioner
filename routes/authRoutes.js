
'use strict';

// Hämtar Express så att vi kan skapa routes.
const express = require('express');

// Hämtar bcrypt för att kunna hasha lösenord.
const bcrypt = require('bcrypt');

// Hämtar vår anslutning till MySQL.
const pool = require('../db');

const jwt = require('jsonwebtoken');

// Skapar en router för användarnas routes.
const router = express.Router();


// POST-route för att registrera en ny användare.
router.post('/register', async (req, res) => {
    try {
        // Hämtar e-post och lösenord från användarens anrop.
        const { email, password } = req.body;

        // Kontrollerar att båda fälten finns.
        if (!email || !password) {
            return res.status(400).json({
                message: 'E-post och lösenord måste anges.'
            });
        }

        // Kontrollerar om e-postadressen redan finns i databasen.
        const [existingUsers] = await pool.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                message: 'E-postadressen används redan.'
            });
        }

        // Skapar en hash av lösenordet.
        const passwordHash = await bcrypt.hash(password, 10);

        // Sparar användaren och lösenordets hash i databasen.
        await pool.query(
            'INSERT INTO users (email, password_hash) VALUES (?, ?)',
            [email, passwordHash]
        );

        // Bekräftar att användaren har skapats.
        res.status(201).json({
            message: 'Användaren har registrerats!'
        });

    } catch (error) {
        console.error('Fel vid registrering:', error.message);

        res.status(500).json({
            message: 'Något gick fel vid registreringen.'
        });
    }
});



// POST-route för att logga in en användare.
router.post('/login', async (req, res) => {
    try {
        // Hämtar e-post och lösenord från användarens anrop.
        const { email, password } = req.body;

        // Kontrollerar att båda fälten finns.
        if (!email || !password) {
            return res.status(400).json({
                message: 'E-post och lösenord måste anges.'
            });
        }

        // Hämtar användaren från databasen.
        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        // Kontrollerar om användaren finns.
        if (users.length === 0) {
            return res.status(401).json({
                message: 'Fel e-post eller lösenord.'
            });
        }

        // Hämtar användaren från resultatet.
        const user = users[0];

        // Jämför lösenordet med den sparade lösenordshashen.
        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        // Kontrollerar om lösenordet är korrekt.
        if (!passwordMatches) {
            return res.status(401).json({
                message: 'Fel e-post eller lösenord.'
            });
        }

        // Skapar en JWT-token för den inloggade användaren.
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Skickar tillbaka token till användaren.
        res.status(200).json({
            message: 'Du är nu inloggad!',
            token: token
        });

    } catch (error) {
        console.error('Fel vid inloggning:', error.message);

        res.status(500).json({
            message: 'Något gick fel vid inloggningen.'
        });
    }
});


module.exports = router;