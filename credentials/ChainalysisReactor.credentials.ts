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

export class ChainalysisReactor implements ICredentialType {
  name = 'chainalysisReactor';
  displayName = 'Chainalysis Reactor';
  documentationUrl = 'https://docs.chainalysis.com/reactor/';
  properties: INodeProperties[] = [
    {
      displayName: 'Reactor API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'Your Chainalysis Reactor API key',
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
      displayName: 'Graph API Endpoint',
      name: 'graphEndpoint',
      type: 'string',
      default: 'https://reactor.chainalysis.com/api',
      description: 'Reactor Graph API endpoint',
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
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        'X-API-Key': '={{$credentials.apiKey}}',
        'X-Organization-ID': '={{$credentials.organizationId}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.graphEndpoint || "https://reactor.chainalysis.com/api"}}',
      url: '/v1/investigations',
      method: 'GET',
      qs: {
        limit: 1,
      },
    },
  };
}
