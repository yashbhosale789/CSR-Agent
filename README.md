# BTP Setup

## Environment Variable Setup
In the csrassistantdemo-srv application (in the Cloud Foundry space), set the GEMINI_MODEL_NAME and MODEL_PROVIDER environment variables.

```
GEMINI_MODEL_NAME=gemini-1.0-pro
MODEL_PROVIDER=[OPENAI|GOOGLE]
```


Note: First deploy will appear to fail if the application doesn't already exist and the environment variables are therefore not set. Therefore, deploy and after the failure set the environment variables. Then either manually start the application or deploy again.

## Destination Setup
### Destination: sapawareaiassistantdestination_direct (required)
| TEXT | VALUE | 
|---|---|
| Name         | sapawareaiassistantdestination_direct|
| Type       | HTTP| 
| Description         | S/4 HANA 2022 | 
| URL      | http://s4hana2022.mindsetconsulting.com:50000 | 
| Proxy Type          | Internet  | 
| Authentication       | BasicAuthentication | 
| User          | [user]           | 
| Password      | [password]       | |

| Additional Properties | VALUE | 
|---|---|
| HTML5.DynamicDestination   | true|
| HTML5.Timeout      | 1000000| 
| sap-client         | 100| 
| WebIDEEnabled      |true | 
| WebIDEUsage      |odata_abap,dev_abap | 

