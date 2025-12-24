const { GoogleGenerativeAI } = require("@google/generative-ai");
const retrievalService = require('./retrievalService');
const conversationService = require('./conversationService');

// Initialize Gemini Pro
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
// Global model init removed in favor of per-request init for tools

/**
 * Main RAG Execution Flow.
 * @param {String} companyId 
 * @param {String} visitorId 
 * @param {String} userQuery 
 * @param {String} platform
 * @param {String} botId
 * @returns {Promise<Object>}
 */
const executeRAGChatbot = async (companyId, visitorId, userQuery, platform = 'web', botId = null) => {
    try {
        // 1. Get Conversation Context
        const conversation = await conversationService.getOrCreateConversation(companyId, visitorId, platform, botId);

        // 2. Add User Message to History
        await conversationService.addMessage(conversation.id, 'user', userQuery);

        console.log(`Processing RAG for Bot:${botId} / Conv:${conversation.id} / Q:${userQuery}`);

        // 3. Retrieve Relevant Documents (RAG Context)
        const similarChunks = await retrievalService.searchParams(companyId, userQuery, botId, 30);
        const contextText = retrievalService.formatContext(similarChunks);
        console.log(`Retrieved ${similarChunks.length} chunks`);

        const { Bot, CompanyApi } = require('../models');
        const { CompanyAPITool } = require('./tools/CompanyAPITool');
        const bot = await Bot.findByPk(botId);
        if (!bot) throw new Error('Bot not found');

        // 4. Load Company Tools for this Bot
        const companyApis = await CompanyApi.findAll({
            where: { company_id: companyId, bot_id: botId, is_active: true }
        });

        const toolsMap = new Map();
        const geminiTools = [];

        if (companyApis.length > 0) {
            const functionDeclarations = companyApis.map(api => {
                const tool = new CompanyAPITool(api.toJSON());
                toolsMap.set(tool.name, tool);
                return tool.getDefinition();
            });
            geminiTools.push({ functionDeclarations });
        }

        // 5. Construct System Prompt
        const systemPrompt = `You are ${bot.name}. ${bot.description || ''}
${bot.system_prompt || 'You are a helpful AI assistant.'}

Use the following context to answer the user's question. 
If the answer is not in the context, check if you have any available tools that can help.
If no tools or context apply, politely urge the user to contact human support.
Keep answers concise and professional.

Context:
${contextText}
`;

        // 6. Generate Response with Tools
        // Initialize model with tools
        const chatModel = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            tools: geminiTools.length > 0 ? geminiTools : undefined,
            systemInstruction: systemPrompt // Newer SDK supports systemInstruction
        });

        const chat = chatModel.startChat({
            history: [
                // We could load previous history here from conversationService.getHistory if we want multi-turn memory
            ]
        });

        let result = await chat.sendMessage(userQuery);
        let response = await result.response;
        let functionCalls = response.functionCalls();

        // Handle Tool execution loop (Simple 1-turn loop for now, supports multiple serial calls)
        const maxTurns = 5;
        let turns = 0;
        let apiDataUsed = [];

        while (functionCalls && functionCalls.length > 0 && turns < maxTurns) {
            turns++;
            const functionResponses = [];

            for (const call of functionCalls) {
                const toolName = call.name;
                const toolArgs = call.args;

                console.log(`Calling Function: ${toolName}`, toolArgs);

                if (toolsMap.has(toolName)) {
                    const tool = toolsMap.get(toolName);
                    const apiResult = await tool.execute(toolArgs);

                    apiDataUsed.push({ tool: toolName, args: toolArgs, result: JSON.parse(apiResult) });

                    functionResponses.push({
                        functionResponse: {
                            name: toolName,
                            response: { content: apiResult }
                        }
                    });
                } else {
                    console.error(`Tool not found: ${toolName}`);
                    functionResponses.push({
                        functionResponse: {
                            name: toolName,
                            response: { error: "Tool not found" }
                        }
                    });
                }
            }

            // Send tool outputs back to model
            result = await chat.sendMessage(functionResponses);
            response = await result.response;
            functionCalls = response.functionCalls();
        }

        const responseText = response.text();

        // 7. Save Assistant Response
        await conversationService.addMessage(conversation.id, 'assistant', responseText, {
            rag_context: similarChunks,
            api_data: apiDataUsed.length > 0 ? apiDataUsed : null
        });

        return {
            response: responseText,
            conversationId: conversation.id,
            tools_used: apiDataUsed.length
        };

    } catch (error) {
        console.error('RAG Execution Error:', error);
        throw error;
    }
};

module.exports = {
    executeRAGChatbot
};
