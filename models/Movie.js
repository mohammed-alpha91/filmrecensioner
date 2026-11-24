
'use strict';

// En klass som beskriver en film.
// Varje objekt motsvarar en rad i tabellen movies.
// Klassen gör att alla filmer skickas till klienten i samma form.
class Movie {
    constructor(id, title, genre, release_year) {
        this.id = id;
        this.title = title;
        this.genre = genre;
        this.release_year = release_year;
    }

    // Returnerar filmens information som ett vanligt objekt.
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            genre: this.genre,
            release_year: this.release_year
        };
    }
}

// Gör klassen tillgänglig i andra filer.
module.exports = Movie;
