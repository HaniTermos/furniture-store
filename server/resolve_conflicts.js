const fs = require('fs');
const files = [
    "c:/Users/Hani/OneDrive/Desktop/furniture folder/furniture-store-V2/server/db/seed.js",
    "c:/Users/Hani/OneDrive/Desktop/furniture folder/furniture-store-V2/server/db/seed-frontend.js",
    "c:/Users/Hani/OneDrive/Desktop/furniture folder/furniture-store-V2/server/.env.example",
    "c:/Users/Hani/OneDrive/Desktop/furniture folder/furniture-store-V2/server/models/OrderItem.js",
    "c:/Users/Hani/OneDrive/Desktop/furniture folder/furniture-store-V2/server/models/CartItem.js",
    "c:/Users/Hani/OneDrive/Desktop/furniture folder/furniture-store-V2/server/routes/auth.js",
    "c:/Users/Hani/OneDrive/Desktop/furniture folder/furniture-store-V2/server/routes/admin.js",
    "c:/Users/Hani/OneDrive/Desktop/furniture folder/furniture-store-V2/server/routes/products.js",
    "c:/Users/Hani/OneDrive/Desktop/furniture folder/furniture-store-V2/server/services/imageService.js",
    "c:/Users/Hani/OneDrive/Desktop/furniture folder/furniture-store-V2/server/test_api_flow.js",
    "c:/Users/Hani/OneDrive/Desktop/furniture folder/furniture-store-V2/server/test_variants_comprehensive.js",
    "c:/Users/Hani/OneDrive/Desktop/furniture folder/furniture-store-V2/server/utils/generateOrderNumber.js"
];

const conflictRegex = /<<<<<<< HEAD[\s\S]*?=======\r?\n([\s\S]*?)>>>>>>> [^\n]+/g;

let totalFixed = 0;

for (const file of files) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        const matchCount = (content.match(/<<<<<<< HEAD/g) || []).length;
        
        if (matchCount > 0) {
            content = content.replace(conflictRegex, '$1');
            fs.writeFileSync(file, content);
            console.log(`Fixed ${matchCount} conflicts in ${file}`);
            totalFixed += matchCount;
        } else {
            console.log(`No conflicts found in ${file}`);
        }
    } else {
        console.log(`File not found: ${file}`);
    }
}

console.log(`Total conflicts fixed: ${totalFixed}`);
