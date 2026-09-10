
const db = require("../config/db")
const { getAuth } = require("../services/Firebase/firebaseAdmin");

const { encrypt, decrypt } = require("../utils/encryption");

const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

const { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse,
} = require("@simplewebauthn/server");




const signUp = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
        return res.status(400).json({ message: "Please provide all required fields" });

    let firebaseUser = null;
    try {
        const existing = await db.query(
            "SELECT id FROM imams WHERE email = $1", [email]
        );
        if (existing.rows.length > 0)
            return res.status(409).json({ message: "Email already in use" });

        firebaseUser = await getAuth().createUser({ email, password, displayName: name });

        const result = await db.query(
            `INSERT INTO imams (firebase_uid, email, name)
             VALUES ($1, $2, $3)`,
            [firebaseUser.uid, email, name]
        );

        return res.status(201).json({ message: "Account created successfully"});

    } catch (error) {
        if (firebaseUser) {
            await getAuth().deleteUser(firebaseUser.uid).catch(() => {});
        }
        console.error("Signup error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const googleSignUp = async (req, res) => {
    const { uid, email, name } = req.user;

    try {
        const existing = await db.query(
            "SELECT id FROM imams WHERE firebase_uid = $1 OR email = $2", [uid, email]
        );
        if (existing.rows.length > 0)
            return res.status(409).json({ message: "Account already exists, please sign in" });

        const result = await db.query(
            `INSERT INTO imams (firebase_uid, email, name)
             VALUES ($1, $2, $3)`,
            [uid, email, name || ""]
        );

        return res.status(201).json({ message: "Account created successfully"});

    } catch (error) {
        console.error("Google signup error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const signIn = async (req, res) => {
    const { uid } = req.user;  

    try {
        const result = await db.query(
            `SELECT id, email, name, mosque_id, totp_enabled
             FROM imams 
             WHERE firebase_uid = $1`, 
            [uid]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Account not found, please sign up first" })
        }

        return res.status(200).json(result.rows[0])

    } catch (error) {
        console.error("Signin error:", error);
        return res.status(500).json({message: "Internal server error "});
    }
}



const setupTOTP = async (req, res) => {
    const { uid } = req.user;

    try {
        const secret = speakeasy.generateSecret({ name: `Saanyah (${req.user.email})` });
        const qrCode = await QRCode.toDataURL(secret.otpauth_url);

        // Save secret temporarily (not enabled yet until verified)
        await db.query(
            `UPDATE imams SET totp_secret = $1 WHERE firebase_uid = $2`,
            [encrypt(secret.base32), uid]
        );

        return res.status(200).json({ qrCode, secret: secret.base32 });

    } catch (error) {
        console.error("TOTP setup error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Step 2 - Verify and enable TOTP
const verifyTOTP = async (req, res) => {
    const { uid } = req.user;
    const { token } = req.body;

    if (!token)
        return res.status(400).json({ message: "Please provide the TOTP code" });

    try {
        const result = await db.query(
            `SELECT totp_secret FROM imams WHERE firebase_uid = $1`, [uid]
        );

        if (result.rows.length === 0)
            return res.status(404).json({ message: "Account not found" });

        const { totp_secret } = result.rows[0];

        const verified = speakeasy.totp.verify({
            secret: decrypt(totp_secret),
            encoding: "base32",
            token,
            window: 1
        });

        if (!verified)
            return res.status(401).json({ message: "Invalid code, please try again" });

        await db.query(
            `UPDATE imams SET totp_enabled = TRUE WHERE firebase_uid = $1`, [uid]
        );

        return res.status(200).json({ message: "2FA enabled successfully" });

    } catch (error) {
        console.error("TOTP verify error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Step 3 - Check TOTP on signin
const verifyTOTPOnSignIn = async (req, res) => {
    const { uid } = req.user;
    const { token } = req.body;

    if (!token)
        return res.status(400).json({ message: "Please provide the TOTP code" });

    try {
        const result = await db.query(
            `SELECT totp_secret, totp_enabled FROM imams WHERE firebase_uid = $1`, [uid]
        );

        if (result.rows.length === 0)
            return res.status(404).json({ message: "Account not found" });

        const { totp_secret, totp_enabled } = result.rows[0];

        if (!totp_enabled)
            return res.status(400).json({ message: "2FA is not enabled" });

        const verified = speakeasy.totp.verify({
            secret: totp_secret,
            encoding: "base32",
            token,
            window: 1
        });

        if (!verified)
            return res.status(401).json({ message: "Invalid code, please try again" });

        return res.status(200).json({ message: "2FA verified successfully" });

    } catch (error) {
        console.error("TOTP signin verify error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const RP_NAME = "Saanyah";
const RP_ID = process.env.RP_ID || "localhost"; // your domain in production
const ORIGIN = process.env.ORIGIN || "http://localhost:5173";

const passkeyRegisterOptions = async (req, res) => {
    const { uid } = req.user;

    try {
        const result = await db.query(
            `SELECT id, email, name FROM imams WHERE firebase_uid = $1`, [uid]
        );

        if (result.rows.length === 0)
            return res.status(404).json({ message: "Account not found" });

        const imam = result.rows[0];

        const options = await generateRegistrationOptions({
            rpName: RP_NAME,
            rpID: RP_ID,
            userID: new TextEncoder().encode(imam.id.toString()),
            userName: imam.email,
            userDisplayName: imam.name,
            attestationType: "none",
            authenticatorSelection: {
                authenticatorAttachment: "platform", // device biometrics only
                userVerification: "required",
                residentKey: "required",
            },
        });

        // Save challenge temporarily
        await db.query(
            `UPDATE imams SET passkey_credential_id = $1 WHERE firebase_uid = $2`,
            [options.challenge, uid]
        );

        return res.status(200).json(options);

    } catch (error) {
        console.error("Passkey register options error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Step 2 - Verify registration
const passkeyRegisterVerify = async (req, res) => {
    const { uid } = req.user;
    const { body } = req;

    try {
        const result = await db.query(
            `SELECT id, passkey_credential_id FROM imams WHERE firebase_uid = $1`, [uid]
        );

        if (result.rows.length === 0)
            return res.status(404).json({ message: "Account not found" });

        const imam = result.rows[0];
        const expectedChallenge = imam.passkey_credential_id;

        const verification = await verifyRegistrationResponse({
            response: body,
            expectedChallenge,
            expectedOrigin: ORIGIN,
            expectedRPID: RP_ID,
            requireUserVerification: true,
        });

        if (!verification.verified)
            return res.status(400).json({ message: "Passkey registration failed" });

        const { credential } = verification.registrationInfo;

        await db.query(
            `UPDATE imams SET 
                passkey_credential_id = $1,
                passkey_public_key = $2,
                passkey_counter = $3,
                passkey_enabled = TRUE
            WHERE firebase_uid = $4`,
            [
                Buffer.from(credential.id).toString("base64"),
                Buffer.from(credential.publicKey).toString("base64"),
                credential.counter,
                uid
            ]
        );

        return res.status(200).json({ message: "Passkey registered successfully" });

    } catch (error) {
        console.error("Passkey register verify error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Step 3 - Generate authentication options
const passkeyAuthOptions = async (req, res) => {
    const { email } = req.body;

    try {
        const result = await db.query(
            `SELECT id, passkey_credential_id, passkey_enabled 
             FROM imams WHERE email = $1`, [email]
        );

        if (result.rows.length === 0)
            return res.status(404).json({ message: "Account not found" });

        const imam = result.rows[0];

        if (!imam.passkey_enabled)
            return res.status(400).json({ message: "Passkey not enabled for this account" });

        const options = await generateAuthenticationOptions({
            rpID: RP_ID,
            allowCredentials: [{
                id: imam.passkey_credential_id, // ← pass as string directly, no Buffer
                type: "public-key",
            }],
            userVerification: "required",
        });

        // Save challenge separately — don't overwrite credential_id
        await db.query(
            `UPDATE imams SET passkey_challenge = $1 WHERE email = $2`,
            [options.challenge, email]
        );

        return res.status(200).json(options);

    } catch (error) {
        console.error("Passkey auth options error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Step 4 - Verify authentication
const passkeyAuthVerify = async (req, res) => {
    const { email, body } = req.body;

    try {
        const result = await db.query(
            `SELECT id, email, name, mosque_id, passkey_credential_id, 
                    passkey_public_key, passkey_counter, passkey_challenge
             FROM imams WHERE email = $1`, [email]
        );

        if (result.rows.length === 0)
            return res.status(404).json({ message: "Account not found" });

        const imam = result.rows[0];

        const verification = await verifyAuthenticationResponse({
            response: body,
            expectedChallenge: imam.passkey_challenge, // ← use separate challenge
            expectedOrigin: ORIGIN,
            expectedRPID: RP_ID,
            credential: {
                id: imam.passkey_credential_id,
                publicKey: Buffer.from(imam.passkey_public_key, "base64"),
                counter: imam.passkey_counter,
            },
            requireUserVerification: true,
        });

        if (!verification.verified)
            return res.status(401).json({ message: "Passkey authentication failed" });

        await db.query(
            `UPDATE imams SET passkey_counter = $1 WHERE email = $2`,
            [verification.authenticationInfo.newCounter, email]
        );

        return res.status(200).json({
            id: imam.id,
            email: imam.email,
            name: imam.name,
            mosque_id: imam.mosque_id,
        });

    } catch (error) {
        console.error("Passkey auth verify error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { 
    signUp, 
    googleSignUp,
    signIn,
    setupTOTP,
    verifyTOTP,
    verifyTOTPOnSignIn,
    passkeyRegisterOptions,
    passkeyRegisterVerify,
    passkeyAuthOptions,
    passkeyAuthVerify   
}