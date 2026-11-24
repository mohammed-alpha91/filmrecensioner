'use strict';

// En klass som beskriver en recension.
// Varje objekt motsvarar en rad i tabellen reviews.
class Review {
    constructor(id, user_id, movie_id, rating, comment) {
        this.id = id;
        this.user_id = user_id;
        this.movie_id = movie_id;
        this.rating = rating;
        this.comment = comment;
    }

    // Kontrollerar om recensionen tillhör en viss användare.
    // userId kommer från den verifierade JWT-token, inte från klienten.
    isOwnedBy(userId) {
        return this.user_id === userId;
    }

    // Returnerar recensionens information som ett vanligt objekt.
    // Användarens e-post skickas inte med, så att den inte visas publikt.
    toJSON() {
        return {
            id: this.id,
            user_id: this.user_id,
            movie_id: this.movie_id,
            rating: this.rating,
            comment: this.comment
        };
    }
}

// Gör klassen tillgänglig i andra filer.
module.exports = Review;
