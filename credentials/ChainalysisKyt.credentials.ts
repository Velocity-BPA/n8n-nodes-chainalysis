/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class ChainalysisKyt implements ICredentialType {
  name = 'chainalysisKyt';
  displayName = 'Chainalysis KYT';
  documentationUrl = 'https://docs.chainalysis.com/kyt/';
  properties: INodeProperties[] = [
    {
      displayName: 'KYT API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'Your Chainalysis KYT API key',
    },
    {
      displayName: 'Organization ID',
      name: 'organizationId',
      type: 'string',
      default: '',
      required: true,
      description: 'Your Chainalysis organization ID',
    },
    {
      displayName: 'User ID',
      name: 'userId',
      type: 'string',
      default: '',
      description: 'Default user ID for KYT operations',
    },
    {
      displayName: 'Environment',
      name: 'environment',
      type: 'options',
      options: [
        {
          name: 'Production',
          value: 'production',
        },
        {
          name: 'Sandbox',
          value: 'sandbox',
        },
      ],
      default: 'production',
      description: 'API environment to use',
    },
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://api.chainalysis.com/kyt/v2',
      description: 'KYT API base URL',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Token: '={{$credentials.apiKey}}',
        'X-Organization-ID': '={{$credentials.organizationId}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.baseUrl || "https://api.chainalysis.com/kyt/v2"}}',
      url: '/users',
      method: 'GET',
      qs: {
        limit: 1,
      },
    },
  };
}
