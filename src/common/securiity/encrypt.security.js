// built in modeule in node.js
import crypto from 'crypto';

const ENCRYPTION_KEY = Buffer.from("1245124785lkjhdvhugnkmdguhgk4578"); // You should store this securely (e.g., env variable)
const IV_LENGTH = 16; // For AES, the IV is always 16 bytes

export function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
// stage1
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
// stage2
    let encrypted = cipher.update(text, 'utf8', 'hex');
// stage3
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
}


// Decrypt function
export function decrypt(text) {

    const [ivHex, encryptedText] = text.split(':');

    const iv = Buffer.from(ivHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY , iv);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');

    decrypted += decipher.final('utf8');

    return decrypted;
}