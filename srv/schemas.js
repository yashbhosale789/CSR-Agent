const originalSchema = { // Renamed bertOriginalSchema to originalSchema
    type: "object",
    properties: {
      dataType: {
        type: "string",
        description: "Type of data extracted from user input",
        enum: [
          "salesorder",
          "customer",
          "material",
          "amount",
          "date",
          "",
        ],
      },
      extractedData: {
        type: "string",
        description:
          "Extracted sales order number, customer ID, material number, or empty string. Should be a single value matching the dataType",
      },
      topic: {
        type: "string",
        description: "Main topic of the conversation",
        enum: [
          "salesorder",
          "salesorderitem",
          "customer",
          "smalltalk",
          "",
        ],
      },
    },
    required: ["dataType", "extractedData", "topic"],
  };
  
  const entityChoiceSchema = { // Renamed bertentityChoiceSchema to entityChoiceSchema
    type: "object",
    properties: {
      entities: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "A_SalesOrder",
            "A_SalesOrderItem",
            "A_SalesOrderHeaderPartner"
          ]
        },
        description: "Available SAP Sales Order entities"
      }
    },
    required: ["entities"]
  };
  
  const requestGenerationSchema = { // Renamed bertrequestGenerationSchema to requestGenerationSchema
    type: "object",
    properties: {
      entityPath: {
        type: "string",
        description: "OData entity path"
      },
      select: {
        type: "array",
        items: {
          type: "string"
        },
        description: "Properties to select"
      },
      filter: {
        type: "string",
        description: "OData filter expression"
      },
      top: {
        type: "number",
        description: "Number of records to return"
      }
    },
    required: ["entityPath"]
  };
  
  const responseSchema = {
    type: "object",
    properties: {
      topic: {
        type: "string",
        enum: ["salesorder", "salesorderitem", "customer", "smalltalk"],
        description: "Main topic of the conversation"
      },
      extractedData: {
        type: "string",
        pattern: "^\\d{10}$|^$",
        description: "Extracted 10-digit number or empty string"
      },
      dataType: {
        type: "string",
        enum: ["salesorder", "customer", ""],
        description: "Type of extracted data"
      },
      response: {
        type: "string",
        description: "AI generated response"
      },
      tokens: { // Added tokens field to the schema
        type: "array",
        items: {
          type: "string"
        },
        description: "Important keywords from the user query"
      }
    },
    required: ["topic", "extractedData", "dataType", "response", "tokens"] // Added tokens to required fields
  };
  
  module.exports = {
    originalSchema, // Updated the exported schema names
    entityChoiceSchema,
    requestGenerationSchema,
    responseSchema
  }