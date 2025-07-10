#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all TypeScript files
const getAllFiles = function (dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                arrayOfFiles.push(path.join(dirPath, file));
            }
        }
    });

    return arrayOfFiles;
};

// Fix imports in a file
const fixImports = function (filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Find all relative imports without extensions
    const importRegex = /from\s+['"](\.[^'"]*)['"]/g;
    let match;
    let modified = false;

    while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];

        // Skip if already has an extension
        if (importPath.endsWith('.js') || importPath.endsWith('.jsx')) {
            continue;
        }

        // Add .js extension
        const newImportPath = `${importPath}.js`;
        content = content.replace(
            new RegExp(`from\\s+['"]${importPath.replace(/\./g, '\\.')}['"]`, 'g'),
            `from '${newImportPath}'`
        );
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed imports in ${filePath}`);
    }
};

// Main
const srcDir = path.join(__dirname, '..', 'src');
const files = getAllFiles(srcDir);

files.forEach(fixImports);
console.log(`Processed ${files.length} files`);
console.log('Done!'); 