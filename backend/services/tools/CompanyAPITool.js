const axios = require('axios');

class CompanyAPITool {
    /**
     * @param {Object} config - Database record from company_apis table
     */
    constructor(config) {
        this.config = config;
        this.name = config.name.replace(/\s+/g, '_').toLowerCase(); // Function names must be snake_case or camelCase
        this.description = config.description || `Execute ${config.name} API`;
        // Ensure parameters_schema is an object, default to empty if null
        this.parameters = config.parameters_schema || {};
    }

    /**
     * Executes the API call with the provided parameters.
     * @param {Object} params - Key-value pairs extracted by the LLM
     */
    async execute(params = {}) {
        try {
            console.log(`Executing Tool [${this.name}] with params:`, params);

            let url = this.config.endpoint_url;
            const method = this.config.method || 'GET';
            let headers = this.config.headers || {};

            // Basic Auth Handling (Placeholder for encryption logic)
            if (this.config.auth_type === 'bearer' && this.config.auth_credentials_encrypted) {
                // In a real scenario, decrypt here. 
                // For now, assuming the token might be stored plain for MVP or we'll add decryption later.
                headers['Authorization'] = `Bearer ${this.config.auth_credentials_encrypted}`;
            } else if (this.config.auth_type === 'api_key') {
                // Assuming api_key might be in headers or query, implementation depends on requirement.
                // We'll stick to headers for now.
                headers['x-api-key'] = this.config.auth_credentials_encrypted;
            }

            // URL Parameter Substitution
            // Replace :param or {param} in the URL
            for (const [key, value] of Object.entries(params)) {
                if (url.includes(`:${key}`)) {
                    url = url.replace(`:${key}`, encodeURIComponent(value));
                } else if (url.includes(`{${key}}`)) {
                    url = url.replace(`{${key}}`, encodeURIComponent(value));
                }
            }

            const axiosConfig = {
                method,
                url,
                headers,
                timeout: this.config.timeout_ms || 10000
            };

            if (method === 'GET' || method === 'DELETE') {
                axiosConfig.params = params; // Params as query string for GET
            } else {
                axiosConfig.data = params; // Params as body for POST/PUT
            }

            const response = await axios(axiosConfig);

            // Limit response size to prevent context overflow
            const responseData = JSON.stringify(response.data).substring(0, 5000);

            return responseData;

        } catch (error) {
            console.error(`Tool Execution Error (${this.name}):`, error.message);
            const status = error.response?.status || 500;
            const msg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
            return JSON.stringify({ error: msg, status });
        }
    }

    /**
     * Returns the Gemini function declaration definition
     */
    getDefinition() {
        return {
            name: this.name,
            description: this.description,
            parameters: {
                type: "OBJECT",
                properties: this.parameters.properties || {},
                required: this.parameters.required || []
            }
        };
    }
}

module.exports = CompanyAPITool;
