
'use strict';

// Hämtar Express för att skapa routes.
const express = require('express');

// Hämtar anslutningen till MySQL.
const pool = require('../db');

// Hämtar vår middleware som kontrollerar JWT.
const authMiddleware = require('../middleware/authMiddleware');

// Hämtar vår Review-klass.
const Review = require('../models/Review');

// Skapar en router för recensionerna.
const router = express.Router();


// GET-route som hämtar recensioner för en specifik film.
router.get('/movies/:movieId/reviews', async (req, res) => {
    try {
        // Hämtar filmens ID från URL:en.
        const movieId = Number(req.params.movieId);

        // Kontrollerar att filmens ID är giltigt.
        if (!Number.isInteger(movieId) || movieId <= 0) {
            return res.status(400).json({
                message: 'Ogiltigt film-ID.'
            });
        }

        // Kontrollerar att filmen finns, så att ett okänt ID ger 404
        // i stället för en tom lista.
        const [movies] = await pool.query(
            'SELECT id FROM movies WHERE id = ?',
            [movieId]
        );

        if (movies.length === 0) {
            return res.status(404).json({
                message: 'Filmen hittades inte.'
            });
        }

        // Hämtar alla recensioner för filmen.
        // Användarnas e-post hämtas inte, eftersom den inte ska visas publikt.
        const [reviews] = await pool.query(
            `SELECT id, user_id, movie_id, rating, comment
             FROM reviews
             WHERE movie_id = ?`,
            [movieId]
        );

        // Skapar ett Review-objekt för varje recension.
        const reviewObjects = reviews.map(review => {
            const reviewObject = new Review(
                review.id,
                review.user_id,
                review.movie_id,
                review.rating,
                review.comment
            );

            return reviewObject.toJSON();
        });

        // Skickar tillbaka recensionerna.
        res.status(200).json({
            movieId: movieId,
            reviews: reviewObjects
        });

    } catch (error) {
        console.error('Fel vid hämtning av recensioner:', error.message);

        res.status(500).json({
            message: 'Något gick fel vid hämtning av recensioner.'
        });
    }
});


// POST-route för att skapa en recension på en film.
// Användaren måste vara inloggad.
router.post('/movies/:movieId/reviews', authMiddleware, async (req, res) => {
    try {
        // Hämtar filmens ID från URL:en.
        const movieId = Number(req.params.movieId);

        // Hämtar betyg och kommentar från anropets body.
        const { rating, comment } = req.body;

        // Kontrollerar att filmens ID är giltigt.
        if (!Number.isInteger(movieId) || movieId <= 0) {
            return res.status(400).json({
                message: 'Ogiltigt film-ID.'
            });
        }

        // Kontrollerar att betyget är ett heltal mellan 1 och 10.
        if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
            return res.status(400).json({
                message: 'Betyget måste vara ett heltal mellan 1 och 10.'
            });
        }

        // Kontrollerar att en kommentar har skickats.
        if (!comment || typeof comment !== 'string' || comment.trim() === '') {
            return res.status(400).json({
                message: 'Du måste skriva en kommentar.'
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

        // Kontrollerar om användaren redan har recenserat filmen.
        // Regeln är: en recension per användare och film.
        // Databasen skyddar också regeln med UNIQUE (user_id, movie_id).
        const [existingReviews] = await pool.query(
            'SELECT id FROM reviews WHERE user_id = ? AND movie_id = ?',
            [req.userId, movieId]
        );

        if (existingReviews.length > 0) {
            return res.status(409).json({
                message: 'Du har redan recenserat denna film.'
            });
        }

        // Sparar recensionen i databasen.
        // Användarens ID tas från token (req.userId), aldrig från req.body,
        // så att ingen kan skriva en recension i någon annans namn.
        await pool.query(
            'INSERT INTO reviews (user_id, movie_id, rating, comment) VALUES (?, ?, ?, ?)',
            [req.userId, movieId, rating, comment.trim()]
        );

        // Skickar ett svar om att recensionen har skapats.
        res.status(201).json({
            message: 'Recensionen har sparats!'
        });

    } catch (error) {
        console.error('Fel vid skapande av recension:', error.message);

        res.status(500).json({
            message: 'Något gick fel vid skapande av recension.'
        });
    }
});


// PUT-route för att ändra en befintlig recension.
// Användaren måste vara inloggad och äga recensionen.
// PUT betyder att hela recensionen ersätts, därför krävs både betyg och kommentar.
router.put('/reviews/:id', authMiddleware, async (req, res) => {
    try {
        // Hämtar recensionens ID från URL:en.
        const reviewId = Number(req.params.id);

        // Hämtar nytt betyg och ny kommentar från anropet.
        const { rating, comment } = req.body;

        // Kontrollerar att recensionens ID är giltigt.
        if (!Number.isInteger(reviewId) || reviewId <= 0) {
            return res.status(400).json({
                message: 'Ogiltigt recensions-ID.'
            });
        }

        // Kontrollerar att betyget är ett heltal mellan 1 och 10.
        if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
            return res.status(400).json({
                message: 'Betyget måste vara ett heltal mellan 1 och 10.'
            });
        }

        // Kontrollerar att kommentaren finns.
        if (!comment || typeof comment !== 'string' || comment.trim() === '') {
            return res.status(400).json({
                message: 'Du måste skriva en kommentar.'
            });
        }

        // Hämtar recensionen från databasen.
        const [reviews] = await pool.query(
            'SELECT * FROM reviews WHERE id = ?',
            [reviewId]
        );

        // Kontrollerar att recensionen finns.
        if (reviews.length === 0) {
            return res.status(404).json({
                message: 'Recensionen hittades inte.'
            });
        }

        // Skapar ett Review-objekt av raden från databasen.
        const review = new Review(
            reviews[0].id,
            reviews[0].user_id,
            reviews[0].movie_id,
            reviews[0].rating,
            reviews[0].comment
        );

        // Kontrollerar att recensionen tillhör den inloggade användaren.
        // req.userId kommer från den verifierade token i authMiddleware.
        // Är det någon annans recension svarar vi 403 (förbjudet).
        if (!review.isOwnedBy(req.userId)) {
            return res.status(403).json({
                message: 'Du får inte ändra någon annans recension.'
            });
        }

        // Uppdaterar recensionen i databasen.
        await pool.query(
            'UPDATE reviews SET rating = ?, comment = ? WHERE id = ?',
            [rating, comment.trim(), reviewId]
        );

        // Bekräftar att recensionen har uppdaterats.
        res.status(200).json({
            message: 'Recensionen har uppdaterats!'
        });

    } catch (error) {
        console.error('Fel vid uppdatering av recension:', error.message);

        res.status(500).json({
            message: 'Något gick fel vid uppdatering av recensionen.'
        });
    }
});


// Gör routern tillgänglig i server.js.
module.exports = router;
