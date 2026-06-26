const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // 1. Get the token from the header (It usually looks like "Bearer <token>")
    const authHeader = req.header('Authorization');
    
    // If there is no header at all, kick them out immediately
    if (!authHeader) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // 2. Split the string to grab just the token part
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. Token missing.' });
    }

    try {
        // 3. Verify the token using your secret key from the .env file
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Attach the verified user data to the request so the next function can use it
        req.user = verified;
        
        // 5. Let them pass to the actual route!
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};