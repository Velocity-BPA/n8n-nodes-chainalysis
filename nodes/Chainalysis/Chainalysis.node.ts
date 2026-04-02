/**
 * Copyright (c) 2026 Velocity BPA
 * 
 * Licensed under the Business Source License 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://github.com/VelocityBPA/n8n-nodes-chainalysis/blob/main/LICENSE
 * 
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeApiError,
} from 'n8n-workflow';

export class Chainalysis implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Chainalysis',
    name: 'chainalysis',
    icon: 'file:chainalysis.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the Chainalysis API',
    defaults: {
      name: 'Chainalysis',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'chainalysisApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'AddressScreening',
            value: 'addressScreening',
          },
          {
            name: 'Transaction Monitoring',
            value: 'transactionMonitoring',
          },
          {
            name: 'SanctionsCompliance',
            value: 'sanctionsCompliance',
          },
          {
            name: 'Risk Assessment',
            value: 'riskAssessment',
          },
          {
            name: 'Address Intelligence',
            value: 'addressIntelligence',
          }
        ],
        default: 'addressScreening',
      },
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['addressScreening'] } },
  options: [
    { name: 'Screen Address', value: 'screenAddress', description: 'Screen a single address for sanctions and risk', action: 'Screen a single address' },
    { name: 'Bulk Screen Addresses', value: 'bulkScreenAddresses', description: 'Screen multiple addresses at once', action: 'Screen multiple addresses' },
    { name: 'Get Screening Result', value: 'getScreeningResult', description: 'Retrieve screening results by ID', action: 'Get screening result by ID' },
    { name: 'List Screenings', value: 'listScreenings', description: 'List historical screening results', action: 'List historical screening results' }
  ],
  default: 'screenAddress',
},
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['transactionMonitoring'],
		},
	},
	options: [
		{
			name: 'Monitor Transaction',
			value: 'monitorTransaction',
			description: 'Monitor a specific transaction for compliance and risk assessment',
			action: 'Monitor a transaction',
		},
		{
			name: 'Bulk Monitor Transactions',
			value: 'bulkMonitorTransactions',
			description: 'Monitor multiple transactions in a single request',
			action: 'Bulk monitor transactions',
		},
		{
			name: 'Get Monitoring Result',
			value: 'getMonitoringResult',
			description: 'Get results from a specific transaction monitoring request',
			action: 'Get monitoring result',
		},
		{
			name: 'List Monitorings',
			value: 'listMonitorings',
			description: 'List transaction monitoring history and status',
			action: 'List monitoring requests',
		},
	],
	default: 'monitorTransaction',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['sanctionsCompliance'],
    },
  },
  options: [
    {
      name: 'Check Sanctions',
      value: 'checkSanctions',
      description: 'Check address or entity against sanctions lists',
      action: 'Check sanctions',
    },
    {
      name: 'Get Sanctions Lists',
      value: 'getSanctionsLists',
      description: 'Get available sanctions lists and updates',
      action: 'Get sanctions lists',
    },
    {
      name: 'Get Sanctions Match',
      value: 'getSanctionsMatch',
      description: 'Get detailed sanctions match information',
      action: 'Get sanctions match',
    },
    {
      name: 'Add to Whitelist',
      value: 'addToWhitelist',
      description: 'Add address to compliance whitelist',
      action: 'Add to whitelist',
    },
  ],
  default: 'checkSanctions',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['riskAssessment'] } },
  options: [
    { name: 'Assess Risk', value: 'assessRisk', description: 'Assess risk level of address or transaction', action: 'Assess risk level of address or transaction' },
    { name: 'Get Risk Assessment', value: 'getRiskAssessment', description: 'Get risk assessment results by assessment ID', action: 'Get risk assessment results' },
    { name: 'Get Risk Categories', value: 'getRiskCategories', description: 'List available risk categories and scores', action: 'Get risk categories' },
    { name: 'Get Exposure Analysis', value: 'getExposureAnalysis', description: 'Analyze exposure to risky entities', action: 'Analyze exposure to risky entities' }
  ],
  default: 'assessRisk',
},
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['addressIntelligence'],
		},
	},
	options: [
		{
			name: 'Get Address Info',
			value: 'getAddressInfo',
			description: 'Get detailed information about an address',
			action: 'Get address info',
		},
		{
			name: 'Get Address Activity',
			value: 'getAddressActivity',
			description: 'Get transaction activity for an address',
			action: 'Get address activity',
		},
		{
			name: 'Get Address Clustering',
			value: 'getAddressClustering',
			description: 'Get address clustering and entity information',
			action: 'Get address clustering',
		},
		{
			name: 'Get Address Exposure',
			value: 'getAddressExposure',
			description: 'Get exposure analysis for an address',
			action: 'Get address exposure',
		},
	],
	default: 'getAddressInfo',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  default: '',
  description: 'The cryptocurrency address to screen',
  displayOptions: { show: { resource: ['addressScreening'], operation: ['screenAddress'] } },
},
{
  displayName: 'Asset',
  name: 'asset',
  type: 'string',
  required: true,
  default: 'BTC',
  description: 'The asset type (e.g., BTC, ETH, LTC)',
  displayOptions: { show: { resource: ['addressScreening'], operation: ['screenAddress'] } },
},
{
  displayName: 'Addresses',
  name: 'addresses',
  type: 'json',
  required: true,
  default: '[]',
  description: 'Array of address objects to screen. Format: [{"address": "addr1", "asset": "BTC"}, ...]',
  displayOptions: { show: { resource: ['addressScreening'], operation: ['bulkScreenAddresses'] } },
},
{
  displayName: 'Screening ID',
  name: 'screeningId',
  type: 'string',
  required: true,
  default: '',
  description: 'The ID of the screening result to retrieve',
  displayOptions: { show: { resource: ['addressScreening'], operation: ['getScreeningResult'] } },
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  default: 100,
  description: 'Maximum number of results to return',
  displayOptions: { show: { resource: ['addressScreening'], operation: ['listScreenings'] } },
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  default: 0,
  description: 'Number of results to skip',
  displayOptions: { show: { resource: ['addressScreening'], operation: ['listScreenings'] } },
},
{
  displayName: 'Start Date',
  name: 'startDate',
  type: 'dateTime',
  default: '',
  description: 'Start date for filtering results (ISO 8601 format)',
  displayOptions: { show: { resource: ['addressScreening'], operation: ['listScreenings'] } },
},
{
  displayName: 'End Date',
  name: 'endDate',
  type: 'dateTime',
  default: '',
  description: 'End date for filtering results (ISO 8601 format)',
  displayOptions: { show: { resource: ['addressScreening'], operation: ['listScreenings'] } },
},
{
	displayName: 'Transaction Hash',
	name: 'txHash',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['transactionMonitoring'],
			operation: ['monitorTransaction'],
		},
	},
	default: '',
	description: 'The transaction hash to monitor',
},
{
	displayName: 'Asset',
	name: 'asset',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['transactionMonitoring'],
			operation: ['monitorTransaction'],
		},
	},
	default: 'BTC',
	description: 'The cryptocurrency asset type (e.g., BTC, ETH, LTC)',
},
{
	displayName: 'Transactions',
	name: 'transactions',
	type: 'json',
	required: true,
	displayOptions: {
		show: {
			resource: ['transactionMonitoring'],
			operation: ['bulkMonitorTransactions'],
		},
	},
	default: '[]',
	description: 'Array of transaction objects with txHash and asset properties',
},
{
	displayName: 'Monitoring ID',
	name: 'monitoringId',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['transactionMonitoring'],
			operation: ['getMonitoringResult'],
		},
	},
	default: '',
	description: 'The monitoring request ID to retrieve results for',
},
{
	displayName: 'Limit',
	name: 'limit',
	type: 'number',
	displayOptions: {
		show: {
			resource: ['transactionMonitoring'],
			operation: ['listMonitorings'],
		},
	},
	default: 100,
	description: 'Maximum number of monitoring records to return',
},
{
	displayName: 'Offset',
	name: 'offset',
	type: 'number',
	displayOptions: {
		show: {
			resource: ['transactionMonitoring'],
			operation: ['listMonitorings'],
		},
	},
	default: 0,
	description: 'Number of records to skip for pagination',
},
{
	displayName: 'Filter Asset',
	name: 'filterAsset',
	type: 'string',
	displayOptions: {
		show: {
			resource: ['transactionMonitoring'],
			operation: ['listMonitorings'],
		},
	},
	default: '',
	description: 'Filter monitoring results by cryptocurrency asset',
},
{
	displayName: 'Status',
	name: 'status',
	type: 'options',
	displayOptions: {
		show: {
			resource: ['transactionMonitoring'],
			operation: ['listMonitorings'],
		},
	},
	options: [
		{
			name: 'All',
			value: '',
		},
		{
			name: 'Pending',
			value: 'pending',
		},
		{
			name: 'Completed',
			value: 'completed',
		},
		{
			name: 'Failed',
			value: 'failed',
		},
	],
	default: '',
	description: 'Filter by monitoring status',
},
{
  displayName: 'Identifier',
  name: 'identifier',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['sanctionsCompliance'],
      operation: ['checkSanctions'],
    },
  },
  default: '',
  description: 'The address or entity identifier to check against sanctions lists',
},
{
  displayName: 'Identifier Type',
  name: 'identifierType',
  type: 'options',
  required: true,
  displayOptions: {
    show: {
      resource: ['sanctionsCompliance'],
      operation: ['checkSanctions'],
    },
  },
  options: [
    {
      name: 'Address',
      value: 'address',
    },
    {
      name: 'Entity',
      value: 'entity',
    },
  ],
  default: 'address',
  description: 'The type of identifier being checked',
},
{
  displayName: 'Match ID',
  name: 'matchId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['sanctionsCompliance'],
      operation: ['getSanctionsMatch'],
    },
  },
  default: '',
  description: 'The ID of the sanctions match to retrieve',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['sanctionsCompliance'],
      operation: ['addToWhitelist'],
    },
  },
  default: '',
  description: 'The cryptocurrency address to add to the whitelist',
},
{
  displayName: 'Reason',
  name: 'reason',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['sanctionsCompliance'],
      operation: ['addToWhitelist'],
    },
  },
  default: '',
  description: 'The reason for adding the address to the whitelist',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['riskAssessment'], operation: ['assessRisk'] } },
  default: '',
  description: 'Cryptocurrency address to assess',
  placeholder: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
},
{
  displayName: 'Asset',
  name: 'asset',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['riskAssessment'], operation: ['assessRisk'] } },
  default: 'BTC',
  description: 'Asset type (e.g., BTC, ETH)',
},
{
  displayName: 'Depth',
  name: 'depth',
  type: 'number',
  displayOptions: { show: { resource: ['riskAssessment'], operation: ['assessRisk'] } },
  default: 1,
  description: 'Depth of analysis (number of hops)',
  typeOptions: { minValue: 1, maxValue: 10 },
},
{
  displayName: 'Assessment ID',
  name: 'assessmentId',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['riskAssessment'], operation: ['getRiskAssessment'] } },
  default: '',
  description: 'ID of the risk assessment to retrieve',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['riskAssessment'], operation: ['getExposureAnalysis'] } },
  default: '',
  description: 'Cryptocurrency address to analyze exposure',
  placeholder: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
},
{
  displayName: 'Asset',
  name: 'asset',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['riskAssessment'], operation: ['getExposureAnalysis'] } },
  default: 'BTC',
  description: 'Asset type (e.g., BTC, ETH)',
},
{
  displayName: 'Hops',
  name: 'hops',
  type: 'number',
  displayOptions: { show: { resource: ['riskAssessment'], operation: ['getExposureAnalysis'] } },
  default: 2,
  description: 'Number of hops to analyze for exposure',
  typeOptions: { minValue: 1, maxValue: 10 },
},
{
	displayName: 'Address',
	name: 'address',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['addressIntelligence'],
			operation: ['getAddressInfo', 'getAddressActivity', 'getAddressClustering', 'getAddressExposure'],
		},
	},
	default: '',
	description: 'The cryptocurrency address to analyze',
},
{
	displayName: 'Asset',
	name: 'asset',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['addressIntelligence'],
			operation: ['getAddressInfo', 'getAddressActivity', 'getAddressClustering', 'getAddressExposure'],
		},
	},
	default: 'BTC',
	description: 'The asset type (e.g., BTC, ETH, LTC)',
},
{
	displayName: 'Start Date',
	name: 'startDate',
	type: 'dateTime',
	displayOptions: {
		show: {
			resource: ['addressIntelligence'],
			operation: ['getAddressActivity'],
		},
	},
	default: '',
	description: 'Start date for activity analysis (ISO 8601 format)',
},
{
	displayName: 'End Date',
	name: 'endDate',
	type: 'dateTime',
	displayOptions: {
		show: {
			resource: ['addressIntelligence'],
			operation: ['getAddressActivity'],
		},
	},
	default: '',
	description: 'End date for activity analysis (ISO 8601 format)',
},
{
	displayName: 'Category',
	name: 'category',
	type: 'options',
	displayOptions: {
		show: {
			resource: ['addressIntelligence'],
			operation: ['getAddressExposure'],
		},
	},
	options: [
		{
			name: 'All Categories',
			value: 'all',
		},
		{
			name: 'Sanctions',
			value: 'sanctions',
		},
		{
			name: 'Ransomware',
			value: 'ransomware',
		},
		{
			name: 'Darknet Market',
			value: 'darknet_market',
		},
		{
			name: 'Exchange',
			value: 'exchange',
		},
		{
			name: 'Gambling',
			value: 'gambling',
		},
	],
	default: 'all',
	description: 'Category for exposure analysis',
},
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;

    switch (resource) {
      case 'addressScreening':
        return [await executeAddressScreeningOperations.call(this, items)];
      case 'transactionMonitoring':
        return [await executeTransactionMonitoringOperations.call(this, items)];
      case 'sanctionsCompliance':
        return [await executeSanctionsComplianceOperations.call(this, items)];
      case 'riskAssessment':
        return [await executeRiskAssessmentOperations.call(this, items)];
      case 'addressIntelligence':
        return [await executeAddressIntelligenceOperations.call(this, items)];
      default:
        throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`);
    }
  }
}

// ============================================================
// Resource Handler Functions
// ============================================================

async function executeAddressScreeningOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('chainalysisApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'screenAddress': {
          const address = this.getNodeParameter('address', i) as string;
          const asset = this.getNodeParameter('asset', i) as string;

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/v1/address-screening`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              address,
              asset,
            }),
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'bulkScreenAddresses': {
          const addresses = this.getNodeParameter('addresses', i) as any[];

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/v1/address-screening/bulk`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              addresses,
            }),
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getScreeningResult': {
          const screeningId = this.getNodeParameter('screeningId', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/v1/address-screening/${screeningId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'listScreenings': {
          const limit = this.getNodeParameter('limit', i) as number;
          const offset = this.getNodeParameter('offset', i) as number;
          const startDate = this.getNodeParameter('startDate', i) as string;
          const endDate = this.getNodeParameter('endDate', i) as string;

          const queryParams = new URLSearchParams();
          queryParams.append('limit', limit.toString());
          queryParams.append('offset', offset.toString());
          
          if (startDate) {
            queryParams.append('startDate', startDate);
          }
          if (endDate) {
            queryParams.append('endDate', endDate);
          }

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/v1/address-screening?${queryParams.toString()}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}

async function executeTransactionMonitoringOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const operation = this.getNodeParameter('operation', 0) as string;
	const credentials = await this.getCredentials('chainalysisApi') as any;

	for (let i = 0; i < items.length; i++) {
		try {
			let result: any;

			switch (operation) {
				case 'monitorTransaction': {
					const txHash = this.getNodeParameter('txHash', i) as string;
					const asset = this.getNodeParameter('asset', i) as string;

					const body = {
						txHash,
						asset,
					};

					const options: any = {
						method: 'POST',
						url: `${credentials.baseUrl}/v1/transaction-monitoring`,
						headers: {
							'Authorization': `Bearer ${credentials.apiKey}`,
							'Content-Type': 'application/json',
						},
						body,
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'bulkMonitorTransactions': {
					const transactions = this.getNodeParameter('transactions', i) as any;

					const body = {
						transactions: typeof transactions === 'string' ? JSON.parse(transactions) : transactions,
					};

					const options: any = {
						method: 'POST',
						url: `${credentials.baseUrl}/v1/transaction-monitoring/bulk`,
						headers: {
							'Authorization': `Bearer ${credentials.apiKey}`,
							'Content-Type': 'application/json',
						},
						body,
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'getMonitoringResult': {
					const monitoringId = this.getNodeParameter('monitoringId', i) as string;

					const options: any = {
						method: 'GET',
						url: `${credentials.baseUrl}/v1/transaction-monitoring/${monitoringId}`,
						headers: {
							'Authorization': `Bearer ${credentials.apiKey}`,
						},
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'listMonitorings': {
					const limit = this.getNodeParameter('limit', i) as number;
					const offset = this.getNodeParameter('offset', i) as number;
					const filterAsset = this.getNodeParameter('filterAsset', i) as string;
					const status = this.getNodeParameter('status', i) as string;

					const qs: any = {
						limit,
						offset,
					};

					if (filterAsset) {
						qs.asset = filterAsset;
					}

					if (status) {
						qs.status = status;
					}

					const options: any = {
						method: 'GET',
						url: `${credentials.baseUrl}/v1/transaction-monitoring`,
						headers: {
							'Authorization': `Bearer ${credentials.apiKey}`,
						},
						qs,
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				default:
					throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
			}

			returnData.push({
				json: result,
				pairedItem: { item: i },
			});

		} catch (error: any) {
			if (this.continueOnFail()) {
				returnData.push({
					json: { error: error.message },
					pairedItem: { item: i },
				});
			} else {
				throw error;
			}
		}
	}

	return returnData;
}

async function executeSanctionsComplianceOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('chainalysisApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'checkSanctions': {
          const identifier = this.getNodeParameter('identifier', i) as string;
          const identifierType = this.getNodeParameter('identifierType', i) as string;

          const body = {
            identifier,
            identifierType,
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/v1/sanctions/check`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getSanctionsLists': {
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/v1/sanctions/lists`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getSanctionsMatch': {
          const matchId = this.getNodeParameter('matchId', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/v1/sanctions/matches/${matchId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'addToWhitelist': {
          const address = this.getNodeParameter('address', i) as string;
          const reason = this.getNodeParameter('reason', i) as string;

          const body = {
            address,
            reason,
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/v1/sanctions/whitelist`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}

async function executeRiskAssessmentOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('chainalysisApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'assessRisk': {
          const address = this.getNodeParameter('address', i) as string;
          const asset = this.getNodeParameter('asset', i) as string;
          const depth = this.getNodeParameter('depth', i) as number;

          const body = {
            address,
            asset,
            depth,
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/v1/risk-assessment`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getRiskAssessment': {
          const assessmentId = this.getNodeParameter('assessmentId', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/v1/risk-assessment/${assessmentId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getRiskCategories': {
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/v1/risk-assessment/categories`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getExposureAnalysis': {
          const address = this.getNodeParameter('address', i) as string;
          const asset = this.getNodeParameter('asset', i) as string;
          const hops = this.getNodeParameter('hops', i) as number;

          const body = {
            address,
            asset,
            hops,
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/v1/risk-assessment/exposure`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}

async function executeAddressIntelligenceOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const operation = this.getNodeParameter('operation', 0) as string;
	const credentials = await this.getCredentials('chainalysisApi') as any;

	for (let i = 0; i < items.length; i++) {
		try {
			let result: any;

			switch (operation) {
				case 'getAddressInfo': {
					const address = this.getNodeParameter('address', i) as string;
					const asset = this.getNodeParameter('asset', i) as string;

					const options: any = {
						method: 'GET',
						url: `${credentials.baseUrl}/v1/address/${address}`,
						headers: {
							'X-API-Key': credentials.apiKey,
							'Content-Type': 'application/json',
						},
						qs: {
							asset,
						},
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'getAddressActivity': {
					const address = this.getNodeParameter('address', i) as string;
					const asset = this.getNodeParameter('asset', i) as string;
					const startDate = this.getNodeParameter('startDate', i, '') as string;
					const endDate = this.getNodeParameter('endDate', i, '') as string;

					const queryParams: any = { asset };
					if (startDate) queryParams.startDate = startDate;
					if (endDate) queryParams.endDate = endDate;

					const options: any = {
						method: 'GET',
						url: `${credentials.baseUrl}/v1/address/${address}/activity`,
						headers: {
							'X-API-Key': credentials.apiKey,
							'Content-Type': 'application/json',
						},
						qs: queryParams,
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'getAddressClustering': {
					const address = this.getNodeParameter('address', i) as string;
					const asset = this.getNodeParameter('asset', i) as string;

					const options: any = {
						method: 'GET',
						url: `${credentials.baseUrl}/v1/address/${address}/clustering`,
						headers: {
							'X-API-Key': credentials.apiKey,
							'Content-Type': 'application/json',
						},
						qs: {
							asset,
						},
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'getAddressExposure': {
					const address = this.getNodeParameter('address', i) as string;
					const asset = this.getNodeParameter('asset', i) as string;
					const category = this.getNodeParameter('category', i, 'all') as string;

					const queryParams: any = { asset };
					if (category !== 'all') queryParams.category = category;

					const options: any = {
						method: 'GET',
						url: `${credentials.baseUrl}/v1/address/${address}/exposure`,
						headers: {
							'X-API-Key': credentials.apiKey,
							'Content-Type': 'application/json',
						},
						qs: queryParams,
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				default:
					throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
			}

			returnData.push({
				json: result,
				pairedItem: { item: i },
			});
		} catch (error: any) {
			if (this.continueOnFail()) {
				returnData.push({
					json: { error: error.message },
					pairedItem: { item: i },
				});
			} else {
				throw error;
			}
		}
	}

	return returnData;
}