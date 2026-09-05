const db = require("../config/db");

const mosqueSetup = async (req, res) => {
    console.log(req.body)
    const { mosqueName, tehsil, district, province, country, area, address } = req.body;
    const uid = req.user.uid; // ✅ comes from verifyToken middleware, no need to verify again

    if (!mosqueName || !tehsil || !district || !province || !country || !area || !address) {
        return res.status(400).json({ message: "Please enter all the fields" });
    }

    try {
        // Check if this imam already has a mosque assigned
        const imamCheck = await db.query(
            `SELECT mosque_id FROM imams WHERE firebase_uid = $1`,
            [uid]
        );
        if (imamCheck.rows[0]?.mosque_id) {
            return res.status(400).json({ message: "You already have a mosque registered" });
        }

        // Check if mosque with same name in same area and district already exists
        const mosqueCheck = await db.query(
            `SELECT id FROM mosques WHERE name = $1 AND area = $2 AND district = $3`,
            [mosqueName, area, district]
        );
        if (mosqueCheck.rows.length > 0) {
            return res.status(400).json({ message: "A mosque with this name already exists in this area" });
        }

        // Insert mosque
        const mosqueResult = await db.query(
            `INSERT INTO mosques (name, address, area, tehsil, district, province, country)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [mosqueName, address, area, tehsil, district, province, country]
        );
        const mosque = mosqueResult.rows[0];

        // Link mosque to imam
        await db.query(
            `UPDATE imams SET mosque_id = $1, updated_at = NOW() WHERE firebase_uid = $2`,
            [mosque.id, uid]
        );

        return res.status(201).json({
            message: "Mosque registered successfully",
            mosque,
        });

    } catch (error) {
        console.error("Mosque setup error:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const myMosque = async (req, res) => {
    const uid = req.user.uid;
    try {
        const result = await db.query(
            `SELECT m.* 
             FROM mosques m
             INNER JOIN imams i ON i.mosque_id = m.id
             WHERE i.firebase_uid = $1`,
            [uid]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No mosque found for this imam" });
        }

        return res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error("Get mosque error:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

module.exports = { 
    mosqueSetup,
    myMosque
};