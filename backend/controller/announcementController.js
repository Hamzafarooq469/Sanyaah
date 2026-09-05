const db = require("../config/db");

const createAnnouncement = async (req, res) => {
    const firebaseUid = req.user.uid; 

    const {
        deceased_name,
        deceased_nickName,
        deceased_address,
        area,
        relative_names,
        janaza_time,
        janaza_location
    } = req.body;

    if (!deceased_name || deceased_name.trim() === "") {
        return res.status(400).json({ message: "Deceased name is required." });
    }

    try {
        const imamResult = await db.query(
            `SELECT id AS imam_id, mosque_id 
             FROM imams 
             WHERE firebase_uid = $1`,
            [firebaseUid]
        );

        if (imamResult.rows.length === 0) {
            return res.status(403).json({ 
                message: "Unauthorized: No Imam/Mosque profile found for this account." 
            });
        }

        const { imam_id, mosque_id } = imamResult.rows[0];

        if (!mosque_id) {
            return res.status(400).json({ 
                message: "No mosque is assigned to this Imam profile." 
            });
        }

        const insertQuery = `
            INSERT INTO announcements (
                mosque_id,
                imam_id,
                deceased_name,
                deceased_nickName,
                deceased_address,
                area,
                relative_names,
                janaza_time,
                janaza_location
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *;
        `;

        const values = [
            mosque_id,
            imam_id,
            deceased_name.trim(),
            deceased_nickName || null,
            deceased_address || null,
            area || null,
            relative_names || null,
            janaza_time || null,
            janaza_location || null
        ];

        const newAnnouncement = await db.query(insertQuery, values);

        return res.status(201).json({
            message: "Announcement created successfully",
            announcement: newAnnouncement.rows[0]
        });

    } catch (error) {
        console.error("Create announcement error:", error);
        return res.status(500).json({ 
            message: "Internal server error", 
            error: error.message 
        });
    }
};

const getMosquesByLocation = async (req, res) => {
    const { tehsil } = req.query;

    if (!tehsil) {
        return res.status(400).json([]);
    }

    try {
        const result = await db.query(
            `SELECT id, name, area, address 
             FROM mosques 
             WHERE LOWER(tehsil) = LOWER($1)
             ORDER BY name ASC`,
            [tehsil]
        );
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error("Fetch mosques error:", error);
        return res.status(500).json([]);
    }
};

const getAnnouncementsByMosque = async (req, res) => {
    const { mosqueId } = req.params;

    if (!mosqueId || isNaN(Number(mosqueId))) {
        return res.status(400).json({ message: "Invalid mosque ID" });
    }

    try {
        const query = `
            SELECT 
                a.id,
                a.deceased_name,
                a.deceased_nickName AS deceased_nickname,
                a.deceased_address,
                a.area AS announcement_area,
                a.relative_names,
                a.janaza_time,
                a.janaza_location,
                a.created_at,
                m.name AS mosque_name,
                m.area AS mosque_area,
                m.address AS mosque_address,
                m.tehsil,
                m.district,
                m.province
            FROM announcements a
            INNER JOIN mosques m ON m.id = a.mosque_id
            WHERE a.mosque_id = $1
            ORDER BY a.created_at DESC;
        `;

        const result = await db.query(query, [Number(mosqueId)]);
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error("Fetch announcements error:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    } }

const deleteAnnouncement = async (req, res) => {
    const { id } = req.params;
    const firebaseUid = req.user.uid;

    try {
        const result = await db.query(
            `DELETE FROM announcements a
             USING imams i
             WHERE a.id = $1 
               AND a.mosque_id = i.mosque_id 
               AND i.firebase_uid = $2
             RETURNING a.id;`,
            [id, firebaseUid]
        );

        if (result.rows.length === 0) {
            return res.status(403).json({ message: "Unauthorized or announcement not found" });
        }

        return res.status(200).json({ message: "Deleted successfully" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const updateAnnouncement = async (req, res) => {
    const { id } = req.params;
    const firebaseUid = req.user.uid;

    try {
        const result = await db.query(
            `UPDATE announcements a
             SET deceased_name = $1,
                 deceased_nickName = $2,
                 deceased_address = $3,
                 area = $4,
                 relative_names = $5,
                 janaza_time = $6,
                 janaza_location = $7,
                 updated_at = NOW()
             FROM imams i
             WHERE a.id = $8 
               AND a.mosque_id = i.mosque_id 
               AND i.firebase_uid = $9
             RETURNING a.*;`,
            [
                req.body.deceased_name,
                req.body.deceased_nickName || null,
                req.body.deceased_address || null,
                req.body.area || null,
                req.body.relative_names || null,
                req.body.janaza_time || null,
                req.body.janaza_location || null,
                id,
                firebaseUid
            ]
        );

        if (result.rows.length === 0) {
            return res.status(403).json({ message: "Unauthorized or announcement not found" });
        }

        return res.status(200).json(result.rows[0]);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

module.exports = {
    createAnnouncement,
    getMosquesByLocation,
    getAnnouncementsByMosque,
    deleteAnnouncement,
    updateAnnouncement
}