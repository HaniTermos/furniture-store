/**
 * Generate a URL-safe slug from a string
 * e.g. "Modern Oak Wardrobe" → "modern-oak-wardrobe"
 */
const generateSlug = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')       // Replace spaces with -
        .replace(/[^\w\-]+/g, '')   // Remove non-word chars
        .replace(/--+/g, '-')       // Replace multiple - with single -
        .replace(/^-+/, '')         // Trim - from start
        .replace(/-+$/, '');        // Trim - from end
};

/**
 * Generate unique slug by appending a random suffix if needed
 */
const generateUniqueSlug = async (text, checkExists) => {
    let slug = generateSlug(text);
    let exists = await checkExists(slug);
    let attempt = 0;
    while (exists) {
        attempt++;
        slug = `${generateSlug(text)}-${attempt}`;
        exists = await checkExists(slug);
    }
    return slug;
};

module.exports = { generateSlug, generateUniqueSlug };
