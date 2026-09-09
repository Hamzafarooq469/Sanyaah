
const db = require("../config/db")
const { getAuth } = require("../services/Firebase/firebaseAdmin");


// const signUp = async (req, res) => {
//     const { name } = req.body;  
//     const { uid, email } = req.user;  

//     if (!name) {
//         return res.status(400).json("Please provide all required fields");
//     }

//     try {
//         const checkExisting = await db.query(
//             "SELECT id FROM imams WHERE email = $1 OR firebase_uid = $2",
//             [email, uid]  
//         );

//         if (checkExisting.rows.length > 0) {
//             return res.status(409).json("Imam already exists");
//         }

//         const result = await db.query(
//             `INSERT INTO imams (firebase_uid, email, name) 
//              VALUES ($1, $2, $3) 
//              RETURNING id, firebase_uid, email, name, created_at`,
//             [uid, email, name]
//         );

//         return res.status(201).json(result.rows[0]);

//     } catch (error) {
//         console.error("Signup error:", error);
//         return res.status(500).json("Internal server error");
//     }
// };

const signUp = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
        return res.status(400).json({ message: "Please provide all required fields" });

    const client = await db.pool.connect();
    try {
        await client.query("BEGIN");

        const existing = await client.query(
            "SELECT id FROM imams WHERE email = $1", [email]
        );
        if (existing.rows.length > 0)
            return res.status(409).json({ message: "Email already in use" });

        const firebaseUser = await getAuth().createUser({ email, password, displayName: name });

        const result = await client.query(
            `INSERT INTO imams (firebase_uid, email, name)
             VALUES ($1, $2, $3)
             RETURNING id, firebase_uid, email, name, created_at`,
            [firebaseUser.uid, email, name]
        );

        await client.query("COMMIT");
        return res.status(201).json(result.rows[0]);

    } catch (error) {
        await client.query("ROLLBACK");

        // If DB failed after Firebase user was created, clean up Firebase
        if (error.firebaseUid) {
            await admin.auth().deleteUser(error.firebaseUid).catch(() => {});
        }

        console.error("Signup error:", error);
        return res.status(500).json({ message: "Internal server error" });
    } finally {
        client.release();
    }
};

const googleSignUp = async (req, res) => {
    const { uid, email, name } = req.user; 

    const client = await db.pool.connect();
    try {
        await client.query("BEGIN");

        const existing = await client.query(
            "SELECT id FROM imams WHERE firebase_uid = $1", [uid]
        );
        if (existing.rows.length > 0) {
            await client.query("ROLLBACK");
            return res.status(409).json({ message: "Account already exists, please sign in" });
        }



        const result = await client.query(
            `INSERT INTO imams (firebase_uid, email, name)
             VALUES ($1, $2, $3)
             RETURNING id, firebase_uid, email, name, created_at`,
            [uid, email, name || ""]
        );

        await client.query("COMMIT");
        return res.status(201).json(result.rows[0]);

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Google signup error:", error);
        return res.status(500).json({ message: "Internal server error" });
    } finally {
        client.release();
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
    googleSignUp,
    signIn 
}