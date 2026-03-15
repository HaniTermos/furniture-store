const path = require('path');
const fs = require('fs');
<<<<<<< HEAD
=======
const { v4: uuidv4 } = require('uuid');
>>>>>>> d1d77d0 (dashboard and variants edits)

// Base URL for constructing absolute image URLs
const getBaseUrl = () => process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;

const imageService = {
    /**
     * Upload an image — saves to local disk and returns absolute URL
     */
    async upload(file, folder = 'furniture-store') {
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

<<<<<<< HEAD
        const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
=======
        // Use UUID v4 for filenames — cryptographically random, no collision risk
        const filename = `${uuidv4()}${path.extname(file.originalname)}`;
>>>>>>> d1d77d0 (dashboard and variants edits)
        const filepath = path.join(uploadsDir, filename);

        // Support both buffer (memory storage) and path (disk storage)
        if (file.buffer) {
            fs.writeFileSync(filepath, file.buffer);
        } else if (file.path) {
            fs.renameSync(file.path, filepath);
        }

        return {
            url: `${getBaseUrl()}/uploads/${filename}`,
            public_id: filename,
        };
    },

    /**
     * Delete an image from local disk by public_id (filename) or full URL
     */
    async delete(publicId) {
        // If a full URL was passed, extract just the filename
        const filename = publicId.includes('/uploads/')
            ? publicId.split('/uploads/').pop()
            : publicId;
        const filepath = path.join(__dirname, '..', 'uploads', filename);
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }
        return true;
    },

    /**
     * Extract the public_id (filename) from a URL or return as-is
     */
    extractPublicId(url) {
        if (!url) return null;
        if (url.includes('/uploads/')) {
            return url.split('/uploads/').pop();
        }
        return url;
    },
};

module.exports = imageService;
