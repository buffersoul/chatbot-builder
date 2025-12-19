const { User, Invitation, Company, sequelize } = require('../models');
const crypto = require('crypto');
const bcrypt = require('bcrypt'); // Use bcrypt as per package.json
const { Op } = require('sequelize');

// Helper to generate token
const generateToken = () => crypto.randomBytes(32).toString('hex');

const getTeam = async (req, res) => {
    try {
        const companyId = req.company_id;
        const users = await User.findAll({
            where: { company_id: companyId },
            attributes: ['id', 'email', 'first_name', 'last_name', 'role', 'last_login_at', 'created_at']
        });

        const invitations = await Invitation.findAll({
            where: {
                company_id: companyId,
                status: 'pending',
                expires_at: { [Op.gt]: new Date() }
            }
        });

        res.json({ users, invitations });
    } catch (error) {
        console.error('Get team error:', error);
        res.status(500).json({ error: 'Failed to fetch team' });
    }
};

const createInvitation = async (req, res) => {
    try {
        const { email, role } = req.body;
        const companyId = req.company_id;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Check active pending invite
        const existingInvite = await Invitation.findOne({
            where: {
                email,
                company_id: companyId,
                status: 'pending',
                expires_at: { [Op.gt]: new Date() }
            }
        });

        if (existingInvite) {
            return res.json({
                invitation: existingInvite,
                link: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accept-invite?token=${existingInvite.token}`
            });
        }

        const token = generateToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

        const invitation = await Invitation.create({
            company_id: companyId,
            email,
            role: role || 'agent',
            token,
            expires_at: expiresAt,
            status: 'pending'
        });

        const link = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accept-invite?token=${token}`;

        res.json({ invitation, link });

    } catch (error) {
        console.error('Create invitation error:', error);
        res.status(500).json({ error: 'Failed to create invitation' });
    }
};

const revokeInvitation = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.company_id;

        const deleted = await Invitation.destroy({
            where: { id, company_id: companyId }
        });

        if (!deleted) {
            return res.status(404).json({ error: 'Invitation not found' });
        }

        res.json({ message: 'Invitation revoked' });
    } catch (error) {
        console.error('Revoke invitation error:', error);
        res.status(500).json({ error: 'Failed to revoke invitation' });
    }
};

const verifyInvitation = async (req, res) => {
    try {
        const { token } = req.query;

        const invitation = await Invitation.findOne({
            where: {
                token,
                status: 'pending',
                expires_at: { [Op.gt]: new Date() }
            },
            include: [{ model: Company, as: 'company', attributes: ['name'] }]
        });

        if (!invitation) {
            return res.status(404).json({ error: 'Invalid or expired invitation' });
        }

        res.json({
            valid: true,
            email: invitation.email,
            companyName: invitation.company.name
        });
    } catch (error) {
        console.error('Verify invitation error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
};

const acceptInvitation = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { token, first_name, last_name, password } = req.body;

        const invitation = await Invitation.findOne({
            where: {
                token,
                status: 'pending',
                expires_at: { [Op.gt]: new Date() }
            },
            transaction: t
        });

        if (!invitation) {
            await t.rollback();
            return res.status(400).json({ error: 'Invalid or expired invitation' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            email: invitation.email,
            password_hash: hashedPassword,
            first_name,
            last_name,
            company_id: invitation.company_id,
            role: invitation.role,
            is_email_verified: true // Trusted via invite
        }, { transaction: t });

        // Mark invite accepted
        invitation.status = 'accepted';
        await invitation.save({ transaction: t });

        await t.commit();

        res.json({ message: 'Account created successfully', userId: user.id });

    } catch (error) {
        await t.rollback();
        console.error('Accept invitation error:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'User already exists' });
        }
        res.status(500).json({ error: 'Failed to create account' });
    }
};

module.exports = {
    getTeam,
    createInvitation,
    revokeInvitation,
    verifyInvitation,
    acceptInvitation
};
