
'use strict';

// Hämtar Express så att vi kan skapa en server.
const express = require('express');

const pool = require('./db');

const authRoutes = require('./routes/authRoutes');

const authMiddleware = require('./middleware/authMiddleware');

const reviewRoutes = require('./routes/reviewRoutes');


// Skapar vår Express-applikation.
const app = express();

// Bestämmer vilken port servern ska använda.
const PORT = 3000;

// Gör så att servern kan läsa JSON från inkommande anrop.
app.use(express.json());
app.use('/api', reviewRoutes);
app.use('/api/auth', authRoutes);

// Vår första GET-route.
app.get('/api/movies', async (req, res) => {
    try {
        // Hämtar alla filmer från databasen.
        const [movies] = await pool.query('SELECT * FROM movies');

        // Skickar filmerna tillbaka som JSON.
        res.status(200).json({
            message: 'Välkommen till FilmRecensioner!',
            movies: movies
        });

    } catch (error) {
        console.error('Fel vid hämtning av filmer:', error.message);

        res.status(500).json({
            message: 'Något gick fel vid hämtning av filmer.'
        });
    }
});



// GET-route som hämtar en specifik film med hjälp av ID.
app.get('/api/movies/:id', async (req, res) => {
    try {
        // Hämtar filmens ID från adressen.
        const id = Number(req.params.id);

        // Kontrollerar att ID är ett giltigt positivt heltal.
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: 'Ogiltigt film-ID.'
            });
        }

        // Hämtar filmen från databasen med det angivna ID:t.
        const [movies] = await pool.query(
            'SELECT * FROM movies WHERE id = ?',
            [id]
        );

        // Kontrollerar om filmen finns.
        if (movies.length === 0) {
            return res.status(404).json({
                message: 'Filmen hittades inte.'
            });
        }

        // Skickar tillbaka filmen.
        res.status(200).json(movies[0]);

    } catch (error) {
        console.error('Fel vid hämtning av film:', error.message);

        res.status(500).json({
            message: 'Något gick fel vid hämtning av filmen.'
        });
    }
});

// Tillfällig route för att testa JWT-middleware.
app.get('/api/test-protected', authMiddleware, (req, res) => {
    res.status(200).json({
        message: 'Du har tillgång till den skyddade routen!',
        userId: req.userId
    });
});

// Startar servern och väntar på anrop.
app.listen(PORT, () => {
  console.log(`Servern körs på http://localhost:${PORT}`);
});
