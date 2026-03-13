// JWT Token Authentication Handling
import jwt from 'jsonwebtoken';


const verifyToken = (req, res, next) => {
    // Get the token from the "Authorization" header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(403).json({ message: "Access denied. No token provided." });
    }

    try {
        // Verify the token using secret futureframeworks
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next(); // Move on to the actual database query
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};

export default verifyToken;