# BTP Setup

## Environment Variable Setup
In the `csrassistantdemo-srv` application (in the Cloud Foundry space), set the `GEMINI_MODEL_NAME` and `MODEL_PROVIDER` environment variables.

```
GEMINI_MODEL_NAME=gemini-1.0-pro
MODEL_PROVIDER=[OPENAI|GOOGLE]
```

**Note:** The first deployment may appear to fail if the application does not already exist and the environment variables are not set. If this happens:
1. Deploy the application.
2. After the failure, set the environment variables.
3. Manually start the application or deploy again.

---

## Destination Setup

### Destination: `sapawareaiassistantdestination_direct` (required)

| Property | Value | 
|---|---|
| Name | sapawareaiassistantdestination_direct |
| Type | HTTP | 
| Description | S/4 HANA 2022 | 
| URL | `http://s4hana2022.example.com:50000` | 
| Proxy Type | Internet | 
| Authentication | BasicAuthentication | 
| User | `[user]` |
| Password | `[password]` |

#### Additional Properties

| Property | Value | 
|---|---|
| HTML5.DynamicDestination | true |
| HTML5.Timeout | 1000000 |
| sap-client | 100 |
| WebIDEEnabled | true |
| WebIDEUsage | `odata_abap,dev_abap` |

### Destination: `AICore-ChatGPT35` (required)

| Property | Value | 
|---|---|
| Name | AICore-ChatGPT35 |
| Type | HTTP |
| Description | ChatGPT 3.5 |
| URL | Deployment URL (e.g. `https://api.ai.prod.us-east-1.aws.ml.hana.ondemand.com/v2/inference/deployments/db37bf2d8f9bef51`) |
| Proxy Type | Internet |
| Authentication | OAuth2ClientCredentials |
| Client ID | `[client id]` |
| Client Secret | `[client secret]` |
| Token Service URL | `[token service URL]` |
| Token Service User | `[token service user]` |
| Token Service Password | `[token service password]` |

#### Additional Properties

| Property | Value |
|---|---|
| HTML5.DynamicDestination | true |
| HTML5.Timeout | 1000000 |
| sap-client | 100 |
| WebIDEEnabled | true |
| WebIDEUsage | `odata_abap,dev_abap` |

### Destination: `AICore-Gemini1Pro` (required)

| Property | Value |
|---|---|
| Name | AICore-Gemini1Pro |
| Type | HTTP |
| Description | Gemini Pro 1.0 |
| URL | Deployment URL (e.g. `https://api.ai.prod.us-east-1.aws.ml.hana.ondemand.com/v2/inference/deployments/db37bf2d8f9bef51`) |
| Proxy Type | Internet |
| Authentication | OAuth2ClientCredentials |
| Client ID | `[client id]` |
| Client Secret | `[client secret]` |
| Token Service URL | `[token service URL]` |
| Token Service User | `[token service user]` |
| Token Service Password | `[token service password]` |

#### Additional Properties

| Property | Value |
|---|---|
| HTML5.DynamicDestination | true |
| HTML5.Timeout | 1000000 |
| sap-client | 100 |
| WebIDEEnabled | true |
| WebIDEUsage | `odata_abap,dev_abap` |

### Destination: `CSRDEMO`

| Property | Value | Notes |
|---|---|---|
| Name | CSRDEMO |
| Type | HTTP |
| Description | Consume CAPM DB |
| URL | `https://example.com/csrassist` | *Specific to your subaccount* |
| Proxy Type | Internet |
| Authentication | OAuth2JWTBearer |
| Client ID | `[client id]` |
| Client Secret | `[client secret]` |
| Token Service URL Type | Dedicated |
| Token Service URL | `(https://[subaccount].authentication.us10.hana.ondemand.com/oauth/token)` | *Specific to your subaccount* |

#### Additional Properties

| Property | Value |
|---|---|
| HTML5.DynamicDestination | true |
| TrustAll | true |
| WebIDEEnabled | true |
| WebIDEUsage | `odata_gen` |

**Retrieve Client ID and Secret** from the `csrassistantdemo-srv` application running in the Cloud Foundry space (Service Bindings, Show Sensitive Data).

---

## How to Run This Demo in Hybrid Mode

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

---

## How to Run This Demo Locally

Configure the destinations in the `.cdsrc-private.json` file as follows:

```json
{
  "requires": {
    "APIBusinessPartner": {
      "kind": "odata-v2",
      "model": "srv/external/APIBusinessPartner",
      "[development]": {
        "credentials": {
          "url": "http://username:password@s4hana2022.example.com:50000/sap/opu/odata/sap/API_BUSINESS_PARTNER"
        }
      }
    }
  }
}
```

Then run:

```
npm run start
```

---

## Example Demo Script

```
Hi, I'm John from Sky Mart

Hi John, what can I do for you today?

I'd like to know about my current invoices.

Great - I can see your 5 most recent invoices from February, May, and June. Which one would you like to know about?

I'm interested in the invoice with amount 17160.

Great, that invoice has a quantity of 39 C900 bikes.
```

---

## How to Configure New Capabilities

To add a new service, update `package.json` and add an entry to `capabilities.js` following this structure:

```js
/**
 * @typedef {Object} TopicConfiguration
 * @property {string} topic - The keyword that triggers this configuration.
 * @property {string} description - A description of the data.
 * @property {string} service - The name of the service.
 * @property {string} request - The API request string.
 */
```

