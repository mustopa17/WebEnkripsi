// Cipher implementation functions

// Vigenere Standard Cipher (26 Alphabet)
function processVigenereStandard(text, key, action) {
    if (!text) return '';
    if (!key) throw new Error('Key is required.');
    
    key = key.toUpperCase().replace(/[^A-Z]/g, '');
    if (key.length === 0) throw new Error('Key must contain at least one letter.');
    
    const result = [];
    let keyIndex = 0;
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (!/[A-Z]/.test(char)) continue;
        
        const charCode = char.charCodeAt(0) - 65;
        const keyChar = key[keyIndex % key.length];
        const keyCode = keyChar.charCodeAt(0) - 65;
        
        let resultCode;
        if (action === 'encrypt') {
            resultCode = (charCode + keyCode) % 26;
        } else {
            resultCode = (charCode - keyCode + 26) % 26;
        }
        
        result.push(String.fromCharCode(resultCode + 65));
        keyIndex++;
    }
    
    return result.join('');
}

// Auto-key Vigenere Cipher (26 Alphabet)
function processAutoKeyVigenere(text, key, action) {
    if (!text) return '';
    if (!key) throw new Error('Key is required.');
    
    key = key.toUpperCase().replace(/[^A-Z]/g, '');
    if (key.length === 0) throw new Error('Key must contain at least one letter.');
    
    const result = [];
    let autoKey = key;
    
    if (action === 'encrypt') {
        // For encryption, key is original key + plaintext
        autoKey = key + text;
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const charCode = char.charCodeAt(0) - 65;
            const keyChar = autoKey[i];
            const keyCode = keyChar.charCodeAt(0) - 65;
            
            const resultCode = (charCode + keyCode) % 26;
            result.push(String.fromCharCode(resultCode + 65));
        }
    } else {
        // For decryption, we need to generate the key as we go
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const charCode = char.charCodeAt(0) - 65;
            const keyChar = autoKey[i];
            const keyCode = keyChar.charCodeAt(0) - 65;
            
            const plainCode = (charCode - keyCode + 26) % 26;
            const plainChar = String.fromCharCode(plainCode + 65);
            
            result.push(plainChar);
            autoKey += plainChar; // Add decrypted character to key for next iteration
        }
    }
    
    return result.join('');
}

// Extended Vigenere Cipher (256 ASCII)
function processExtendedVigenere(text, key, action) {
    if (!text) return '';
    if (!key) throw new Error('Key is required.');
    
    const result = [];
    
    for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        const keyChar = key.charCodeAt(i % key.length);
        
        let resultCode;
        if (action === 'encrypt') {
            resultCode = (char + keyChar) % 256;
        } else {
            resultCode = (char - keyChar + 256) % 256;
        }
        
        result.push(String.fromCharCode(resultCode));
    }
    
    return result.join('');
}

// Extended Vigenere Cipher for Files
async function processExtendedVigenereFile(fileData, key, action) {
    if (!fileData) throw new Error('File data is required.');
    if (!key) throw new Error('Key is required.');
    
    const input = new Uint8Array(fileData);
    const output = new Uint8Array(input.length);
    const keyBytes = new TextEncoder().encode(key);
    
    for (let i = 0; i < input.length; i++) {
        const keyByte = keyBytes[i % keyBytes.length];
        
        if (action === 'encrypt') {
            output[i] = (input[i] + keyByte) % 256;
        } else {
            output[i] = (input[i] - keyByte + 256) % 256;
        }
    }
    
    // For displaying a preview of binary data
    const preview = Array.from(output.slice(0, 100))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join(' ');
    
    const resultText = document.getElementById('result-text');
    resultText.textContent = `Binary file processed successfully. Preview of first 100 bytes:\n${preview}${output.length > 100 ? '...' : ''}`;
    return output.buffer;
}

// Affine Cipher
function processAffine(text, a, b, action) {
    if (!text) return '';
    
    // Validate parameters
    if (gcd(a, 26) !== 1) {
        throw new Error('Parameter a must be coprime with 26. Valid values: 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25');
    }
    
    text = text.toUpperCase().replace(/[^A-Z]/g, '');
    const result = [];
    
    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i) - 65;
        
        let resultCode;
        if (action === 'encrypt') {
            resultCode = (a * charCode + b) % 26;
        } else {
            const aInverse = modInverse(a, 26);
            resultCode = (aInverse * (charCode - b + 26)) % 26;
        }
        
        result.push(String.fromCharCode(resultCode + 65));
    }
    
    return result.join('');
}

