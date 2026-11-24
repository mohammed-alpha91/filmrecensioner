
'use strict';

// Hämtar jsonwebtoken för att kunna kontrollera tokens.
const jwt = require('jsonwebtoken');

// Middleware som kontrollerar om användaren är inloggad.
// Den körs före de skyddade routerna. Om token är giltig går anropet vidare,
// annars stoppas det här med 401.
function authMiddleware(req, res, next) {
    // Hämtar token från anropets Authorization-header.
    const authHeader = req.headers.authorization;

    // Kontrollerar att användaren har skickat en token.
    if (!authHeader) {
        return res.status(401).json({
            message: 'Du måste vara inloggad.'
        });
    }

    // Tar bort ordet Bearer och behåller själva token.
    const token = authHeader.split(' ')[1];

    try {
        // Kontrollerar att token är giltig.
        // jwt.verify kollar signaturen med JWT_SECRET. Om någon har ändrat
        // innehållet i token, eller om den har gått ut, kastas ett fel.
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Sparar användarens ID så att andra routes kan använda det.
        // Det här ID:t går att lita på eftersom det kommer från en verifierad token,
        // inte från något som klienten själv skickar.
        req.userId = decoded.id;

        // Går vidare till nästa steg i servern.
        next();

    } catch (error) {
        return res.status(401).json({
            message: 'Ogiltig eller utgången token.'
        });
    }
}

// Gör funktionen tillgänglig i andra filer.
module.exports = authMiddleware;
