const { GoogleGenerativeAI } = require('@google/generative-ai');
const { systemPrompt, analyzePrompt, responsePrompt } = require('./prompts');
const { interpolateTemplate } = require('./util');
require('dotenv').config();

class GeminiAI {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        if (!this.apiKey) {
            throw new Error("GEMINI_API_KEY environment variable not set.");
        }
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        this.model = null; // Initialize model
        this.initializeModel();
    }

    async initializeModel() {
        try {
            // Attempt Gemini 2.0 Flash (replace with your actual model name IF you have it)
            this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            console.log('Gemini 2.0 Flash model initialized (if available).');
        } catch (flashError) {
            console.warn('Gemini 2.0 Flash model initialization failed:', flashError.message);
            console.warn('Falling back to Gemini 1.5 Pro.');
            try {
                this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
                console.log('Gemini 1.5 Pro model initialized.');
            } catch (proError) {
                console.error('Error initializing Gemini 1.5 Pro:', proError);
                throw new Error("Failed to initialize any Gemini model."); // Critical error
            }
        }
    }

    extractNumbers(text) {
        const matches = text.match(/\b\d{10}\b/g); // 'g' for all matches
        return matches ? matches.join(',') : ''; // Comma-separated string
    }

    async analyzeText(text) {
        try {
            const prompt = interpolateTemplate(analyzePrompt, { text });

            const result = await this.model.generateContent(prompt);
            const response = result.response;
            let parsed;

            try {
                parsed = JSON.parse(response.text());
            } catch (parseError) {
                console.error("Error parsing Gemini response:", parseError);
                console.error("Response text:", response.text()); // Log the raw response
                return this.fallbackAnalysis(text);
            }

            // Validate parsed response (defensive programming)
            if (typeof parsed !== 'object' || parsed === null || !parsed.topic) {
                console.error("Invalid Gemini response format:", parsed);
                return this.fallbackAnalysis(text);
            }

            return {
                topic: parsed.topic,
                extractedData: parsed.extractedData || this.extractNumbers(text), // Fallback extraction
                tokens: Array.isArray(parsed.tokens) ? parsed.tokens : [] // Ensure tokens is an array
            };
        } catch (error) {
            console.error('Text analysis error:', error);
            return this.fallbackAnalysis(text);
        }
    }

    fallbackAnalysis(text) {
        const words = text.toLowerCase().split(/\s+/); // Split on any whitespace
        const numberMatch = this.extractNumbers(text);
        let topic = 'smalltalk';
        let dataType = '';

        if (words.includes('sales') && words.includes('order')) {
            topic = 'salesorder';
            dataType = 'salesorder';
        } else if (words.includes('items') || words.includes('item')) {
            topic = 'salesorderitem';
            dataType = 'salesorder';
        } else if (words.includes('customer')) {
            topic = 'customer';
            dataType = 'customer';
        }

        return {
            topic,
            extractedData: numberMatch,
            dataType,
            tokens: words.filter(word => !['sales', 'order', 'items', 'item', 'customer'].includes(word))
        };
    }

    async generateResponse(conversation) {
        try {
            const analysis = await this.analyzeText(conversation);

            const prompt = interpolateTemplate(responsePrompt, {
                topic: analysis.topic,
                text: conversation,
                reference: analysis.extractedData || 'none provided'
            });

            const result = await this.model.generateContent(prompt);
            const response = result.response;

            return {
                topic: analysis.topic,
                extractedData: analysis.extractedData,
                dataType: analysis.dataType || this.determineDataType(analysis.topic),
                response: response.text().trim(),
                tokens: analysis.tokens
            };
        } catch (error) {
            console.error('Response generation error:', error);
            // Fallback to a generic "I'm sorry" response in case of generation errors
            return {
                topic: 'smalltalk',
                extractedData: '',
                dataType: '',
                response: "I'm sorry, I encountered an error and couldn't process your request.  Please try again.",
                tokens: []
            };
        }
    }

    determineDataType(topic) {
        switch (topic) {
            case 'salesorder':
            case 'salesorderitem':
                return 'salesorder';
            case 'customer':
                return 'customer';
            default:
                return '';
        }
    }
}

const geminiAI = new GeminiAI();

module.exports = geminiAI;