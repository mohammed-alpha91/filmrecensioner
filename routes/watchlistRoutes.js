
'use strict';

// Hämtar Express så att vi kan skapa routes.
const express = require('express');

// Hämtar anslutningen till MySQL.
const pool = require('../db');

// Hämtar middleware som kontrollerar JWT-token.
const authMiddleware = require('../middleware/authMiddleware');

// Skapar en router för watchlist.
const router = express.Router();

// GET-route som hämtar användarens sparade filmer.
// Det finns inget användar-ID i adressen. Servern använder alltid req.userId
// från token, så en användare kan aldrig se någon annans watchlist.
router.get('/watchlist', authMiddleware, async (req, res) => {
    try {
        // Hämtar filmerna som tillhör den inloggade användaren.
        // JOIN hämtar filmens titel, genre och år från tabellen movies.
        const [movies] = await pool.query(
            `SELECT movies.id, movies.title, movies.genre, movies.release_year
             FROM watchlist
             JOIN movies ON watchlist.movie_id = movies.id
             WHERE watchlist.user_id = ?`,
            [req.userId]
        );

        // Skickar tillbaka filmerna som JSON.
        res.status(200).json({
            watchlist: movies
        });

    } catch (error) {
        console.error('Fel vid hämtning av watchlist:', error.message);

        res.status(500).json({
            message: 'Något gick fel vid hämtning av watchlist.'
        });
    }
});


// POST-route som lägger till en film i användarens watchlist.
router.post('/watchlist/:movieId', authMiddleware, async (req, res) => {
    try {
        // Hämtar filmens ID från adressen.
        const movieId = Number(req.params.movieId);

        // Kontrollerar att filmens ID är giltigt.
        if (!Number.isInteger(movieId) || movieId <= 0) {
            return res.status(400).json({
                message: 'Ogiltigt film-ID.'
            });
        }

        // Kontrollerar att filmen finns i databasen.
        const [movies] = await pool.query(
            'SELECT id FROM movies WHERE id = ?',
            [movieId]
        );

        if (movies.length === 0) {
            return res.status(404).json({
                message: 'Filmen hittades inte.'
            });
        }

        // Kontrollerar om filmen redan finns i användarens watchlist.
        const [existingMovies] = await pool.query(
            'SELECT movie_id FROM watchlist WHERE user_id = ? AND movie_id = ?',
            [req.userId, movieId]
        );

        if (existingMovies.length > 0) {
            return res.status(409).json({
                message: 'Filmen finns redan i din watchlist.'
            });
        }

        // Lägger till filmen i användarens watchlist.
        await pool.query(
            'INSERT INTO watchlist (user_id, movie_id) VALUES (?, ?)',
            [req.userId, movieId]
        );

        res.status(201).json({
            message: 'Filmen har lagts till i din watchlist!'
        });

    } catch (error) {
        console.error('Fel vid tillägg i watchlist:', error.message);

        res.status(500).json({
            message: 'Något gick fel vid tillägg i watchlist.'
        });
    }
});


// DELETE-route som tar bort en film från användarens watchlist.
router.delete('/watchlist/:movieId', authMiddleware, async (req, res) => {
    try {
        // Hämtar filmens ID från adressen.
        const movieId = Number(req.params.movieId);

        // Kontrollerar att filmens ID är giltigt.
        if (!Number.isInteger(movieId) || movieId <= 0) {
            return res.status(400).json({
                message: 'Ogiltigt film-ID.'
            });
        }

        // Tar bort filmen från den inloggade användarens watchlist.
        const [result] = await pool.query(
            'DELETE FROM watchlist WHERE user_id = ? AND movie_id = ?',
            [req.userId, movieId]
        );

        // Kontrollerar om någon film faktiskt togs bort.
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Filmen finns inte i din watchlist.'
            });
        }

        res.status(200).json({
            message: 'Filmen har tagits bort från din watchlist!'
        });

    } catch (error) {
        console.error('Fel vid borttagning från watchlist:', error.message);

        res.status(500).json({
            message: 'Något gick fel vid borttagning från watchlist.'
        });
    }
});


// Gör routern tillgänglig i andra filer.
module.exports = router;
