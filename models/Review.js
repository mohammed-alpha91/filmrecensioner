'use strict';

// En klass som beskriver en recension.
class Review {
    constructor(id, user_id, movie_id, rating, comment, email) {
        this.id = id;
        this.user_id = user_id;
        this.movie_id = movie_id;
        this.rating = rating;
        this.comment = comment;
        this.email = email;
    }

    // Returnerar recensionens information som ett vanligt objekt.
    toJSON() {
        return {
            id: this.id,
            user_id: this.user_id,
            movie_id: this.movie_id,
            rating: this.rating,
            comment: this.comment,
            email: this.email
        };
    }
}

// Gör klassen tillgänglig i andra filer.
module.exports = Review;