const mailService = require('../services/mailService');

const contactController = {
    async submit(req, res, next) {
        try {
            const { name, email, subject, message, department } = req.body;

            if (!name || !email || !message) {
                return res.status(400).json({ error: 'Name, email, and message are required.' });
            }

            // In a real app, we might store this in a 'contacts' table
            // const contact = await Contact.create({ name, email, subject, message, department });

            // Send email to admin
            const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
            await mailService.sendContactEmailToAdmin(adminEmail, {
                name,
                email,
                subject,
                message,
                department
            });

            res.status(200).json({ message: 'Your message has been sent successfully. We will get back to you soon.' });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = contactController;
