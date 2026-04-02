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

export class ChainalysisApi implements ICredentialType {
  name = 'chainalysisApi';
  displayName = 'Chainalysis API';
  documentationUrl = 'https://docs.chainalysis.com/';
  properties: INodeProperties[] = [
    {
      displayName: 'Product',
      name: 'product',
      type: 'options',
      options: [
        {
          name: 'Address Screening',
          value: 'addressScreening',
          description: 'Screen cryptocurrency addresses for risk',
        },
        {
          name: 'KYT (Know Your Transaction)',
          value: 'kyt',
          description: 'Transaction monitoring and compliance',
        },
        {
          name: 'Reactor',
          value: 'reactor',
          description: 'Investigation and graph analysis',
        },
        {
          name: 'Sanctions Screening',
          value: 'sanctions',
          description: 'OFAC, UN, EU sanctions screening',
        },
        {
          name: 'Transaction Monitoring',
          value: 'transactionMonitoring',
          description: 'Real-time transaction monitoring',
        },
        {
          name: 'Custom Endpoint',
          value: 'custom',
          description: 'Custom API endpoint',
        },
      ],
      default: 'addressScreening',
      description: 'Select the Chainalysis product to use',
    },
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'Your Chainalysis API key',
    },
    {
      displayName: 'API Secret',
      name: 'apiSecret',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'API secret (if required for your product)',
    },
    {
      displayName: 'Organization ID',
      name: 'organizationId',
      type: 'string',
      default: '',
      description: 'Your Chainalysis organization ID',
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
      default: 'https://api.chainalysis.com',
      placeholder: 'https://api.chainalysis.com',
      description:
        'Base URL for the API. Leave empty to use the default URL based on product selection.',
      displayOptions: {
        show: {
          product: ['custom'],
        },
      },
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        'X-API-Key': '={{$credentials.apiKey}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.baseUrl || "https://api.chainalysis.com"}}',
      url: '/api/v1/status',
      method: 'GET',
    },
  };
}