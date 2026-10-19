import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY;

export const encryptData = (data) => {
  try {
    const stringData = JSON.stringify(data);
    return CryptoJS.AES.encrypt(stringData, SECRET_KEY).toString();
  } catch (error) {
    console.error("Encryption error:", error);
    return null;
  }
};

export const decryptData = (encryptedData) => {
  if (!encryptedData) {
    console.warn("No encrypted data provided");
    return null;
  }

  if (!SECRET_KEY) {
    console.error("SECRET_KEY is undefined");
    return null;
  }

  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) {
      console.error("Decryption produced empty string");
      return null;
    }
    return JSON.parse(decrypted);
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};
