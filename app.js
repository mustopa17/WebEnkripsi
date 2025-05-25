/**
 * Main application logic
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    
    const cipherTypeSelect = document.getElementById('cipher-type');
    const keyInput = document.getElementById('cipher-key');
     const keyClass = document.getElementsByClassName('key-input');
    const textInput = document.getElementById('plaintext');
    const resultOutput = document.getElementById('result');
    const encryptBtn = document.getElementById('encrypt-btn');
    const decryptBtn = document.getElementById('decrypt-btn');
    const copyBtn = document.getElementById('copy-btn');
    const saveBtn = document.getElementById('save-btn');
    const textRadio = document.getElementById('text-input');
    const fileRadio = document.getElementById('file-input');
    const textInputContainer = document.getElementById('text-input-container');
    const fileInputContainer = document.getElementById('file-input-container');
    const fileInput = document.getElementById('input-file');
    const fileInfo = document.getElementById('file-info');
    const outputFormatRadios = document.getElementsByName('output-format');
    const textOutputOptions = document.getElementById('text-output-options');
    const affineOptions = document.getElementById('affine-options');
    const hillOptions = document.getElementById('hill-options');
    const hillMatrixSize = document.getElementById('hill-matrix-size');
    const matrixInputContainer = document.getElementById('matrix-input-container');
    const affineAInput = document.getElementById('affine-a');
    const affineBInput = document.getElementById('affine-b');
    
    // File data storage
    let fileData = null;
    let fileName = '';
    
    // Current matrix for Hill cipher
    let currentMatrix = [];
    
    // Event Listeners
    cipherTypeSelect.addEventListener('change', updateCipherOptions);
    textRadio.addEventListener('change', toggleInputMethod);
    fileRadio.addEventListener('change', toggleInputMethod);
    fileInput.addEventListener('change', handleFileSelect);
    encryptBtn.addEventListener('click', performEncryption);
    decryptBtn.addEventListener('click', performDecryption);
    copyBtn.addEventListener('click', copyResult);
    saveBtn.addEventListener('click', saveResult);
    hillMatrixSize.addEventListener('change', generateMatrixInputs);
    
    // Initialize the interface
    updateCipherOptions();
    generateMatrixInputs();
    
    // Functions
    function updateCipherOptions() {
        const selectedCipher = cipherTypeSelect.value;
        
        // Reset all options
        keyInput.style.display = 'block';
        affineOptions.style.display = 'none';
        hillOptions.style.display = 'none';
        fileRadio.disabled = false;
        textOutputOptions.style.display = 'block';
        
        // Enable specific options based on cipher type
        switch (selectedCipher) {
            case 'affine':
                
                affineOptions.style.display = 'block';
                keyClass[0].style.display = 'none';
                break;
            case 'hill':
                keyClass[0].style.display = 'none';
                hillOptions.style.display = 'block';
                break;
            case 'extended':
                // Extended Vigenere can handle binary files
                break;
            case 'vigenere':
            case 'autokey':
            case 'playfair':
                keyClass[0].style.display = 'block';
                break;
                // These ciphers only work with alphabetic text
                if (fileRadio.checked) {
                    textRadio.checked = true;
                    toggleInputMethod();
                }
                fileRadio.disabled = true;
                break;
        }
    }
    
    function toggleInputMethod() {
        if (textRadio.checked) {
            textInputContainer.style.display = 'block';
            fileInputContainer.style.display = 'none';
        } else {
            textInputContainer.style.display = 'none';
            fileInputContainer.style.display = 'block';
        }
    }
    
    function generateMatrixInputs() {
        const size = parseInt(hillMatrixSize.value);
        matrixInputContainer.innerHTML = '';
        currentMatrix = Array(size).fill().map(() => Array(size).fill(0));
        
        for (let i = 0; i < size; i++) {
            const row = document.createElement('div');
            row.className = 'matrix-row';
            
            for (let j = 0; j < size; j++) {
                const cell = document.createElement('input');
                cell.type = 'number';
                cell.min = '0';
                cell.max = '25';
                cell.value = i === j ? '1' : '0'; // Identity matrix by default
                cell.className = 'matrix-cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                cell.addEventListener('input', function() {
                    const r = parseInt(this.dataset.row);
                    const c = parseInt(this.dataset.col);
                    currentMatrix[r][c] = parseInt(this.value);
                });
                
                currentMatrix[i][j] = i === j ? 1 : 0; // Set default values
                row.appendChild(cell);
            }
            
            matrixInputContainer.appendChild(row);
        }
    }
    
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            fileName = file.name;
            fileInfo.textContent = `Selected file: ${fileName}`;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                fileData = e.target.result;
            };
            reader.readAsArrayBuffer(file);
        }
    }
    
    function getSelectedOutputFormat() {
        for (const radio of outputFormatRadios) {
            if (radio.checked) {
                return radio.value;
            }
        }
        return 'no-spaces';
    }
    
    function formatOutput(output, isTextInput) {
        if (!isTextInput) return output; // Binary output doesn't need formatting
        
        const format = getSelectedOutputFormat();
        if (format === 'five-group' && typeof output === 'string') {
            return formatInGroups(output, 5);
        }
        return output;
    }
    
    function getCurrentMatrix() {
        const size = parseInt(hillMatrixSize.value);
        const matrix = [];
        
        for (let i = 0; i < size; i++) {
            const row = [];
            for (let j = 0; j < size; j++) {
                const cellInput = document.querySelector(`.matrix-cell[data-row="${i}"][data-col="${j}"]`);
                row.push(parseInt(cellInput.value) || 0);
            }
            matrix.push(row);
        }
        
        return matrix;
    }
    
    function performEncryption() {
        const selectedCipher = cipherTypeSelect.value;
        const key = keyInput.value;
        const isTextInput = textRadio.checked;
        let result;
        
        try {
            if (isTextInput) {
                const input = textInput.value;
                
                switch (selectedCipher) {
                    case 'vigenere':
                        result = vigenere.encrypt(input, key);
                        break;
                    case 'autokey':
                        result = autokey.encrypt(input, key);
                        break;
                    case 'extended':
                        result = extended.encryptText(input, key);
                        break;
                    case 'affine':
                        const a = parseInt(affineAInput.value);
                        const b = parseInt(affineBInput.value);
                        result = affine.encrypt(input, a, b);
                        break;
                    case 'playfair':
                        result = playfair.encrypt(input, key);
                        break;
                    case 'hill':
                        const matrix = getCurrentMatrix();
                        result = hill.encrypt(input, matrix);
                        break;
                    default:
                        result = 'Invalid cipher selected';
                }
            } else {
                // File input processing (only for extended Vigenere)
                if (!fileData) {
                    result = 'No file selected';
                    return;
                }
                
                const fileBytes = new Uint8Array(fileData);
                const keyBytes = stringToBytes(key);
                
                if (selectedCipher === 'extended') {
                    result = extended.encryptBytes(fileBytes, keyBytes);
                } else {
                    result = 'This cipher does not support file input';
                }
            }
            
            // Format and display the result
            resultOutput.value = isTextInput ? formatOutput(result, true) : 'Encryption complete. Save the file to get the result.';
        } catch (error) {
            resultOutput.value = 'Error: ' + error.message;
        }
    }
    
    function performDecryption() {
        const selectedCipher = cipherTypeSelect.value;
        const key = keyInput.value;
        const isTextInput = textRadio.checked;
        let result;
        
        try {
            if (isTextInput) {
                const input = textInput.value;
                
                switch (selectedCipher) {
                    case 'vigenere':
                        result = vigenere.decrypt(input, key);
                        break;
                    case 'autokey':
                        result = autokey.decrypt(input, key);
                        break;
                    case 'extended':
                        result = extended.decryptText(input, key);
                        break;
                    case 'affine':
                        const a = parseInt(affineAInput.value);
                        const b = parseInt(affineBInput.value);
                        result = affine.decrypt(input, a, b);
                        break;
                    case 'playfair':
                        result = playfair.decrypt(input, key);
                        break;
                    case 'hill':
                        const matrix = getCurrentMatrix();
                        result = hill.decrypt(input, matrix);
                        break;
                    default:
                        result = 'Invalid cipher selected';
                }
            } else {
                // File input processing (only for extended Vigenere)
                if (!fileData) {
                    result = 'No file selected';
                    return;
                }
                
                const fileBytes = new Uint8Array(fileData);
                const keyBytes = stringToBytes(key);
                
                if (selectedCipher === 'extended') {
                    result = extended.decryptBytes(fileBytes, keyBytes);
                } else {
                    result = 'This cipher does not support file input';
                }
            }
            
            // Format and display the result
            resultOutput.value = isTextInput ? formatOutput(result, true) : 'Decryption complete. Save the file to get the result.';
        } catch (error) {
            resultOutput.value = 'Error: ' + error.message;
        }
    }
    
    function copyResult() {
        resultOutput.select();
        document.execCommand('copy');
        alert('Copied to clipboard!');
    }
    
    function saveResult() {
        const selectedCipher = cipherTypeSelect.value;
        const isTextInput = textRadio.checked;
        
        if (isTextInput) {
            // Text result
            const textToSave = resultOutput.value;
            saveToFile(textToSave, 'cipher-result.txt');
        } else {
            // Binary result
            if (!fileData) {
                alert('No file data to save');
                return;
            }
            
            try {
                const key = keyInput.value;
                const fileBytes = new Uint8Array(fileData);
                const keyBytes = stringToBytes(key);
                let result;
                
                if (selectedCipher === 'extended') {
                    // Determine if we're saving encrypted or decrypted data
                    const operation = resultOutput.value.includes('Encryption') ? 'encrypt' : 'decrypt';
                    result = operation === 'encrypt' ? 
                        extended.encryptBytes(fileBytes, keyBytes) :
                        extended.decryptBytes(fileBytes, keyBytes);
                    
                    // Generate a filename
                    const outputFilename = operation === 'encrypt' ? 
                        fileName + '.enc' : 
                        fileName.replace('.enc', '');
                    
                    // Save the result
                    saveToFile(result, outputFilename || 'cipher-result');
                } else {
                    alert('This cipher does not support file output');
                }
            } catch (error) {
                alert('Error saving file: ' + error.message);
            }
        }
    }
});