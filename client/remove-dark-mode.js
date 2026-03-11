const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'app', '(admin)', 'admin');
const componentsDirectoryPath = path.join(__dirname, 'src', 'components', 'admin');

function removeDarkClasses(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            removeDarkClasses(filePath);
        } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
            let content = fs.readFileSync(filePath, 'utf8');
            // Regex to match "dark:" followed by any combination of word chars, dash, slash, brackets, or colon.
            // Also matching an optional leading space so we don't end up with double spaces.
            const originalContent = content;
            content = content.replace(/\s?\bdark:[\w\-\/\[\]:]+/g, '');
            if (content !== originalContent) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Updated: ${filePath}`);
            }
        }
    });
}

removeDarkClasses(directoryPath);
removeDarkClasses(componentsDirectoryPath);

console.log('Finished removing dark classes.');
