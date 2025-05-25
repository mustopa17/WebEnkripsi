/**
 * Utility functions for cipher implementations
 */

// Filter out non-alphabetic characters and convert to uppercase
function preprocessText(text, alphabet26Only = true) {
    if (alphabet26Only) {
        return text.toUpperCase().replace(/[^A-Z]/g, '');
    }
    return text;
}

// Format ciphertext in 5-letter groups
function formatInGroups(text, groupSize = 5) {
    const groups = [];
    for (let i = 0; i < text.length; i += groupSize) {
        groups.push(text.substring(i, i + groupSize));
    }
    return groups.join(' ');
}

// Modulo operation that works for negative numbers
function mod(n, m) {
    return ((n % m) + m) % m;
}

// Check if a number is coprime with another (for Affine cipher)
function isCoprime(a, b) {
    const gcd = (x, y) => {
        while (y) {
            [x, y] = [y, x % y];
        }
        return Math.abs(x);
    };
    return gcd(a, b) === 1;
}

// Calculate modular multiplicative inverse (for Affine and Hill cipher)
function modInverse(a, m) {
    a = mod(a, m);
    for (let x = 1; x < m; x++) {
        if (mod(a * x, m) === 1) {
            return x;
        }
    }
    return 1; // Default fallback, should never reach here if a and m are coprime
}

// Calculate determinant of a matrix
function determinant(matrix) {
    if (matrix.length === 2) {
        return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    } else if (matrix.length === 3) {
        return matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) -
               matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
               matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]);
    }
    return 0;
}

// Create adjoint matrix (for Hill cipher)
function adjoint(matrix) {
    if (matrix.length === 2) {
        return [
            [matrix[1][1], -matrix[0][1]],
            [-matrix[1][0], matrix[0][0]]
        ];
    } else if (matrix.length === 3) {
        const adj = Array(3).fill().map(() => Array(3).fill(0));
        
        adj[0][0] = matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1];
        adj[0][1] = -(matrix[0][1] * matrix[2][2] - matrix[0][2] * matrix[2][1]);
        adj[0][2] = matrix[0][1] * matrix[1][2] - matrix[0][2] * matrix[1][1];
        
        adj[1][0] = -(matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]);
        adj[1][1] = matrix[0][0] * matrix[2][2] - matrix[0][2] * matrix[2][0];
        adj[1][2] = -(matrix[0][0] * matrix[1][2] - matrix[0][2] * matrix[1][0]);
        
        adj[2][0] = matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0];
        adj[2][1] = -(matrix[0][0] * matrix[2][1] - matrix[0][1] * matrix[2][0]);
        adj[2][2] = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
        
        return adj;
    }
    return [];
}

// Compute the inverse of a matrix in Zn (for Hill cipher)
function matrixInverse(matrix, mod_value) {
    const det = mod(determinant(matrix), mod_value);
    const detInv = modInverse(det, mod_value);
    
    if (detInv === undefined) {
        throw new Error("Matrix is not invertible in Z" + mod_value);
    }
    
    const adj = adjoint(matrix);
    const inverse = Array(matrix.length).fill().map(() => Array(matrix.length).fill(0));
    
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix.length; j++) {
            inverse[i][j] = mod(adj[i][j] * detInv, mod_value);
        }
    }
    
    return inverse;
}

// Convert a string to an array of bytes (for extended Vigenere)
function stringToBytes(str) {
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
        bytes.push(str.charCodeAt(i));
    }
    return bytes;
}

// Convert array of bytes to a string (for extended Vigenere)
function bytesToString(bytes) {
    let str = '';
    for (let i = 0; i < bytes.length; i++) {
        str += String.fromCharCode(bytes[i]);
    }
    return str;
}

// Read file as array buffer
function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// Convert array buffer to bytes array
function arrayBufferToBytes(buffer) {
    return new Uint8Array(buffer);
}

// Save binary data to file
function saveToFile(data, filename) {
    let blob;
    
    if (typeof data === 'string') {
        blob = new Blob([data], { type: 'text/plain' });
    } else {
        blob = new Blob([new Uint8Array(data)], { type: 'application/octet-stream' });
    }
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'cipher-output';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}