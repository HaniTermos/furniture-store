const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const conflictRegex = /<<<<<<< HEAD[\s\S]*?=======\r?\n([\s\S]*?)>>>>>>> [^\n]+/g;
let totalFixed = 0;

walkDir('c:/Users/Hani/OneDrive/Desktop/furniture folder/furniture-store-V2/client/src', function(filePath) {
  if (filePath.match(/\.(ts|tsx|js|jsx)$/)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const matchCount = (content.match(/<<<<<<< HEAD/g) || []).length;
    if (matchCount > 0) {
      content = content.replace(conflictRegex, '$1');
      fs.writeFileSync(filePath, content);
      console.log(`Fixed ${matchCount} conflicts in ${filePath}`);
      totalFixed += matchCount;
    }
  }
});

console.log(`Total frontend conflicts fixed: ${totalFixed}`);
