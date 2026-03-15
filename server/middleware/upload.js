const multer = require('multer');
const path = require('path');
const fs = require('fs');
<<<<<<< HEAD
=======
const { v4: uuidv4 } = require('uuid');
>>>>>>> d1d77d0 (dashboard and variants edits)

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

<<<<<<< HEAD
// Disk storage — saves files directly to /uploads
=======
// ─── Magic byte signatures for allowed image types ──────────
// Checked AFTER upload to prevent spoofed Content-Type bypass
const IMAGE_MAGIC_BYTES = [
    { mime: 'image/jpeg', bytes: [0xFF, 0xD8, 0xFF] },
    { mime: 'image/png',  bytes: [0x89, 0x50, 0x4E, 0x47] },
    { mime: 'image/gif',  bytes: [0x47, 0x49, 0x46, 0x38] },
    { mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF....WEBP
];

/**
 * Validate a saved file's magic bytes to confirm it is a real image.
 * Deletes the file and throws if invalid.
 */
const validateMagicBytes = (filePath) => {
    const buffer = Buffer.alloc(12);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 12, 0);
    fs.closeSync(fd);

    const isValid = IMAGE_MAGIC_BYTES.some(({ bytes }) =>
        bytes.every((byte, i) => buffer[i] === byte)
    );

    if (!isValid) {
        fs.unlinkSync(filePath); // Remove the malicious file
        throw new Error('Invalid file content. Only real image files are allowed.');
    }
};

// ─── Disk storage — UUID filenames (no Math.random()) ───────
>>>>>>> d1d77d0 (dashboard and variants edits)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
<<<<<<< HEAD
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

=======
        // Use UUID v4 — cryptographically random, no collision risk
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, uuidv4() + ext);
    },
});

// ─── First-pass filter: check client-supplied MIME type ─────
>>>>>>> d1d77d0 (dashboard and variants edits)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});

module.exports = upload;
<<<<<<< HEAD
=======
module.exports.validateMagicBytes = validateMagicBytes;
>>>>>>> d1d77d0 (dashboard and variants edits)
