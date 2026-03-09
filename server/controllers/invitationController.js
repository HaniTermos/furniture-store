const pool = require('../db/pool');
const crypto = require('crypto');
const mailService = require('../services/mailService');
const User = require('../models/User');

const invitationController = {
    async invite(req, res) {
        const { email, name, role } = req.body;

        try {
            // Check if user already exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'User with this email already exists.' });
            }

            // Generate token
            const token = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

            // Save invitation
            const { rows } = await pool.query(
                `INSERT INTO invitations (email, name, role, token, expires_at)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (email) DO UPDATE 
                 SET token = $4, expires_at = $5, is_used = false
                 RETURNING id`,
                [email, name, role || 'user', token, expiresAt]
            );

            // Send email
            await mailService.sendInvitation(email, name, token);

            res.status(201).json({ message: 'Invitation sent successfully.' });
        } catch (error) {
            console.error('Invite Error:', error);
            res.status(500).json({ error: 'Failed to send invitation.' });
        }
    },

    async verify(req, res) {
        const { token } = req.params;

        try {
            const { rows } = await pool.query(
                `SELECT * FROM invitations WHERE token = $1 AND is_used = false AND expires_at > CURRENT_TIMESTAMP`,
                [token]
            );

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Invitation not found or expired.' });
            }

            res.json({ invitation: rows[0] });
        } catch (error) {
            console.error('Verify Error:', error);
            res.status(500).json({ error: 'Failed to verify invitation.' });
        }
    },

    async accept(req, res) {
        const { token, password } = req.body;

        try {
            // Find invitation
            const { rows: inviteRows } = await pool.query(
                `SELECT * FROM invitations WHERE token = $1 AND is_used = false AND expires_at > CURRENT_TIMESTAMP`,
                [token]
            );

            if (inviteRows.length === 0) {
                return res.status(400).json({ error: 'Invalid or expired invitation.' });
            }

            const invitation = inviteRows[0];

            // Create user
            const newUser = await User.create({
                email: invitation.email,
                password,
                name: invitation.name,
                role: invitation.role
            });

            // Mark invitation as used
            await pool.query(`UPDATE invitations SET is_used = true WHERE id = $1`, [invitation.id]);

            // Notify admin
            // Find admin who might have invited (simplified: notify the site admin email)
            const adminEmail = process.env.SMTP_USER; // Defaulting to the system sender for now
            await mailService.notifyAdminUserAccepted(adminEmail, newUser.name, newUser.email);

            res.status(201).json({ message: 'Account created successfully. You can now log in.', user: newUser });
        } catch (error) {
            console.error('Accept Invitation Error:', error);
            res.status(500).json({ error: 'Failed to accept invitation.' });
        }
    }
};

module.exports = invitationController;
