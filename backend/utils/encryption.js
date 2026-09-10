
const crypto = require("crypto");

const ENCRYPTION_KEY = process.env.TOTP_ENCRYPTION_KEY; // 32 char secret in .env
const IV_LENGTH = 16;

const encrypt = (text) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
};

const decrypt = (text) => {
    const [iv, encrypted] = text.split(":");
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), Buffer.from(iv, "hex"));
    return Buffer.concat([decipher.update(Buffer.from(encrypted, "hex")), decipher.final()]).toString();
};

module.exports = { encrypt, decrypt };