import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const algorithm = process.env.ALGORITHM;
const key = crypto.scryptSync(process.env.SECRET_KEY, 'salt', 32);

export const decrypt = (encryptedText) => {
  try {
    const [ivHex, encryptedHex] = encryptedText.split(':');  // ✅ Corrected here
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (err) {
    console.error('Decryption error:', err.message);
    return 'Decryption Failed';
  }
};