### Destination: AICore-ChatGPT35 (required)
| TEXT | VALUE | 
|---|---|
| Name         |AICore-ChatGPT35|
| Type       | HTTP| 
| Description         | ChatGPT 3.5 | 
| URL      | Deployment URL (e.g. https://api.ai.prod.us-east-1.aws.ml.hana.ondemand.com/v2/inference/deployments/db37bf2d8f9bef51) | 
| Proxy Type          | Internet  | 
| Authentication       | OAuth2ClientCredentials | 
| Client ID          |            | 
| Client Secret      |        |
| Token Service URL      |        |
| Token Service User      |        |
| Token Service Password      |        |

| Additional Properties | VALUE | 
|---|---|
| HTML5.DynamicDestination   | true|
| HTML5.Timeout      | 1000000| 
| sap-client         | 100| 
| WebIDEEnabled      |true | 
| WebIDEUsage      |odata_abap,dev_abap | 

### Destination: AICore-Gemini1Pro (required)
| TEXT | VALUE | 
|---|---|
| Name         |AICore-Gemini1Pro|
| Type       | HTTP| 
| Description         | Gemini Pro 1.0 | 
| URL      | Deployment URL (e.g. https://api.ai.prod.us-east-1.aws.ml.hana.ondemand.com/v2/inference/deployments/db37bf2d8f9bef51) | 
| Proxy Type          | Internet  | 
| Authentication       | OAuth2ClientCredentials | 
| Client ID          |            | 
| Client Secret      |        |
| Token Service URL      |        |
| Token Service User      |        |
| Token Service Password      |        |

| Additional Properties | VALUE | 
|---|---|
| HTML5.DynamicDestination   | true|
| HTML5.Timeout      | 1000000| 
| sap-client         | 100| 
| WebIDEEnabled      |true | 
| WebIDEUsage      |odata_abap,dev_abap | 

### Destination: MINDSET_CSRDEMO
| TEXT | VALUE | Notes |
|---|---|---|
| Name         | MINDSET_CSRDEMO|
| Type       | HTTP| 
| Description         | Consume CAPM DB | 
| URL      | https://mindset-consulting--llc-mindsetbtpdev-btp-dev-csrassist2401bded.cfapps.us10.hana.ondemand.com/ | *specific to your subaccount
| Proxy Type          | Internet  | 
| Authentication       | OAuth2JWTBearer | 
| Client ID          | [client id]           | 
| Client Secret     | [client secret]  | 
| Token Service URL Type     | Dedicated  | 
| Token Service URL:     | (https://[subaccount].authentication.us10.hana.ondemand.com/oauth/token)  |  *specific to your subaccount

| Additional Properties | VALUE | 
|---|---|
| HTML5.DynamicDestination   | true|
| TrustAll      | true| 
| WebIDEEnabled         | true| 
| WebIDEUsage      |odata_gen | 


Retreive Client ID and Secret from the csrassistantdemo-srv application running in the Cloud Foundry space (Service Bindings, Show Sensitive Data)

# How to run this demo in Hybrid mode

```
npm install
cf login --sso
npm run start-hybrid
```

If not previously run, you may have to [bind services](https://cap.cloud.sap/docs/advanced/hybrid-testing#binding-user-provided-services).

```
cds bind -2 csrassistantdemoauth 
cf create-service-key csrassistantdemodestination csrassistantdemodestination-key
cds bind -2 csrassistantdemodestination
cf create-service-key csrassistantdemoconnectivity csrassistantdemoconnectivity-key
cds bind -2 csrassistantdemoconnectivity
```
# How to run this demo locally

Configure the destinations in the .cdsrc-private.json file similar to this:

```
{
  "requires": {
    "APIBusinessPartner": {
      "kind": "odata-v2",
      "model": "srv/external/APIBusinessPartner",
      "[development]": {
        "credentials": {
          "url": "http://username:password@s4hana2022.mindsetconsulting.com:50000/sap/opu/odata/sap/API_BUSINESS_PARTNER"
        }
      }
    },
    "API_BILLING_DOCUMENT_SRV_edmx": {
      "kind": "odata-v2",
      "model": "srv/external/API_BILLING_DOCUMENT_SRV.edmx",
      "[development]": {
        "credentials": {
          "url": "http://username:password@s4hana2022.mindsetconsulting.com:50000/sap/opu/odata/sap/API_BILLING_DOCUMENT_SRV"
        }
      }
    }
  }
}
```

Then run `npm run start`.

# Example demo script

One script that will work is below. However, you can improvise!

```
Hi, I'm John from Sky Mart

Hi John, what can I do for you today

I'd like to know about my current invoices

Great - I can see your 5 most recent invoices from February, May and June. Which one would you like to know about

I'm interested in the invoice with amount 17160

Great, that invoice has a quantity of 39 C900 bikes.

Hmmm - no, that's not the one. How about the invoice with amount 45120?

Sure, that one is for 376 Y200 bikes.

Great! What is the delivery status?

Looks like it was shipped on May 29th, so you should have it.

Ok, I'll look into that. Can you tell me about my other account with you - with BigMart company

Sure, I've got it here now. Do you want to look at recent invoices

Yes, the one in amount 34580 please
```

# How to configure new capabilities

If necessary, add a new service to the package.json, then add an entry to the `capabilities.js` file based on the following structure:

```
/**
 * @typedef {Object} TopicConfiguration
 * 
 * @property {string} topic - The keyword or phrase that triggers this configuration.
 * @property {string} description - A description of the data to be retrieved (may include placeholders like `${extractedData}`).
 * @property {string} descriptionPlural - The plural version of the description.
 * @property {string} service - The name of the service or API to be used (as configured in the package.json).
 * @property {string} request - The API request string (may include placeholders such as `${extractedData}` or values configured in the `requestInterpolationMapFunctions` array, and filters).
 * @property {Object[]} memory - An array of memory keys and the values to be stored against those keys. These can be used in the `topicMemoryFilter` and `requestInterpolationMapFunctions` of subsequent requests.
 * @property {Object} header - An object defining the column headers for display.
 * @property {Object} data - An object specifying how to map data from the API response to columns.
 * 
 * @property {function} [topicMemoryFilter] - An optional function to filter based on memory and extracted data.
 * @property {Object} [requestInterpolationMapFunctions] - Optional functions to interpolate values into the request string.
 */
 ```
#   C S R - A g e n t 
 
 
