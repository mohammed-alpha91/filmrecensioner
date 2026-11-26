# FilmRecensioner

## About the project

FilmRecensioner is a backend project where users can register, log in and manage their movie reviews. Users can also browse movies in the database and save movies to their personal watchlist.

The project is a REST API built with Node.js, Express and MySQL. There is no frontend; all API endpoints are tested using Postman.

## Technologies

- Node.js
- Express
- MySQL
- JavaScript
- bcrypt for password hashing
- JWT (jsonwebtoken) for authentication
- dotenv for environment variables
- mysql2 for database connections

## Project structure

The project is organized into separate folders to keep the code structured and easier to maintain.

- `database/` – SQL setup file and ER diagram.
- `middleware/` – Authentication and token verification.
- `models/` – Database queries and model functions.
- `routes/` – API endpoints for authentication, movies, reviews and watchlists.
- `server.js` – Starts the Express server and connects the routes.
- `db.js` – Handles the MySQL database connection.

## Database

The database is called `filmrecensioner` and has four tables:

- **users** – Stores users and their password hashes.
- **movies** – Stores information about movies.
- **reviews** – Stores user reviews and ratings.
- **watchlist** – Keeps track of which movies each user has saved.

The SQL code that creates the database, tables and three sample movies is in `database/setup.sql`.

### ER diagram

![ER diagram](database/ER-diagram.png)

- One user can write many reviews and save many movies.
- One movie can have many reviews and appear in many watchlists.
- `users.email` is unique, so the same email cannot be registered twice.
- `reviews (user_id, movie_id)` is unique, allowing only one review per user per movie.
- `watchlist (user_id, movie_id)` is the primary key, preventing duplicate movies in a user's watchlist.
- Ratings must be whole numbers between 1 and 10. This is checked both in the database and in the API.

If a user tries to review the same movie twice or add a movie that is already in their watchlist, the API responds with status code 409.

## Installation

1. Clone the project from GitHub.
2. Open the project folder in VS Code.
3. Install the packages:

```bash
npm install
```

4. Copy `.env.example` to a new file called `.env` in the project's main folder and enter your own database credentials and JWT secret.

Example:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=filmrecensioner
JWT_SECRET=your_secret_jwt_key
```

5. Run the SQL code in `database/setup.sql` using MySQL Workbench to create the database, tables and sample movies.

## Start the server

Start the server with:

```bash
npm start
```

Or use:

```bash
node server.js
```

The server runs at:

`http://localhost:3000`

## Testing with Postman

The API can be tested using Postman.

Public endpoints can be tested directly. For protected endpoints, first register or log in to receive a JWT token.

Copy the token from the login response and include it in the Authorization header:

```text
Authorization: Bearer <your_token>
```

This allows the server to identify the logged-in user and check their permissions.

## API routes

### Authentication

| Method | Route | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register a user | Public |
| POST | `/api/auth/login` | Log in and receive a token | Public |

### Movies

| Method | Route | Description | Access |
|---|---|---|---|
| GET | `/api/movies` | Get all movies | Public |
| GET | `/api/movies/:id` | Get one movie | Public |

### Reviews

| Method | Route | Description | Access |
|---|---|---|---|
| GET | `/api/movies/:movieId/reviews` | Get reviews for a movie | Public |
| POST | `/api/movies/:movieId/reviews` | Create a review | Logged in |
| PUT | `/api/reviews/:id` | Update your own review | Owner only |

### Watchlist

| Method | Route | Description | Access |
|---|---|---|---|
| GET | `/api/watchlist` | Get your watchlist | Logged in |
| POST | `/api/watchlist/:movieId` | Add a movie | Logged in |
| DELETE | `/api/watchlist/:movieId` | Remove a movie | Logged in |

## Request bodies

Register / login:

```json
{
  "email": "sara@test.com",
  "password": "password123"
}
```

The email must be valid and the password must contain at least 8 characters.

Create / update a review:

```json
{
  "rating": 8,
  "comment": "Great movie!"
}
```

The rating must be a whole number between 1 and 10, and the comment is required.

## Status codes

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Invalid input |
| 401 | Not logged in, or invalid/expired token |
| 403 | Trying to edit someone else's review |
| 404 | Resource or route not found |
| 409 | Conflict, such as duplicate email or review |
| 500 | Internal server error |

Unexpected errors are logged on the server. The API returns a general error message without exposing database details.

## Security

- Passwords are hashed with bcrypt and never stored in plain text.
- JWT is used to verify the identity of logged-in users.
- The user's ID is taken from the verified token, never from the request body.
- Before a review is updated, the server checks ownership using `Review.isOwnedBy()`.
- Public review lists only show the reviewer's user ID, not their email address.
- SQL queries use parameterized values (`?`) to protect against SQL injection.
- Unexpected errors are handled without exposing sensitive server or database information.
- Database credentials and the JWT secret are stored in `.env`, which is excluded from GitHub using `.gitignore`.
- `.env.example` contains placeholders instead of real credentials.