import {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class PantheraHiveApi implements ICredentialType {
  name = 'pantheraHiveApi';
  displayName = 'PantheraHive API';
  documentationUrl = 'https://pantherahive.com/docs/api';
  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
      description: 'Your PantheraHive API key — found in Settings → API Keys',
    },
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://pantherahive.com',
      description: 'PantheraHive instance URL. Use https://pantherahive.com for the hosted platform.',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        'x-api-key': '={{$credentials.apiKey}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.baseUrl}}',
      url: '/api/make/health',
      method: 'GET',
    },
  };
}
