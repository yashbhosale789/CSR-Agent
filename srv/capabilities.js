module.exports = [
    {
      "topic": "salesorder",
      "description": "Sales Order",
      "descriptionPlural": "Sales Orders",
      "service": "API_SALES_ORDER_SRV",
      "request": "A_SalesOrder?$top=5&$select=SalesOrder,SalesOrderType,SoldToParty,CreationDate,TotalNetAmount,TransactionCurrency",
      "memory": [
        {
          "key": "lastSalesOrderNumber",
          "resultsProperty": "SalesOrder"
        }
      ],
      "header": {
        "column1": "Sales Order",
        "column2": "Order Type",
        "column3": "Customer",
        "column4": "Creation Date",
        "column5": "Net Amount"
      },
      "data": {
        "column1": ["SalesOrder"],
        "column2": ["SalesOrderType"],
        "column3": ["SoldToParty"],
        "column4": ["CreationDate"],
        "column5": ["TotalNetAmount"],
        "semanticObject": "SalesOrder",
        "action": "displayFactSheet",
        "parameter": "SalesOrder"
      }
    },
    {
      "topic": "salesorderitem",
      "description": "Sales Order Item of ${extractedData}",
      "descriptionPlural": "Sales Order Items of ${extractedData}",
      "service": "API_SALES_ORDER_SRV",
      "request": "A_SalesOrderItem?$filter=SalesOrder eq '${extractedData}'&$select=SalesOrder,SalesOrderItem,Material,RequestedQuantity,NetAmount,TransactionCurrency",
      "memory": [
        {
          "key": "lastSalesOrder",
          "extractedData": true
        }
      ],
      "header": {
        "column1": "Item",
        "column2": "Material",
        "column3": "Quantity",
        "column4": "Net Amount",
        "column5": "Currency"
      },
      "data": {
        "column1": ["SalesOrderItem"],
        "column2": ["Material"],
        "column3": ["RequestedQuantity"],
        "column4": ["NetAmount"],
        "column5": ["TransactionCurrency"],
        "semanticObject": "Material",
        "action": "displayFactSheet",
        "parameter": "Material"
      }
    },
    {
      "topic": "customer",
      "description": "Sales Orders for Customer ${extractedData}",
      "descriptionPlural": "Sales Orders for Customer ${extractedData}",
      "service": "API_SALES_ORDER_SRV",
      "request": "A_SalesOrder?$filter=SoldToParty eq '${extractedData}'&$top=5&$select=SalesOrder,CreationDate,TotalNetAmount,TransactionCurrency,SalesOrderType",
      "memory": [
        {
          "key": "lastCustomerNumber",
          "extractedData": true
        }
      ],
      "header": {
        "column1": "Sales Order",
        "column2": "Creation Date",
        "column3": "Order Type",
        "column4": "Net Amount",
        "column5": "Currency"
      },
      "data": {
        "column1": ["SalesOrder"],
        "column2": ["CreationDate"],
        "column3": ["SalesOrderType"],
        "column4": ["TotalNetAmount"],
        "column5": ["TransactionCurrency"],
        "semanticObject": "SalesOrder",
        "action": "displayFactSheet",
        "parameter": "SalesOrder"
      }
    }
  ];