const path = require('path');
const fs = require('fs');

const imageService = {
    /**
     * Upload an image — saves to local disk (Cloudinary skipped for now)
     */
    async upload(file, folder = 'furniture-store') {
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        const filepath = path.join(uploadsDir, filename);

        // Support both buffer (memory storage) and path (disk storage)
        if (file.buffer) {
            fs.writeFileSync(filepath, file.buffer);
        } else if (file.path) {
            fs.renameSync(file.path, filepath);
        }

        return {
            url: `/uploads/${filename}`,
            public_id: filename,
        };
    },

    /**
     * Delete an image from local disk
     */
    async delete(publicId) {
        const filepath = path.join(__dirname, '..', 'uploads', publicId);
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }
        return true;
    },
};

module.exports = imageService;
