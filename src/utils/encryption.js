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