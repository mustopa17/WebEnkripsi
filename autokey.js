/**
 * Auto-key Vigenere Cipher Implementation (26 alphabet version)
 */

const autokey = {
    encrypt: function(plaintext, key) {
        // Preprocess the plaintext and key
        plaintext = preprocessText(plaintext);
        key = preprocessText(key);
        
        if (key.length === 0 || plaintext.length === 0) {
            return plaintext;
        }
        
        let ciphertext = '';
        let fullKey = key;
        
        // Extend key with plaintext characters
        fullKey += plaintext;
        
        // Encrypt each character
        for (let i = 0; i < plaintext.length; i++) {
            const plainChar = plaintext.charCodeAt(i) - 65; // A=0, B=1, ..., Z=25
            const keyChar = fullKey.charCodeAt(i) - 65;
            
            // Apply Vigenere encryption formula: (plainChar + keyChar) mod 26
            const encryptedChar = mod(plainChar + keyChar, 26);
            
            // Convert back to letter and append to ciphertext
            ciphertext += String.fromCharCode(encryptedChar + 65);
        }
        
        return ciphertext;
    },
    
    decrypt: function(ciphertext, key) {
        // Preprocess the ciphertext and key
        ciphertext = preprocessText(ciphertext);
        key = preprocessText(key);
        
        if (key.length === 0 || ciphertext.length === 0) {
            return ciphertext;
        }
        
        let plaintext = '';
        let currentKey = key;
        
        // Decrypt character by character, extending the key with recovered plaintext
        for (let i = 0; i < ciphertext.length; i++) {
            const cipherChar = ciphertext.charCodeAt(i) - 65; // A=0, B=1, ..., Z=25
            
            // Use key for first characters, then use already decrypted plaintext
            let keyChar;
            if (i < key.length) {
                keyChar = currentKey.charCodeAt(i) - 65;
            } else {
                keyChar = plaintext.charCodeAt(i - key.length) - 65;
            }
            
            // Apply Vigenere decryption formula: (cipherChar - keyChar) mod 26
            const decryptedChar = mod(cipherChar - keyChar, 26);
            
            // Convert back to letter and append to plaintext
            plaintext += String.fromCharCode(decryptedChar + 65);
        }
        
        return plaintext;
    }
};