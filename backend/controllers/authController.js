const { User, Company, sequelize } = require('../models');
const { hashPassword, comparePassword, generateAccessToken, generateRefreshToken } = require('../services/authService');

/**
 * Register a new company and its owner.
 */
const register = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { name, email, password, industry } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Create Company
        const company = await Company.create({
            name,
            email, // Main company email
            industry,
            status: 'trial'
        }, { transaction: t });

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create Owner User
        const user = await User.create({
            company_id: company.id,
            email,
            password_hash: passwordHash,
            role: 'owner',
            is_email_verified: false
        }, { transaction: t });

        await t.commit();

        // Generate tokens
        const accessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            role: user.role,
            company_id: company.id
        });

        const refreshToken = generateRefreshToken({
            id: user.id
        });

        res.status(201).json({
            message: 'Registration successful',
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            },
            company: {
                id: company.id,
                name: company.name
            },
            tokens: {
                accessToken,
                refreshToken
            }
        });

    } catch (error) {
        await t.rollback();
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error during registration' });
    }
};

/**
 * Login user.
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({
            where: { email },
            include: [{ model: Company, as: 'company' }]
        });

        if (!user || !(await comparePassword(password, user.password_hash))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Update last login
        user.last_login_at = new Date();
        await user.save();

        // Generate tokens
        const accessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            role: user.role,
            company_id: user.company_id
        });

        const refreshToken = generateRefreshToken({
            id: user.id
        });

        res.json({
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            },
            company: {
                id: user.company_id,
                name: user.company.name
            },
            tokens: {
                accessToken,
                refreshToken
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error during login' });
    }
};


/**
 * Get current user profile
 */
const getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: [{ model: Company, as: 'company' }]
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            },
            company: user.company ? {
                id: user.company_id,
                name: user.company.name,
                subscription_tier: user.company.subscription_tier,
                billing_cycle: user.company.billing_cycle,
                stripe_customer_id: user.company.stripe_customer_id
            } : null
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Change user password
 */
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isValid = await comparePassword(currentPassword, user.password_hash);
        if (!isValid) {
            return res.status(400).json({ error: 'Incorrect current password' });
        }

        // Hash new password
        const passwordHash = await hashPassword(newPassword);

        // Update user
        user.password_hash = passwordHash;
        await user.save();

        res.json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    register,
    login,
    getMe,
    changePassword
};