// Playfair Cipher
function processPlayfair(text, key, action) {
    if (!text) return '';
    if (!key) throw new Error('Key is required.');
    
    // Prepare text (replace J with I, remove non-letters)
    text = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
    
    // Handle double letters by inserting X between them
    if (action === 'encrypt') {
        let formattedText = '';
        for (let i = 0; i < text.length; i++) {
            formattedText += text[i];
            
            // If this is not the last character and the next character is the same
            if (i < text.length - 1 && text[i] === text[i + 1]) {
                formattedText += 'X';
            }
        }
        
        // If odd length, add X
        if (formattedText.length % 2 !== 0) {
            formattedText += 'X';
        }
        
        text = formattedText;
    }
    
    // Get Playfair matrix
    const matrix = getPlayfairMatrix(key);
    const result = [];
    
    // Process digraphs
    for (let i = 0; i < text.length; i += 2) {
        if (i + 1 >= text.length) break; // Safety check
        
        const char1 = text[i];
        const char2 = text[i + 1];
        
        const pos1 = findPositionInPlayfairMatrix(matrix, char1);
        const pos2 = findPositionInPlayfairMatrix(matrix, char2);
        
        let row1 = pos1[0], col1 = pos1[1];
        let row2 = pos2[0], col2 = pos2[1];
        
        let newChar1, newChar2;
        
        // Same row
        if (row1 === row2) {
            if (action === 'encrypt') {
                newChar1 = matrix[row1][(col1 + 1) % 5];
                newChar2 = matrix[row2][(col2 + 1) % 5];
            } else {
                newChar1 = matrix[row1][(col1 - 1 + 5) % 5];
                newChar2 = matrix[row2][(col2 - 1 + 5) % 5];
            }
        }
        // Same column
        else if (col1 === col2) {
            if (action === 'encrypt') {
                newChar1 = matrix[(row1 + 1) % 5][col1];
                newChar2 = matrix[(row2 + 1) % 5][col2];
            } else {
                newChar1 = matrix[(row1 - 1 + 5) % 5][col1];
                newChar2 = matrix[(row2 - 1 + 5) % 5][col2];
            }
        }
        // Rectangle case
        else {
            newChar1 = matrix[row1][col2];
            newChar2 = matrix[row2][col1];
        }
        
        result.push(newChar1, newChar2);
    }
    
    return result.join('');
}

// Hill Cipher
function processHill(text, matrix, action) {
    if (!text) return '';
    
    // Prepare text (uppercase, letters only)
    text = text.toUpperCase().replace(/[^A-Z]/g, '');
    
    const size = matrix.length;
    
    // Pad text if needed
    while (text.length % size !== 0) {
        text += 'X';
    }
    
    let result = '';
    
    // Process text in blocks of 'size'
    for (let i = 0; i < text.length; i += size) {
        const block = text.substr(i, size);
        const vector = [];
        
        // Convert block to numeric vector
        for (let j = 0; j < block.length; j++) {
            vector.push(block.charCodeAt(j) - 65);
        }
        
        let resultVector = [];
        
        if (action === 'encrypt') {
            // Matrix multiplication: matrix * vector
            for (let row = 0; row < size; row++) {
                let sum = 0;
                for (let col = 0; col < size; col++) {
                    sum += matrix[row][col] * vector[col];
                }
                resultVector.push(sum % 26);
            }
        } else {
            // For decryption, we need the inverse matrix
            // This is simplified and may not work for all matrices
            // A proper implementation would calculate the matrix inverse
            if (size === 2) {
                const det = (matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]) % 26;
                const detInv = modInverse(((det % 26) + 26) % 26, 26);
                
                const adjugate = [
                    [matrix[1][1], -matrix[0][1]],
                    [-matrix[1][0], matrix[0][0]]
                ];
                
                // Calculate inverse
                const inverse = adjugate.map(row => 
                    row.map(val => (((val * detInv) % 26) + 26) % 26)
                );
                
                // Matrix multiplication: inverse * vector
                for (let row = 0; row < size; row++) {
                    let sum = 0;
                    for (let col = 0; col < size; col++) {
                        sum += inverse[row][col] * vector[col];
                    }
                    resultVector.push(((sum % 26) + 26) % 26);
                }
            } else {
                // For 3x3, we would need a more complex implementation
                throw new Error('Decryption for 3x3 matrices is not implemented in this demo.');
            }
        }
        
        // Convert result vector back to text
        for (let j = 0; j < resultVector.length; j++) {
            result += String.fromCharCode(resultVector[j] + 65);
        }
    }
    
    return result;
}

// Helper functions for Playfair cipher
function getPlayfairMatrix(key) {
    key = key.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
    let keyChars = [];
    
    for (let char of key) {
        if (!keyChars.includes(char)) {
            keyChars.push(char);
        }
    }
    
    for (let i = 65; i <= 90; i++) {
        const char = String.fromCharCode(i);
        if (char !== 'J' && !keyChars.includes(char)) {
            keyChars.push(char);
        }
    }
    
    // Convert to 5x5 matrix
    const matrix = [];
    for (let i = 0; i < 5; i++) {
        matrix.push(keyChars.slice(i * 5, i * 5 + 5));
    }
    
    return matrix;
}

function findPositionInPlayfairMatrix(matrix, char) {
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            if (matrix[i][j] === char) {
                return [i, j];
            }
        }
    }
    return null;
}