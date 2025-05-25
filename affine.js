/**
 * Affine Cipher Implementation
 */

const affine = {
    encrypt: function(plaintext, a, b) {
        // Preprocess the plaintext
        plaintext = preprocessText(plaintext);
        
        // Validate parameters
        if (!isCoprime(a, 26)) {
            throw new Error("Parameter 'a' must be coprime with 26");
        }
        
        let ciphertext = '';
        
        // Encrypt each character
        for (let i = 0; i < plaintext.length; i++) {
            const plainChar = plaintext.charCodeAt(i) - 65; // A=0, B=1, ..., Z=25
            
            // Apply Affine encryption formula: (a * plainChar + b) mod 26
            const encryptedChar = mod(a * plainChar + b, 26);
            
            // Convert back to letter and append to ciphertext
            ciphertext += String.fromCharCode(encryptedChar + 65);
        }
        
        return ciphertext;
    },
    
    decrypt: function(ciphertext, a, b) {
        // Preprocess the ciphertext
        ciphertext = preprocessText(ciphertext);
        
        // Validate parameters
        if (!isCoprime(a, 26)) {
            throw new Error("Parameter 'a' must be coprime with 26");
        }
        
        // Calculate modular multiplicative inverse of a
        const aInverse = modInverse(a, 26);
        
        let plaintext = '';
        
        // Decrypt each character
        for (let i = 0; i < ciphertext.length; i++) {
            const cipherChar = ciphertext.charCodeAt(i) - 65; // A=0, B=1, ..., Z=25
            
            // Apply Affine decryption formula: (aInverse * (cipherChar - b)) mod 26
            const decryptedChar = mod(aInverse * (cipherChar - b), 26);
            
            // Convert back to letter and append to plaintext
            plaintext += String.fromCharCode(decryptedChar + 65);
        }
        
        return plaintext;
    }
};