

const { getAuth } = require("../services/Firebase/firebaseAdmin");

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json("No token provided");
    }

    const token = authHeader.split(" ")[1];

    try {
        const decodedToken = await getAuth().verifyIdToken(token);
        req.user = decodedToken; 
        next();

    } catch (error) {
        console.error("Auth error:", error);
        return res.status(401).json("Invalid or expired token");
    }
};

module.exports = verifyToken;