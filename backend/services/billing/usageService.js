const { UsageRecord, Company, PricingTier, sequelize } = require('../../models');
const { Op } = require('sequelize');

class UsageService {

    /**
     * Track Token Usage (RAG)
     */
    async trackTokens(companyId, embeddingTokens, inputTokens, outputTokens) {
        const today = new Date().toISOString().split('T')[0];

        try {
            await sequelize.transaction(async (t) => {
                const [record] = await UsageRecord.findOrCreate({
                    where: { company_id: companyId, record_date: today },
                    defaults: {
                        embedding_tokens: 0,
                        llm_input_tokens: 0,
                        llm_output_tokens: 0,
                        total_tokens: 0
                    },
                    transaction: t
                });

                const total = embeddingTokens + inputTokens + outputTokens;

                await record.increment({
                    embedding_tokens: embeddingTokens,
                    llm_input_tokens: inputTokens,
                    llm_output_tokens: outputTokens,
                    total_tokens: total
                }, { transaction: t });
            });
        } catch (error) {
            console.error('Track Tokens Error:', error);
            // Don't throw to prevent blocking the chat flow, just log
        }
    }

    /**
     * Track Message Usage (Meta/Web)
     */
    async trackMessage(companyId, platform) {
        const today = new Date().toISOString().split('T')[0];
        const platformField = `messages_${platform === 'facebook' ? 'facebook' : platform === 'instagram' ? 'instagram' : 'whatsapp'}`;

        try {
            await sequelize.transaction(async (t) => {
                const [record] = await UsageRecord.findOrCreate({
                    where: { company_id: companyId, record_date: today },
                    defaults: {
                        total_messages: 0,
                        messages_whatsapp: 0,
                        messages_facebook: 0,
                        messages_instagram: 0
                    },
                    transaction: t
                });

                // Check if platform field exists in model, safe fallback
                const increments = { total_messages: 1 };
                if (['facebook', 'instagram', 'whatsapp'].includes(platform)) {
                    increments[platformField] = 1;
                }

                await record.increment(increments, { transaction: t });
            });
        } catch (error) {
            console.error('Track Message Error:', error);
        }
    }

    /**
     * Check if Company has quota remaining
     */
    async checkLimits(companyId) {
        const company = await Company.findByPk(companyId, {
            include: [{ model: PricingTier, as: 'current_tier', attributes: ['included_messages', 'tier_name'] }]
        });

        if (!company) return false;

        // Always allow 'active' or 'trial' status
        if (!['active', 'trial'].includes(company.status)) return false;

        // If tier is not loaded or unlimited (e.g. enterprise), allow
        if (!company.current_tier) return true;

        // Get current billing period usage
        const periodStart = company.current_period_start || new Date(new Date().setDate(1)); // Default to 1st of month

        const usage = await UsageRecord.sum('total_messages', {
            where: {
                company_id: companyId,
                record_date: {
                    [Op.gte]: periodStart
                }
            }
        });

        const limit = company.monthly_message_limit || company.current_tier.included_messages;

        // 0 or null usually means unlimited in some systems, but strict here
        // Let's assume -1 is unlimited, or verify business logic. For MVP 100 limit.
        // If limit is not set, allow (or strict block).
        if (!limit) return true;

        if (usage >= limit) {
            console.warn(`Company ${companyId} exceeded message limit: ${usage}/${limit}`);
            return false;
        }

        return true;
    }

    async getUsageStats(companyId) {
        const company = await Company.findByPk(companyId);
        const periodStart = company.current_period_start || new Date(new Date().getFullYear(), new Date().getMonth(), 1);

        const totalTokens = await UsageRecord.sum('total_tokens', {
            where: { company_id: companyId, record_date: { [Op.gte]: periodStart } }
        }) || 0;

        const totalMessages = await UsageRecord.sum('total_messages', {
            where: { company_id: companyId, record_date: { [Op.gte]: periodStart } }
        }) || 0;

        return {
            period_start: periodStart,
            total_tokens: totalTokens,
            total_messages: totalMessages
        };
    }
}

module.exports = new UsageService();
