const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT == 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const mailService = {
    async sendInvitation(email, name, token) {
        const acceptUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/accept-invitation?token=${token}`;

        const mailOptions = {
            from: `"High Tech Wood" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'You have been invited to join High Tech Wood',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 8px;">
                    <h2 style="color: #333;">Welcome to High Tech Wood!</h2>
                    <p>Hello ${name || 'there'},</p>
                    <p>You have been invited by an administrator to join our platform. To complete your registration and set your password, please click the button below:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${acceptUrl}" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Accept Invitation</a>
                    </div>
                    <p>This link will expire in 24 hours.</p>
                    <p>If you did not expect this invitation, you can safely ignore this email.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #888;">© 2026 High Tech Wood Furniture Store. All rights reserved.</p>
                </div>
            `,
        };

        return transporter.sendMail(mailOptions);
    },

    async notifyAdminUserAccepted(adminEmail, userName, userEmail) {
        const mailOptions = {
            from: `"High Tech Wood System" <${process.env.SMTP_USER}>`,
            to: adminEmail,
            subject: 'User Invitation Accepted',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 8px;">
                    <h2 style="color: #333;">User Accepted Invitation</h2>
                    <p>Hello Admin,</p>
                    <p>The following user has accepted their invitation and completed their registration:</p>
                    <ul style="list-style: none; padding: 0;">
                        <li><strong>Name:</strong> ${userName}</li>
                        <li><strong>Email:</strong> ${userEmail}</li>
                    </ul>
                    <p>You can now manage this user from the dashboard.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #888;">© 2026 High Tech Wood Furniture Store. All rights reserved.</p>
                </div>
            `,
        };

        return transporter.sendMail(mailOptions);
    },

    async sendContactEmailToAdmin(adminEmail, contactData) {
        const { name, email, subject, message, department } = contactData;
        const mailOptions = {
            from: `"High Tech Wood Contact" <${process.env.SMTP_USER}>`,
            to: adminEmail,
            subject: `New Contact Message: ${subject || 'No Subject'}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                    <h2 style="color: #333; border-bottom: 2px solid #f97316; padding-bottom: 10px;">New Contact Submission</h2>
                    <p>A new message has been received from the website contact form:</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 30%;">Name:</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${email}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Department:</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${department || 'General Support'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Subject:</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${subject || 'N/A'}</td>
                        </tr>
                    </table>
                    <div style="margin-top: 20px; padding: 20px; background-color: #f9f9f9; border-radius: 6px; border-left: 4px solid #f97316;">
                        <p style="margin-top: 0; font-weight: bold; color: #555;">Message:</p>
                        <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
                    </div>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="font-size: 12px; color: #888; text-align: center;">© 2026 High Tech Wood Furniture Store. All rights reserved.</p>
                </div>
            `,
        };

        return transporter.sendMail(mailOptions);
    }
};

module.exports = mailService;
