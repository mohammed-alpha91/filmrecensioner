
'use strict';

// Hämtar Express så att vi kan skapa en server.
const express = require('express');

// Hämtar anslutningen till MySQL.
const pool = require('./db');

// Hämtar våra routes.
const authRoutes = require('./routes/authRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');

// Hämtar vår Movie-klass.
const Movie = require('./models/Movie');


// Skapar vår Express-applikation.
const app = express();

// Bestämmer vilken port servern ska använda.
const PORT = 3000;

// Gör så att servern kan läsa JSON från inkommande anrop.
app.use(express.json());

// Kopplar våra routes till servern.
// /api/auth/... går till authRoutes, och /api/... går till recensioner och watchlist.
app.use('/api', reviewRoutes);
app.use('/api', watchlistRoutes);
app.use('/api/auth', authRoutes);


// GET-route som hämtar alla filmer.
// Den är publik, så man behöver inte vara inloggad.
app.get('/api/movies', async (req, res) => {
    try {
        // Hämtar alla filmer från databasen.
        const [movies] = await pool.query('SELECT * FROM movies');

        // Skapar ett Movie-objekt för varje film.
        const movieObjects = movies.map(movie => {
            const movieObject = new Movie(
                movie.id,
                movie.title,
                movie.genre,
                movie.release_year
            );

            return movieObject.toJSON();
        });

        // Skickar filmerna tillbaka som JSON.
        res.status(200).json({
            message: 'Välkommen till FilmRecensioner!',
            movies: movieObjects
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

        // Skapar ett Movie-objekt av raden, precis som i listan ovan.
        const movie = new Movie(
            movies[0].id,
            movies[0].title,
            movies[0].genre,
            movies[0].release_year
        );

        // Skickar tillbaka filmen.
        res.status(200).json(movie.toJSON());

    } catch (error) {
        console.error('Fel vid hämtning av film:', error.message);

        res.status(500).json({
            message: 'Något gick fel vid hämtning av filmen.'
        });
    }
});


// Om ingen route ovan matchar adressen svarar vi med JSON i stället för en HTML-sida.
// Den måste ligga efter alla routes, annars fångar den anropen för tidigt.
app.use((req, res) => {
    res.status(404).json({
        message: 'Routen hittades inte.'
    });
});

// Felhanterare för fel som inte fångats i routerna.
// Till exempel om klienten skickar trasig JSON i body.
// Det riktiga felet loggas bara på servern och visas aldrig för klienten.
app.use((error, req, res, next) => {
    if (error.type === 'entity.parse.failed') {
        return res.status(400).json({
            message: 'Ogiltig JSON i anropet.'
        });
    }

    console.error('Oväntat fel:', error.message);

    res.status(500).json({
        message: 'Något gick fel på servern.'
    });
});


// Startar servern och väntar på anrop.
app.listen(PORT, () => {
    console.log(`Servern körs på http://localhost:${PORT}`);
});
