// server/utils/exportUtils.js

const jsonToCsv = (data, fields) => {
    if (!data || data.length === 0) return '';

    const header = fields.join(',') + '\n';
    const rows = data.map(item => {
        return fields.map(field => {
            let value = item[field];

            // Handle nested objects (simple dot notation)
            if (field.includes('.')) {
                const parts = field.split('.');
                value = item;
                for (const part of parts) {
                    value = value ? value[part] : '';
                }
            }

            // Sanitize value for CSV
            if (value === null || value === undefined) {
                value = '';
            } else if (typeof value === 'object') {
                value = JSON.stringify(value);
            }

            // Escape quotes and wrap in quotes if contains comma
            const stringValue = String(value).replace(/"/g, '""');
            return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')
                ? `"${stringValue}"`
                : stringValue;
        }).join(',');
    }).join('\n');

    return header + rows;
};

module.exports = { jsonToCsv };
