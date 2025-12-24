const { Bot, Company } = require('../models');

/**
 * List all bots for a company
 */
const listBots = async (req, res) => {
    try {
        const companyId = req.company_id;
        const bots = await Bot.findAll({
            where: { company_id: companyId },
            order: [['created_at', 'ASC']]
        });
        res.json(bots);
    } catch (error) {
        console.error('List bots error:', error);
        res.status(500).json({ error: 'Failed to fetch bots' });
    }
};

/**
 * Create a new bot
 */
const createBot = async (req, res) => {
    try {
        const companyId = req.company_id;
        const { name, description, system_prompt } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Bot name is required' });
        }

        const bot = await Bot.create({
            company_id: companyId,
            name,
            description,
            system_prompt,
            is_active: true
        });

        res.status(201).json(bot);
    } catch (error) {
        console.error('Create bot error:', error);
        res.status(500).json({ error: 'Failed to create bot' });
    }
};

/**
 * Update an existing bot
 */
const updateBot = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.company_id;
        const { name, description, system_prompt, is_active } = req.body;

        const bot = await Bot.findOne({
            where: { id, company_id: companyId }
        });

        if (!bot) {
            return res.status(404).json({ error: 'Bot not found' });
        }

        await bot.update({
            name: name !== undefined ? name : bot.name,
            description: description !== undefined ? description : bot.description,
            system_prompt: system_prompt !== undefined ? system_prompt : bot.system_prompt,
            is_active: is_active !== undefined ? is_active : bot.is_active
        });

        res.json(bot);
    } catch (error) {
        console.error('Update bot error:', error);
        res.status(500).json({ error: 'Failed to update bot' });
    }
};

/**
 * Delete a bot
 */
const deleteBot = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.company_id;

        const bot = await Bot.findOne({
            where: { id, company_id: companyId }
        });

        if (!bot) {
            return res.status(404).json({ error: 'Bot not found' });
        }

        // Check if this is the last bot (maybe we want at least one?)
        // For now, allow deletion but frontend should warn.

        await bot.destroy();
        res.json({ message: 'Bot deleted successfully' });
    } catch (error) {
        console.error('Delete bot error:', error);
        res.status(500).json({ error: 'Failed to delete bot' });
    }
};

module.exports = {
    listBots,
    createBot,
    updateBot,
    deleteBot
};
