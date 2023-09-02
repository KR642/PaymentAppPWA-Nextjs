const crypto = require('crypto');

const getKeyFromNumber = (num) => {
    return crypto.createHash('sha256').update(String(num)).digest();
  };


  const decrypt = (text, keyNumber) => {
    try {
      const key = getKeyFromNumber(keyNumber);
      let textParts = text.split(':');
      let iv = Buffer.from(textParts.shift(), 'hex');
      let encryptedText = Buffer.from(textParts.join(':'), 'hex');
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString();
    } catch (err) {
      console.error("Decryption failed:", err);
      return null;
    }
  };

  export const decryptData = (text, keyNumber) => {
    try {
        const key = getKeyFromNumber(keyNumber);
        let textParts = text.split(':');
        let iv = Buffer.from(textParts.shift(), 'hex');
        let encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
      } catch (err) {
        console.error("Decryption failed:", err);
        return null;
      }
  }

export const encryptData = (text, keyNumber) => {
    const key = getKeyFromNumber(keyNumber);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  };
  
  export const decryptQ2 = (encryptedKey) => {
    // Replace `masterKey` with your actual master key
    const masterKey = 'Fuzzy9Platypus$RainDance!';
    // console.log(decrypt(encryptedKey,masterKey));
    return decrypt(encryptedKey, masterKey);
  };
  