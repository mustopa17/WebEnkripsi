/**
 * Hill Cipher Implementation
 */

const hill = {
    // Convert a string to a vector of numbers (A=0, B=1, ..., Z=25)
    stringToVector: function(str, size) {
        const vector = [];
        for (let i = 0; i < str.length; i++) {
            vector.push(str.charCodeAt(i) - 65);
        }
        
        // Pad the vector if necessary
        while (vector.length % size !== 0) {
            vector.push(23); // X = 23
        }
        
        return vector;
    },
    
    // Convert a vector of numbers back to a string
    vectorToString: function(vector) {
        let str = '';
        for (let i = 0; i < vector.length; i++) {
            str += String.fromCharCode(mod(vector[i], 26) + 65);
        }
        return str;
    },
    
    // Matrix multiplication with a vector modulo 26
    multiplyMatrixVector: function(matrix, vector, modulus = 26) {
        const result = [];
        for (let i = 0; i < matrix.length; i++) {
            let sum = 0;
            for (let j = 0; j < matrix[i].length; j++) {
                sum += matrix[i][j] * vector[j];
            }
            result.push(mod(sum, modulus));
        }
        return result;
    },
    
    encrypt: function(plaintext, keyMatrix) {
        // Preprocess plaintext
        plaintext = preprocessText(plaintext);
        
        // Check if matrix is square
        const matrixSize = keyMatrix.length;
        
        // Convert plaintext to vector of numbers
        const plaintextVector = this.stringToVector(plaintext, matrixSize);
        
        // Encrypt in blocks of size matrixSize
        let ciphertext = '';
        for (let i = 0; i < plaintextVector.length; i += matrixSize) {
            const block = plaintextVector.slice(i, i + matrixSize);
            const encryptedBlock = this.multiplyMatrixVector(keyMatrix, block);
            ciphertext += this.vectorToString(encryptedBlock);
        }
        
        return ciphertext;
    },
    
    decrypt: function(ciphertext, keyMatrix) {
        // Preprocess ciphertext
        ciphertext = preprocessText(ciphertext);
        
        // Calculate the inverse of the key matrix
        try {
            const inverseMatrix = matrixInverse(keyMatrix, 26);
            
            // Convert ciphertext to vector of numbers
            const ciphertextVector = this.stringToVector(ciphertext, keyMatrix.length);
            
            // Decrypt in blocks
            let plaintext = '';
            for (let i = 0; i < ciphertextVector.length; i += keyMatrix.length) {
                const block = ciphertextVector.slice(i, i + keyMatrix.length);
                const decryptedBlock = this.multiplyMatrixVector(inverseMatrix, block);
                plaintext += this.vectorToString(decryptedBlock);
            }
            
            return plaintext;
        } catch (error) {
            return "Error: " + error.message;
        }
    }
};