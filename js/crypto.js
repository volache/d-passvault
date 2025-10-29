// 加密服務模組

/**
 * 使用 AES 加密文字
 * @param {string} text - 要加密的明文
 * @param {string} key - 加密用的金鑰（主密碼）
 * @returns {string} - 加密後的 Base64 密文
 */
export function encrypt(text, key) {
  if (!text) return text;
  return CryptoJS.AES.encrypt(text, key).toString();
}

/**
 * 使用 AES 解密文字
 * @param {string} ciphertext - 要解密的 Base64 密文
 * @param {string} key - 解密用的金鑰（主密碼）
 * @returns {string} - 解密後的明文
 * @throws 如果金鑰錯誤或密文損壞，會拋出錯誤
 */
export function decrypt(ciphertext, key) {
  if (!ciphertext) return ciphertext;
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);

  // 如果解密出來是空字串，代表金鑰錯誤或資料損壞
  if (!originalText) {
    throw new Error("Decryption failed. Invalid key or corrupted data.");
  }

  return originalText;
}
