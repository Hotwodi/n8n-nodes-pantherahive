import {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  JsonObject,
  NodeApiError,
  NodeOperationError,
} from 'n8n-workflow';

export class PantheraHive implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'PantheraHive',
    name: 'pantheraHive',
    icon: 'file:pantherahive.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + " " + $parameter["resource"]}}',
    description:
      'Automate AI workflows, manage user wallets, and run AI models using the PantheraHive platform',
    defaults: {
      name: 'PantheraHive',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'pantheraHiveApi',
        required: true,
      },
    ],
    properties: [
      // ── Resource ────────────────────────────────────────────────────────────
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'User',
            value: 'user',
            description: 'Authenticate and manage users',
          },
          {
            name: 'Wallet',
            value: 'wallet',
            description: 'Manage user credit wallets',
          },
          {
            name: 'Workflow',
            value: 'workflow',
            description: 'Execute and monitor AI workflows',
          },
          {
            name: 'Model',
            value: 'model',
            description: 'Run AI models and tasks',
          },
        ],
        default: 'workflow',
      },

      // ── Operations: User ────────────────────────────────────────────────────
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['user'] } },
        options: [
          {
            name: 'Authenticate',
            value: 'authenticate',
            description: 'Validate API key and return account details',
            action: 'Authenticate a user',
          },
        ],
        default: 'authenticate',
      },

      // ── Operations: Wallet ──────────────────────────────────────────────────
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['wallet'] } },
        options: [
          {
            name: 'Get Balance',
            value: 'getBalance',
            description: 'Get credit balance for a user',
            action: 'Get wallet balance',
          },
          {
            name: 'Create',
            value: 'create',
            description: 'Create a wallet for a new user',
            action: 'Create a wallet',
          },
          {
            name: 'Deduct Credits',
            value: 'deduct',
            description: 'Deduct credits from a user wallet after a workflow runs',
            action: 'Deduct credits from wallet',
          },
        ],
        default: 'getBalance',
      },

      // ── Operations: Workflow ────────────────────────────────────────────────
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['workflow'] } },
        options: [
          {
            name: 'Execute',
            value: 'execute',
            description: 'Execute a PantheraHive workflow',
            action: 'Execute a workflow',
          },
          {
            name: 'Get Status',
            value: 'getStatus',
            description: 'Get the status and result of a workflow run',
            action: 'Get workflow status',
          },
        ],
        default: 'execute',
      },

      // ── Operations: Model ───────────────────────────────────────────────────
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['model'] } },
        options: [
          {
            name: 'Run AI Task',
            value: 'run',
            description: 'Send a prompt to an AI model and get a response',
            action: 'Run an AI task',
          },
        ],
        default: 'run',
      },

      // ════════════════════════════════════════════════════════════════════════
      // PARAMETERS: User → Authenticate
      // No extra params — uses credentials only
      // ════════════════════════════════════════════════════════════════════════

      // ════════════════════════════════════════════════════════════════════════
      // PARAMETERS: Wallet → Get Balance
      // ════════════════════════════════════════════════════════════════════════
      {
        displayName: 'User ID',
        name: 'walletUserId',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['wallet'], operation: ['getBalance'] } },
        default: '',
        description: 'The PantheraHive user ID to look up the wallet for',
        placeholder: '507f1f77bcf86cd799439011',
      },

      // ════════════════════════════════════════════════════════════════════════
      // PARAMETERS: Wallet → Create
      // ════════════════════════════════════════════════════════════════════════
      {
        displayName: 'User ID',
        name: 'walletCreateUserId',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['wallet'], operation: ['create'] } },
        default: '',
        description: 'The PantheraHive user ID to create a wallet for',
        placeholder: '507f1f77bcf86cd799439011',
      },
      {
        displayName: 'Initial Balance',
        name: 'initialBalance',
        type: 'number',
        displayOptions: { show: { resource: ['wallet'], operation: ['create'] } },
        default: 0,
        description: 'Starting credit balance for the new wallet (default 0)',
      },

      // ════════════════════════════════════════════════════════════════════════
      // PARAMETERS: Wallet → Deduct Credits
      // ════════════════════════════════════════════════════════════════════════
      {
        displayName: 'User ID',
        name: 'deductUserId',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['wallet'], operation: ['deduct'] } },
        default: '',
        description: 'The PantheraHive user ID whose credits to deduct',
        placeholder: '507f1f77bcf86cd799439011',
      },
      {
        displayName: 'Credits to Deduct',
        name: 'amount',
        type: 'number',
        required: true,
        displayOptions: { show: { resource: ['wallet'], operation: ['deduct'] } },
        default: 1,
        description: 'Number of credits to deduct from the wallet',
        typeOptions: { minValue: 1 },
      },
      {
        displayName: 'Workflow ID',
        name: 'deductWorkflowId',
        type: 'string',
        displayOptions: { show: { resource: ['wallet'], operation: ['deduct'] } },
        default: '',
        description: 'Workflow ID that triggered this deduction — used for audit trail',
      },
      {
        displayName: 'Reason',
        name: 'deductReason',
        type: 'string',
        displayOptions: { show: { resource: ['wallet'], operation: ['deduct'] } },
        default: '',
        description: 'Optional human-readable reason for this deduction',
      },

      // ════════════════════════════════════════════════════════════════════════
      // PARAMETERS: Workflow → Execute
      // ════════════════════════════════════════════════════════════════════════
      {
        displayName: 'Workflow ID',
        name: 'workflowId',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['workflow'], operation: ['execute'] } },
        default: '',
        description: 'The ID of the PantheraHive workflow to execute',
        placeholder: 'wf_seo_audit_v2',
      },
      {
        displayName: 'User ID',
        name: 'executeUserId',
        type: 'string',
        displayOptions: { show: { resource: ['workflow'], operation: ['execute'] } },
        default: '',
        description: 'The user on whose behalf to run the workflow (for credit tracking)',
      },
      {
        displayName: 'Inputs',
        name: 'inputs',
        type: 'json',
        displayOptions: { show: { resource: ['workflow'], operation: ['execute'] } },
        default: '{}',
        description:
          'JSON object of input parameters to pass to the workflow. Example: {"url":"https://example.com"}',
        typeOptions: { rows: 4 },
      },

      // ════════════════════════════════════════════════════════════════════════
      // PARAMETERS: Workflow → Get Status
      // ════════════════════════════════════════════════════════════════════════
      {
        displayName: 'Run ID',
        name: 'runId',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['workflow'], operation: ['getStatus'] } },
        default: '',
        description: 'The run ID returned by the "Execute Workflow" operation',
      },

      // ════════════════════════════════════════════════════════════════════════
      // PARAMETERS: Model → Run AI Task
      // ════════════════════════════════════════════════════════════════════════
      {
        displayName: 'Prompt',
        name: 'prompt',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['model'], operation: ['run'] } },
        default: '',
        description: 'The prompt or task to send to the AI model',
        typeOptions: { rows: 5 },
        placeholder: 'Write a product description for a noise-cancelling headphone...',
      },
      {
        displayName: 'Model',
        name: 'model',
        type: 'options',
        displayOptions: { show: { resource: ['model'], operation: ['run'] } },
        options: [
          { name: 'Default (Platform Choice)', value: 'default' },
          { name: 'Gemini 2.5 Pro', value: 'gemini-2.5-pro' },
          { name: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash' },
        ],
        default: 'default',
        description: 'The AI model to use for this task',
      },
      {
        displayName: 'System Prompt',
        name: 'systemPrompt',
        type: 'string',
        displayOptions: { show: { resource: ['model'], operation: ['run'] } },
        default: '',
        description: 'Optional system/context prompt prepended before the user prompt',
        typeOptions: { rows: 3 },
      },
      {
        displayName: 'Max Tokens',
        name: 'maxTokens',
        type: 'number',
        displayOptions: { show: { resource: ['model'], operation: ['run'] } },
        default: 2048,
        description: 'Maximum number of tokens to generate (1–8192)',
        typeOptions: { minValue: 1, maxValue: 8192 },
      },
      {
        displayName: 'User ID',
        name: 'modelUserId',
        type: 'string',
        displayOptions: { show: { resource: ['model'], operation: ['run'] } },
        default: '',
        description: 'Optional user ID for credit tracking and audit',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    const credentials = await this.getCredentials('pantheraHiveApi');
    const baseUrl = ((credentials.baseUrl as string) || 'https://pantherahive.com').replace(/\/$/, '');

    for (let i = 0; i < items.length; i++) {
      const resource = this.getNodeParameter('resource', i) as string;
      const operation = this.getNodeParameter('operation', i) as string;

      let responseData: Record<string, unknown>;

      try {
        // ── User: Authenticate ─────────────────────────────────────────────
        if (resource === 'user' && operation === 'authenticate') {
          responseData = (await this.helpers.httpRequestWithAuthentication.call(this, 'pantheraHiveApi', {
            method: 'POST',
            url: `${baseUrl}/api/make/authenticate`,
            json: true,
          })) as Record<string, unknown>;
        }

        // ── Wallet: Get Balance ────────────────────────────────────────────
        else if (resource === 'wallet' && operation === 'getBalance') {
          const userId = this.getNodeParameter('walletUserId', i) as string;
          if (!userId) throw new NodeOperationError(this.getNode(), 'User ID is required', { itemIndex: i });

          responseData = (await this.helpers.httpRequestWithAuthentication.call(this, 'pantheraHiveApi', {
            method: 'GET',
            url: `${baseUrl}/api/make/wallet/balance`,
            qs: { userId },
            json: true,
          })) as Record<string, unknown>;
        }

        // ── Wallet: Create ─────────────────────────────────────────────────
        else if (resource === 'wallet' && operation === 'create') {
          const userId = this.getNodeParameter('walletCreateUserId', i) as string;
          const initialBalance = this.getNodeParameter('initialBalance', i) as number;
          if (!userId) throw new NodeOperationError(this.getNode(), 'User ID is required', { itemIndex: i });

          responseData = (await this.helpers.httpRequestWithAuthentication.call(this, 'pantheraHiveApi', {
            method: 'POST',
            url: `${baseUrl}/api/make/wallet/create`,
            body: { userId, initialBalance },
            json: true,
          })) as Record<string, unknown>;
        }

        // ── Wallet: Deduct Credits ─────────────────────────────────────────
        else if (resource === 'wallet' && operation === 'deduct') {
          const userId = this.getNodeParameter('deductUserId', i) as string;
          const amount = this.getNodeParameter('amount', i) as number;
          const workflowId = this.getNodeParameter('deductWorkflowId', i) as string;
          const reason = this.getNodeParameter('deductReason', i) as string;

          if (!userId) throw new NodeOperationError(this.getNode(), 'User ID is required', { itemIndex: i });
          if (!amount || amount < 1) throw new NodeOperationError(this.getNode(), 'Credits to deduct must be at least 1', { itemIndex: i });

          responseData = (await this.helpers.httpRequestWithAuthentication.call(this, 'pantheraHiveApi', {
            method: 'POST',
            url: `${baseUrl}/api/make/wallet/deduct`,
            body: { userId, amount, workflowId: workflowId || undefined, reason: reason || undefined },
            json: true,
          })) as Record<string, unknown>;
        }

        // ── Workflow: Execute ──────────────────────────────────────────────
        else if (resource === 'workflow' && operation === 'execute') {
          const workflowId = this.getNodeParameter('workflowId', i) as string;
          const userId = this.getNodeParameter('executeUserId', i) as string;
          const inputsStr = this.getNodeParameter('inputs', i) as string;

          if (!workflowId) throw new NodeOperationError(this.getNode(), 'Workflow ID is required', { itemIndex: i });

          let inputs: Record<string, unknown> = {};
          try {
            inputs = JSON.parse(inputsStr || '{}');
          } catch (_) {
            throw new NodeOperationError(this.getNode(), 'Inputs must be valid JSON', { itemIndex: i });
          }

          responseData = (await this.helpers.httpRequestWithAuthentication.call(this, 'pantheraHiveApi', {
            method: 'POST',
            url: `${baseUrl}/api/make/execute-workflow`,
            body: { workflowId, userId: userId || undefined, inputs },
            json: true,
          })) as Record<string, unknown>;
        }

        // ── Workflow: Get Status ───────────────────────────────────────────
        else if (resource === 'workflow' && operation === 'getStatus') {
          const runId = this.getNodeParameter('runId', i) as string;
          if (!runId) throw new NodeOperationError(this.getNode(), 'Run ID is required', { itemIndex: i });

          responseData = (await this.helpers.httpRequestWithAuthentication.call(this, 'pantheraHiveApi', {
            method: 'GET',
            url: `${baseUrl}/api/make/workflow-status/${encodeURIComponent(runId)}`,
            json: true,
          })) as Record<string, unknown>;
        }

        // ── Model: Run AI Task ─────────────────────────────────────────────
        else if (resource === 'model' && operation === 'run') {
          const prompt = this.getNodeParameter('prompt', i) as string;
          const model = this.getNodeParameter('model', i) as string;
          const systemPrompt = this.getNodeParameter('systemPrompt', i) as string;
          const maxTokens = this.getNodeParameter('maxTokens', i) as number;
          const userId = this.getNodeParameter('modelUserId', i) as string;

          if (!prompt) throw new NodeOperationError(this.getNode(), 'Prompt is required', { itemIndex: i });

          responseData = (await this.helpers.httpRequestWithAuthentication.call(this, 'pantheraHiveApi', {
            method: 'POST',
            url: `${baseUrl}/api/make/model/run`,
            body: {
              prompt,
              model,
              systemPrompt: systemPrompt || undefined,
              maxTokens,
              userId: userId || undefined,
            },
            json: true,
          })) as Record<string, unknown>;
        }

        // ── Unknown operation ──────────────────────────────────────────────
        else {
          throw new NodeOperationError(
            this.getNode(),
            `Unknown operation: ${resource}/${operation}`,
            { itemIndex: i },
          );
        }

        returnData.push({ json: responseData as IDataObject, pairedItem: { item: i } });
      } catch (error: unknown) {
        const err = error as Error & { statusCode?: number; response?: { body?: string } };

        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: err.message || 'Unknown error',
              resource,
              operation,
            },
            pairedItem: { item: i },
          });
          continue;
        }

        // Surface structured API error messages
        if (err.response?.body) {
          try {
            const body = JSON.parse(err.response.body);
            if (body.error) {
              throw new NodeApiError(this.getNode(), error as JsonObject, {
                message: `PantheraHive: ${body.error}`,
                description: `Resource: ${resource}, Operation: ${operation}`,
              });
            }
          } catch (_parseErr) {
            // fall through
          }
        }

        throw new NodeApiError(this.getNode(), error as JsonObject, {
          message: `PantheraHive ${resource}/${operation} failed: ${err.message}`,
        });
      }
    }

    return [returnData];
  }
}
