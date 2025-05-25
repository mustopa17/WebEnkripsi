/**
 * Extended Vigenere Cipher Implementation (256 ASCII characters)
 */

const extended = {
    // Text-based encryption (for text input)
    encryptText: function(plaintext, key) {
        if (key.length === 0) {
            return plaintext;
        }
        
        const plainBytes = stringToBytes(plaintext);
        const keyBytes = stringToBytes(key);
        
        return this.encryptBytes(plainBytes, keyBytes);
    },
    
    // Binary-based encryption (for file input)
    encryptBytes: function(plainBytes, keyBytes) {
        if (keyBytes.length === 0) {
            return bytesToString(plainBytes);
        }
        
        const resultBytes = new Uint8Array(plainBytes.length);
        
        for (let i = 0; i < plainBytes.length; i++) {
            const plainByte = plainBytes[i];
            const keyByte = keyBytes[i % keyBytes.length];
            
            // Apply extended Vigenere encryption formula: (plainByte + keyByte) mod 256
            resultBytes[i] = mod(plainByte + keyByte, 256);
        }
        
        // For text output, convert bytes to string
        if (typeof plainBytes === 'string') {
            return bytesToString(resultBytes);
        }
        
        // Convert result bytes to ASCII characters string
        return String.fromCharCode(...resultBytes);
    },
    
    // Text-based decryption
    decryptText: function(ciphertext, key) {
        if (key.length === 0) {
            return ciphertext;
        }
        
        const cipherBytes = stringToBytes(ciphertext);
        const keyBytes = stringToBytes(key);
        
        return this.decryptBytes(cipherBytes, keyBytes);
    },
    
    // Binary-based decryption
    decryptBytes: function(cipherBytes, keyBytes) {
        if (keyBytes.length === 0) {
            return bytesToString(cipherBytes);
        }
        
        const resultBytes = new Uint8Array(cipherBytes.length);
        
        for (let i = 0; i < cipherBytes.length; i++) {
            const cipherByte = cipherBytes[i];
            const keyByte = keyBytes[i % keyBytes.length];
            
            // Apply extended Vigenere decryption formula: (cipherByte - keyByte) mod 256
            resultBytes[i] = mod(cipherByte - keyByte, 256);
        }
        
        // For text output, convert bytes to string
        if (typeof cipherBytes === 'string') {
            return bytesToString(resultBytes);
        }
        
        // Convert result bytes to ASCII characters string
        return String.fromCharCode(...resultBytes);
    }
};