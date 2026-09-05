
const db = require("../config/db")

const signUp = async (req, res) => {
    const { name } = req.body;  
    const { uid, email } = req.user;  

    if (!name) {
        return res.status(400).json("Please provide all required fields");
    }

    try {
        const checkExisting = await db.query(
            "SELECT id FROM imams WHERE email = $1 OR firebase_uid = $2",
            [email, uid]  
        );

        if (checkExisting.rows.length > 0) {
            return res.status(409).json("Imam already exists");
        }

        const result = await db.query(
            `INSERT INTO imams (firebase_uid, email, name) 
             VALUES ($1, $2, $3) 
             RETURNING id, firebase_uid, email, name, created_at`,
            [uid, email, name]
        );

        return res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json("Internal server error");
    }
};

const signIn = async (req, res) => {
    const { uid } = req.user;  

    try {
        const result = await db.query(
            `SELECT id, firebase_uid, email, name 
             FROM imams 
             WHERE firebase_uid = $1`, 
            [uid]
        )

        if (result.rows.length === 0) {
            return res.status(404).json("Imam not found")
        }

        return res.status(200).json(result.rows[0])

    } catch (error) {
        console.error("Signin error:", error);
        return res.status(500).json("Internal server error");
    }
}

module.exports = { 
    signUp, 
    signIn 
}