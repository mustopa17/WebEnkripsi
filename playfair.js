/**
 * Playfair Cipher Implementation
 */

const playfair = {
    // Generate the Playfair key square (5x5 matrix) from a key
    generateKeySquare: function(key) {
        key = preprocessText(key).replace(/J/g, 'I');
        
        // Create a set of all unique letters in the key
        const usedChars = new Set();
        let keySquare = '';
        
        // First add unique letters from the key
        for (let i = 0; i < key.length; i++) {
            if (!usedChars.has(key[i])) {
                usedChars.add(key[i]);
                keySquare += key[i];
            }
        }
        
        // Then add remaining alphabet letters (except J which is combined with I)
        for (let i = 0; i < 26; i++) {
            const c = String.fromCharCode(65 + i);
            if (c !== 'J' && !usedChars.has(c)) {
                keySquare += c;
            }
        }
        
        // Convert to 5x5 matrix
        const matrix = [];
        for (let i = 0; i < 5; i++) {
            matrix.push(keySquare.substr(i * 5, 5));
        }
        
        return matrix;
    },
    
    // Find position of a character in the key square
    findPosition: function(char, keySquare) {
        if (char === 'J') char = 'I';
        
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                if (keySquare[row][col] === char) {
                    return { row, col };
                }
            }
        }
        return null;
    },
    
    // Prepare plaintext for Playfair encryption
    prepareText: function(text) {
        text = preprocessText(text).replace(/J/g, 'I');
        
        // Split into digraphs (pairs of letters)
        const digraphs = [];
        let i = 0;
        
        while (i < text.length) {
            if (i === text.length - 1) {
                // If last character is alone, add an 'X'
                digraphs.push(text[i] + 'X');
                break;
            }
            
            if (text[i] === text[i + 1]) {
                // If two same letters would form a digraph, insert 'X'
                digraphs.push(text[i] + 'X');
                i++;
            } else {
                // Normal case - form a digraph with two consecutive letters
                digraphs.push(text.substr(i, 2));
                i += 2;
            }
        }
        
        return digraphs;
    },
    
    encrypt: function(plaintext, key) {
        // Generate key square
        const keySquare = this.generateKeySquare(key);
        
        // Prepare plaintext into digraphs
        const digraphs = this.prepareText(plaintext);
        
        // Encrypt each digraph
        const encryptedDigraphs = digraphs.map(digraph => {
            const pos1 = this.findPosition(digraph[0], keySquare);
            const pos2 = this.findPosition(digraph[1], keySquare);
            
            // Same row case
            if (pos1.row === pos2.row) {
                return keySquare[pos1.row][(pos1.col + 1) % 5] + keySquare[pos2.row][(pos2.col + 1) % 5];
            }
            // Same column case
            else if (pos1.col === pos2.col) {
                return keySquare[(pos1.row + 1) % 5][pos1.col] + keySquare[(pos2.row + 1) % 5][pos2.col];
            }
            // Rectangle case
            else {
                return keySquare[pos1.row][pos2.col] + keySquare[pos2.row][pos1.col];
            }
        });
        
        return encryptedDigraphs.join('');
    },
    
    decrypt: function(ciphertext, key) {
        // Generate key square
        const keySquare = this.generateKeySquare(key);
        
        // Split ciphertext into digraphs
        const digraphs = [];
        for (let i = 0; i < ciphertext.length; i += 2) {
            if (i + 1 < ciphertext.length) {
                digraphs.push(ciphertext.substr(i, 2));
            } else {
                digraphs.push(ciphertext[i] + 'X'); // Should not happen with proper Playfair
            }
        }
        
        // Decrypt each digraph
        const decryptedDigraphs = digraphs.map(digraph => {
            const pos1 = this.findPosition(digraph[0], keySquare);
            const pos2 = this.findPosition(digraph[1], keySquare);
            
            // Same row case
            if (pos1.row === pos2.row) {
                return keySquare[pos1.row][mod(pos1.col - 1, 5)] + keySquare[pos2.row][mod(pos2.col - 1, 5)];
            }
            // Same column case
            else if (pos1.col === pos2.col) {
                return keySquare[mod(pos1.row - 1, 5)][pos1.col] + keySquare[mod(pos2.row - 1, 5)][pos2.col];
            }
            // Rectangle case
            else {
                return keySquare[pos1.row][pos2.col] + keySquare[pos2.row][pos1.col];
            }
        });
        
        return decryptedDigraphs.join('');
    }
};