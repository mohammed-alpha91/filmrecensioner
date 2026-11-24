
-- Skapar databasen om den inte redan finns.
CREATE DATABASE IF NOT EXISTS filmrecensioner;

-- Väljer databasen.
USE filmrecensioner;


-- Skapar tabellen för användare.
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);


-- Skapar tabellen för filmer.
CREATE TABLE IF NOT EXISTS movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    genre VARCHAR(100) NOT NULL,
    release_year INT NOT NULL
);


-- Skapar tabellen för recensioner.
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (movie_id) REFERENCES movies(id),
    UNIQUE (user_id, movie_id),
    CHECK (rating BETWEEN 1 AND 10)
);


-- Skapar tabellen för användarnas bevakningslistor.
CREATE TABLE IF NOT EXISTS watchlist (
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    PRIMARY KEY (user_id, movie_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (movie_id) REFERENCES movies(id)
);


-- Lägger till tre filmer om de inte redan finns.
INSERT INTO movies (title, genre, release_year)
SELECT 'The Matrix', 'Sci-Fi', 1999
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE title = 'The Matrix'
);

INSERT INTO movies (title, genre, release_year)
SELECT 'Inception', 'Sci-Fi', 2010
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE title = 'Inception'
);

INSERT INTO movies (title, genre, release_year)
SELECT 'Interstellar', 'Sci-Fi', 2014
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE title = 'Interstellar'
);
