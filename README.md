# n8n-nodes-pantherahive

[![npm version](https://badge.fury.io/js/n8n-nodes-pantherahive.svg)](https://www.npmjs.com/package/n8n-nodes-pantherahive)

[n8n](https://n8n.io) community nodes for **[PantheraHive](https://pantherahive.com)** — an AI workflow automation platform with built-in credit wallet management.

---

## Nodes

### PantheraHive

One node with four resources and six operations:

| Resource | Operation | Description |
|----------|-----------|-------------|
| **User** | Authenticate | Validate API key and return account details |
| **Wallet** | Get Balance | Get credit balance for a user |
| **Wallet** | Create | Create a wallet for a new user |
| **Wallet** | Deduct Credits | Deduct credits after a workflow runs |
| **Workflow** | Execute | Trigger a PantheraHive workflow |
| **Workflow** | Get Status | Poll the result of a workflow run |
| **Model** | Run AI Task | Send a prompt to Gemini/LLM and get a response |

---

## Installation

### Via n8n UI (Community Nodes)
1. Open your n8n instance
2. Go to **Settings → Community Nodes**
3. Click **Install**
4. Enter `n8n-nodes-pantherahive`
5. Click **Install**

### Via npm (self-hosted)
```bash
npm install n8n-nodes-pantherahive
```

---

## Credentials

Add a **PantheraHive API** credential with:

| Field | Description |
|-------|-------------|
| **API Key** | Your PantheraHive API key (Settings → API Keys) |
| **Base URL** | `https://pantherahive.com` (or your self-hosted URL) |

The credential is automatically tested against `GET /api/make/health` on save.

---

## Example Workflow

### Workflow: Execute → Deduct Credits

```
Trigger → [PantheraHive: Workflow/Execute] → [PantheraHive: Wallet/Deduct Credits]
```

**Step 1 — Execute Workflow:**
- Resource: `Workflow`
- Operation: `Execute`
- Workflow ID: `wf_seo_audit_v2`
- User ID: `{{ $json.userId }}`
- Inputs: `{ "url": "{{ $json.siteUrl }}" }`

**Step 2 — Deduct Credits:**
- Resource: `Wallet`
- Operation: `Deduct Credits`
- User ID: `{{ $json.userId }}`
- Credits to Deduct: `5`
- Workflow ID: `{{ $('PantheraHive').item.json.runId }}`

---

## API Endpoints Used

All nodes call the PantheraHive API at your configured Base URL:

| Endpoint | Method | Node |
|----------|--------|------|
| `/api/make/health` | GET | Credential test |
| `/api/make/authenticate` | POST | User: Authenticate |
| `/api/make/wallet/balance` | GET | Wallet: Get Balance |
| `/api/make/wallet/create` | POST | Wallet: Create |
| `/api/make/wallet/deduct` | POST | Wallet: Deduct Credits |
| `/api/make/execute-workflow` | POST | Workflow: Execute |
| `/api/make/workflow-status/:runId` | GET | Workflow: Get Status |
| `/api/make/model/run` | POST | Model: Run AI Task |

---

## Error Handling

All nodes surface structured error messages from the API. Enable **"Continue on fail"** in node settings to capture errors as output data instead of stopping the workflow.

---

## License

MIT © PantheraHive
