import crypto from 'crypto';
import env from 'dotenv';

env.config();

  const algorithm=process.env.ALGORITHM;
  const key=crypto.scryptSync(process.env.SECRET_KEY,'salt',32);
  const iv=crypto.randomBytes(16);

  export const encryptComment=(text)=>{
    const cipher=crypto.createCipheriv(algorithm,key,iv);
    let encrypted=cipher.update(text,'utf8','hex');
    encrypted+=cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  };

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