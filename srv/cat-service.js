const cds = require('@sap/cds');
const geminiAI = require('./geminiAI'); // Importing the Gemini module
const capabilities = require('./capabilities');
require('dotenv').config();

module.exports = async function () {

    var dataMemory = {};

    function populateMemory(user) {
        dataMemory[user.id] = {
            lastCustomer: undefined,
            lastCustomerNumber: undefined,
            lastInvoice: undefined,
            invoices: [], // Corrected initialization
            lastRequest: {
                type: undefined,
                value: undefined,
            },
        };
    }

    function getMemory(user) {
        if (!dataMemory[user.id]) populateMemory(user);
        return dataMemory[user.id];
    }

    function updateMemory(user, capability, response) {
        const memory = getMemory(user);

        if (capability.memory) {
            capability.memory.forEach(mem => {
                // Use dataType to determine what to store
                if (response.dataType === 'customer' && mem.key === 'lastCustomerNumber') {
                     memory[mem.key] = response.extractedData;
                } else if(response.dataType === 'salesorder' && mem.key === 'lastInvoice') {
                    memory[mem.key] = response.extractedData;
                }
                // ... add other memory update logic based on dataType ...

                else if (mem.resultsProperty && response.table && response.table.length > 0) {
                    memory[mem.key] = response.table[0][mem.resultsProperty]; // get first item
                }
            });
        }

        memory.lastRequest = {
            type: "topic",
            value: capability.topic
        };
    }
    this.on("READ", "Context", (req) => {
        var mem = getMemory(req.user);
        return {
            Customer: mem.lastCustomer,
            CustomerNumber: mem.lastCustomerNumber,
            InvoiceNumber: mem.lastInvoice,
            Topic: mem.lastRequest.type === "topic" ? mem.lastRequest.value : "",
        };
    });

    this.on("respond", async (req) => {
        try {
            const conversation = req.data.transcript;

            // Get AI response from Gemini
            const response = await geminiAI.generateResponse(conversation);

            if (!response || !response.topic) {
                return {
                    header: {},
                    table: [], // Corrected initialization
                    headerText: "I couldn't understand that. Could you please rephrase?"
                };
            }

            if (response.topic === 'smalltalk') {
                return {
                    header: {},
                    table: [], // Corrected initialization
                    headerText: response.response // Use Gemini's response for smalltalk
                };
            }

            // Find matching capability
            const capability = capabilities.find(cap => cap.topic === response.topic);

            if (!capability) {
                return {
                    header: {},
                    table: [], // Corrected initialization
                    headerText: "I can help you with sales orders, items, and customer information. What would you like to know?"
                };
            }

            try {
                // Replace placeholders in request (robust handling of multiple numbers)
                let query = capability.request;
                if (response.extractedData) {
                    const numbers = response.extractedData.split(',');
                    numbers.forEach((number, index) => {
                        // Use a regular expression to replace ALL occurrences
                        const placeholder = new RegExp(`\\$\\{extractedData\\.?${index ? index : ''}\\}`, 'g');
                         query = query.replace(placeholder, number);
                    });
                }
                //Handle cases where no number is extracted
                query = query.replace(/\$\{extractedData\.?\d*\}/g, '');

                // Execute query
                const results = await executeQuery(query);

                // Format response according to capability definition
                const formattedResponse = formatResponse(results, capability);

                // Update memory with new data
                updateMemory(req.user, capability, {
                    ...response,
                    ...formattedResponse
                });

                return formattedResponse;
            } catch (queryError) {
                console.error('Error executing query:', queryError);
                return {
                    header: {},
                    table: [], // Corrected initialization
                    headerText: "I encountered an error while fetching the data. Please try again."
                };
            }

        } catch (error) {
            console.error('Error in respond handler:', error);
            return {
                header: {},
                table: [], // Corrected initialization
                headerText: "I encountered an error. Please try again."
            };
        }
    });

    // Helper functions
    async function executeQuery(query) {
        try {
            const tx = cds.transaction();
            const results = await tx.run(query); // Await the query execution
            await tx.commit(); // Add commit
            return results;
        } catch (error) {
            console.error('Error executing query:', error);
            return []; // Return an empty array on error
        }
    }

    function formatResponse(results, capability) {
        if (!Array.isArray(results)) {
            results = []; // Corrected empty array initialization
        }

        return {
            header: capability.header || {},
            table: results.map((item, index) => ({
                row: index + 1,
                column1: capability.data.column1 && item[capability.data.column1] || '',
                column2: capability.data.column2 && item[capability.data.column2] || '',
                column3: capability.data.column3 && item[capability.data.column3] || '',
                column4: capability.data.column4 && item[capability.data.column4] || '',
                column5: capability.data.column5 && item[capability.data.column5] || '',
                semanticObject: capability.data.semanticObject || '',
                action: capability.data.action || '',
                parameter: item[capability.data.parameter] || ''
            })),
            headerText: capability.description ?
                `Showing results for ${capability.description}` :
                'Showing results'
        };
    }
};