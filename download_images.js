const fs = require('fs');
const path = require('path');
const https = require('https');

const imageMap = {
    'luna_orange': 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=800&auto=format&fit=crop', // Orange armchair
    'luna_black': 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=800&auto=format&fit=crop', // Dark grey/black chair
    'luna_green': 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=800&auto=format&fit=crop', // Green chair
    'harmony_table': 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?q=80&w=800&auto=format&fit=crop', // Dining table
    'cloud_white': 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=800&auto=format&fit=crop', // White armchair
    'cloud_navy': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop', // Navy chair
    'serene_shelf': 'https://images.unsplash.com/photo-1594620302200-9a762244a156?q=80&w=800&auto=format&fit=crop', // Shelf
    'platform_bed': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800&auto=format&fit=crop' // Bed
};

const outputDir = path.join(__dirname, 'client', 'public', 'images', 'products');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(path.join(outputDir, filename));
        https.get(url, (response) => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                // handle redirect
                return downloadImage(response.headers.location, filename).then(resolve).catch(reject);
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded ${filename}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filename, () => {});
            console.error(`Error downloading ${filename}`, err);
            reject(err);
        });
    });
}

async function run() {
    console.log('Fetching high-quality placeholder images...');
    const promises = Object.entries(imageMap).map(([name, url]) => downloadImage(url, `ai_${name}.jpg`));
    await Promise.all(promises);
    console.log('All images downloaded successfully!');
}

run();
