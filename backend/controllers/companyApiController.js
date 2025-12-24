const { CompanyApi } = require('../models');

/**
 * List all APIs for a company
 */
const listApis = async (req, res) => {
    try {
        const companyId = req.company_id;
        const { botId } = req.query;

        if (!botId) {
            return res.status(400).json({ error: 'botId query parameter is required' });
        }

        const apis = await CompanyApi.findAll({
            where: { company_id: companyId, bot_id: botId },
            order: [['created_at', 'DESC']]
        });
        res.json(apis);
    } catch (error) {
        console.error('List APIs error:', error);
        res.status(500).json({ error: 'Failed to fetch APIs' });
    }
};

/**
 * Get a single API detail
 */
const getApi = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.company_id;
        const api = await CompanyApi.findOne({
            where: { id, company_id: companyId }
        });

        if (!api) {
            return res.status(404).json({ error: 'API not found' });
        }

        res.json(api);
    } catch (error) {
        console.error('Get API error:', error);
        res.status(500).json({ error: 'Failed to fetch API detail' });
    }
};

/**
 * Create a new API
 */
const createApi = async (req, res) => {
    try {
        const companyId = req.company_id;
        const {
            bot_id,
            name,
            description,
            endpoint_url,
            method,
            headers,
            auth_type,
            auth_credentials,
            timeout_ms,
            parameters_schema
        } = req.body;

        if (!bot_id) {
            return res.status(400).json({ error: 'bot_id is required' });
        }

        const api = await CompanyApi.create({
            company_id: companyId,
            bot_id,
            name,
            description,
            endpoint_url,
            method: method || 'GET',
            headers: headers || {},
            auth_type: auth_type || 'none',
            auth_credentials_encrypted: auth_credentials, // Encrypt here in real-world
            timeout_ms: timeout_ms || 10000,
            parameters_schema: parameters_schema || {},
            is_active: true
        });

        res.status(201).json(api);
    } catch (error) {
        console.error('Create API error:', error);
        res.status(500).json({ error: 'Failed to create API' });
    }
};

/**
 * Update an existing API
 */
const updateApi = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.company_id;
        const {
            name,
            description,
            endpoint_url,
            method,
            headers,
            auth_type,
            auth_credentials,
            timeout_ms,
            parameters_schema,
            is_active
        } = req.body;

        const api = await CompanyApi.findOne({
            where: { id, company_id: companyId }
        });

        if (!api) {
            return res.status(404).json({ error: 'API not found' });
        }

        await api.update({
            name: name !== undefined ? name : api.name,
            description: description !== undefined ? description : api.description,
            endpoint_url: endpoint_url !== undefined ? endpoint_url : api.endpoint_url,
            method: method !== undefined ? method : api.method,
            headers: headers !== undefined ? headers : api.headers,
            auth_type: auth_type !== undefined ? auth_type : api.auth_type,
            auth_credentials_encrypted: auth_credentials !== undefined ? auth_credentials : api.auth_credentials_encrypted,
            timeout_ms: timeout_ms !== undefined ? timeout_ms : api.timeout_ms,
            parameters_schema: parameters_schema !== undefined ? parameters_schema : api.parameters_schema,
            is_active: is_active !== undefined ? is_active : api.is_active
        });

        res.json(api);
    } catch (error) {
        console.error('Update API error:', error);
        res.status(500).json({ error: 'Failed to update API' });
    }
};

/**
 * Delete an API
 */
const deleteApi = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.company_id;

        const api = await CompanyApi.findOne({
            where: { id, company_id: companyId }
        });

        if (!api) {
            return res.status(404).json({ error: 'API not found' });
        }

        await api.destroy();
        res.json({ message: 'API deleted successfully' });
    } catch (error) {
        console.error('Delete API error:', error);
        res.status(500).json({ error: 'Failed to delete API' });
    }
};

module.exports = {
    listApis,
    getApi,
    createApi,
    updateApi,
    deleteApi
};
