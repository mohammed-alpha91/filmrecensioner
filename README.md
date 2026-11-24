
# FilmRecensioner

## Om projektet

FilmRecensioner är ett backendprojekt där användare kan registrera sig, logga in och hantera sina filmrecensioner. Det går också att se vilka filmer som finns i databasen och lägga till filmer i en egen watchlist.

Projektet är byggt som en REST API med Node.js, Express och MySQL.

## Tekniker

- Node.js
- Express
- MySQL
- JavaScript
- bcrypt för lösenord
- JWT för inloggning och autentisering
- dotenv för miljövariabler
- mysql2 för anslutning till databasen

## Databas

Databasen heter `filmrecensioner` och innehåller fyra tabeller:

- **users** – sparar användare och deras lösenordshashar.
- **movies** – innehåller filmernas information.
- **reviews** – innehåller användarnas recensioner och betyg.
- **watchlist** – håller reda på vilka filmer en användare har sparat.

SQL-koden för att skapa databasen finns i `database/setup.sql`. Där finns även tre filmer som exempeldata.

ER-diagrammet finns i samma mapp.

## Installation

1. Klona projektet från GitHub.
2. Öppna projektmappen i VS Code.
3. Installera paketen:

```bash
npm install
```

4. Skapa en `.env`-fil i projektets huvudmapp och lägg in dina egna databasuppgifter och en JWT-hemlighet:

```env
DB_PASSWORD=ditt_mysql_lösenord
JWT_SECRET=din_hemliga_jwt_nyckel
```

5. Kör SQL-koden i `database/setup.sql` i MySQL Workbench för att skapa databasen och tabellerna.

## Starta servern

Starta servern med:

```bash
node server.js
```

Servern körs på:

```text
http://localhost:3000
```

## API-routes

### Autentisering

| Metod | Route | Beskrivning |
|---|---|---|
| POST | `/api/auth/register` | Registrera användare |
| POST | `/api/auth/login` | Logga in |

### Filmer

| Metod | Route | Beskrivning |
|---|---|---|
| GET | `/api/movies` | Hämta alla filmer |
| GET | `/api/movies/:id` | Hämta en specifik film |

### Recensioner

| Metod | Route | Beskrivning |
|---|---|---|
| GET | `/api/movies/:movieId/reviews` | Hämta recensioner för en film |
| POST | `/api/movies/:movieId/reviews` | Skapa en recension |
| PUT | `/api/reviews/:id` | Ändra en egen recension |

### Watchlist

| Metod | Route | Beskrivning |
|---|---|---|
| GET | `/api/watchlist` | Hämta sin watchlist |
| POST | `/api/watchlist/:movieId` | Lägg till en film |
| DELETE | `/api/watchlist/:movieId` | Ta bort en film |

Routes som kräver inloggning använder en JWT-token.

## Övrigt

Lösenord sparas som hashade värden med bcrypt. JWT används för att kontrollera vilka användare som är inloggade.

SQL-frågor använder parametrar för att undvika att användardata läggs direkt in i SQL-koden.
