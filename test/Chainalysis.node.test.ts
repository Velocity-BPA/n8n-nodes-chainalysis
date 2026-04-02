/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { Chainalysis } from '../nodes/Chainalysis/Chainalysis.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('Chainalysis Node', () => {
  let node: Chainalysis;

  beforeAll(() => {
    node = new Chainalysis();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('Chainalysis');
      expect(node.description.name).toBe('chainalysis');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 5 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(5);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(5);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('AddressScreening Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://api.chainalysis.com' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  describe('screenAddress operation', () => {
    it('should screen a single address successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('screenAddress')
        .mockReturnValueOnce('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')
        .mockReturnValueOnce('BTC');

      const mockResponse = { 
        screeningId: 'screen-123',
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        asset: 'BTC',
        riskScore: 0.1,
        sanctions: false 
      };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAddressScreeningOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.chainalysis.com/v1/address-screening',
        headers: {
          'Authorization': 'Bearer test-key',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
          asset: 'BTC',
        }),
        json: true,
      });
    });

    it('should handle screenAddress errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('screenAddress');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeAddressScreeningOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
    });
  });

  describe('bulkScreenAddresses operation', () => {
    it('should screen multiple addresses successfully', async () => {
      const addresses = [
        { address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', asset: 'BTC' },
        { address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', asset: 'BTC' }
      ];

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('bulkScreenAddresses')
        .mockReturnValueOnce(addresses);

      const mockResponse = { 
        screenings: [
          { screeningId: 'screen-123', address: addresses[0].address, riskScore: 0.1 },
          { screeningId: 'screen-124', address: addresses[1].address, riskScore: 0.2 }
        ]
      };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAddressScreeningOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('getScreeningResult operation', () => {
    it('should retrieve screening result successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getScreeningResult')
        .mockReturnValueOnce('screen-123');

      const mockResponse = { 
        screeningId: 'screen-123',
        status: 'completed',
        results: { riskScore: 0.1, sanctions: false }
      };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAddressScreeningOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('listScreenings operation', () => {
    it('should list screenings successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('listScreenings')
        .mockReturnValueOnce(100)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce('2023-01-01T00:00:00Z')
        .mockReturnValueOnce('2023-12-31T23:59:59Z');

      const mockResponse = { 
        screenings: [
          { screeningId: 'screen-123', createdAt: '2023-06-01T10:00:00Z' }
        ],
        total: 1
      };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAddressScreeningOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });
});

describe('Transaction Monitoring Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-api-key',
				baseUrl: 'https://api.chainalysis.com',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
				requestWithAuthentication: jest.fn(),
			},
		};
	});

	describe('monitorTransaction operation', () => {
		it('should monitor a transaction successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('monitorTransaction')
				.mockReturnValueOnce('abc123hash')
				.mockReturnValueOnce('BTC');

			const mockResponse = {
				monitoringId: 'mon-123',
				status: 'pending',
				txHash: 'abc123hash',
				asset: 'BTC',
			};

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeTransactionMonitoringOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://api.chainalysis.com/v1/transaction-monitoring',
				headers: {
					'Authorization': 'Bearer test-api-key',
					'Content-Type': 'application/json',
				},
				body: {
					txHash: 'abc123hash',
					asset: 'BTC',
				},
				json: true,
			});

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);
		});

		it('should handle monitor transaction error', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('monitorTransaction')
				.mockReturnValueOnce('abc123hash')
				.mockReturnValueOnce('BTC');
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

			const result = await executeTransactionMonitoringOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result).toEqual([
				{
					json: { error: 'API Error' },
					pairedItem: { item: 0 },
				},
			]);
		});
	});

	describe('bulkMonitorTransactions operation', () => {
		it('should bulk monitor transactions successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('bulkMonitorTransactions')
				.mockReturnValueOnce('[{"txHash": "hash1", "asset": "BTC"}, {"txHash": "hash2", "asset": "ETH"}]');

			const mockResponse = {
				monitoringIds: ['mon-123', 'mon-124'],
				status: 'pending',
			};

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeTransactionMonitoringOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);
		});
	});

	describe('getMonitoringResult operation', () => {
		it('should get monitoring result successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getMonitoringResult')
				.mockReturnValueOnce('mon-123');

			const mockResponse = {
				monitoringId: 'mon-123',
				status: 'completed',
				riskScore: 0.2,
				findings: [],
			};

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeTransactionMonitoringOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://api.chainalysis.com/v1/transaction-monitoring/mon-123',
				headers: {
					'Authorization': 'Bearer test-api-key',
				},
				json: true,
			});

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);
		});
	});

	describe('listMonitorings operation', () => {
		it('should list monitoring requests successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('listMonitorings')
				.mockReturnValueOnce(100)
				.mockReturnValueOnce(0)
				.mockReturnValueOnce('BTC')
				.mockReturnValueOnce('completed');

			const mockResponse = {
				monitorings: [
					{
						monitoringId: 'mon-123',
						status: 'completed',
						asset: 'BTC',
					},
				],
				total: 1,
			};

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeTransactionMonitoringOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://api.chainalysis.com/v1/transaction-monitoring',
				headers: {
					'Authorization': 'Bearer test-api-key',
				},
				qs: {
					limit: 100,
					offset: 0,
					asset: 'BTC',
					status: 'completed',
				},
				json: true,
			});

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);
		});
	});
});

describe('SanctionsCompliance Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.chainalysis.com',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('checkSanctions', () => {
    it('should check sanctions successfully', async () => {
      const mockResponse = { match: false, confidence: 1.0 };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('checkSanctions')
        .mockReturnValueOnce('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')
        .mockReturnValueOnce('address');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSanctionsComplianceOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });

    it('should handle check sanctions error', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('checkSanctions')
        .mockReturnValueOnce('invalid-address')
        .mockReturnValueOnce('address');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Invalid address'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeSanctionsComplianceOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toEqual([{ json: { error: 'Invalid address' }, pairedItem: { item: 0 } }]);
    });
  });

  describe('getSanctionsLists', () => {
    it('should get sanctions lists successfully', async () => {
      const mockResponse = { lists: ['OFAC', 'EU'], lastUpdated: '2023-01-01' };
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getSanctionsLists');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSanctionsComplianceOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });

    it('should handle get sanctions lists error', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getSanctionsLists');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Access denied'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeSanctionsComplianceOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toEqual([{ json: { error: 'Access denied' }, pairedItem: { item: 0 } }]);
    });
  });

  describe('getSanctionsMatch', () => {
    it('should get sanctions match successfully', async () => {
      const mockResponse = { matchId: 'match123', entity: 'Test Entity', confidence: 0.95 };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getSanctionsMatch')
        .mockReturnValueOnce('match123');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSanctionsComplianceOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });

    it('should handle get sanctions match error', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getSanctionsMatch')
        .mockReturnValueOnce('invalid-match');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Match not found'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeSanctionsComplianceOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toEqual([{ json: { error: 'Match not found' }, pairedItem: { item: 0 } }]);
    });
  });

  describe('addToWhitelist', () => {
    it('should add to whitelist successfully', async () => {
      const mockResponse = { success: true, whitelistId: 'wl123' };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('addToWhitelist')
        .mockReturnValueOnce('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')
        .mockReturnValueOnce('Trusted partner');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSanctionsComplianceOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });

    it('should handle add to whitelist error', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('addToWhitelist')
        .mockReturnValueOnce('invalid-address')
        .mockReturnValueOnce('Test reason');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Invalid address format'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeSanctionsComplianceOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toEqual([{ json: { error: 'Invalid address format' }, pairedItem: { item: 0 } }]);
    });
  });
});

describe('Risk Assessment Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.chainalysis.com'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('assessRisk operation', () => {
    it('should successfully assess risk for an address', async () => {
      const mockResponse = {
        assessmentId: 'assessment-123',
        address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
        riskScore: 0.25,
        riskLevel: 'LOW',
        categories: []
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('assessRisk')
        .mockReturnValueOnce('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2')
        .mockReturnValueOnce('BTC')
        .mockReturnValueOnce(1);

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeRiskAssessmentOperations.call(mockExecuteFunctions, items);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 }
      }]);
    });

    it('should handle errors during risk assessment', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('assessRisk')
        .mockReturnValueOnce('invalid-address')
        .mockReturnValueOnce('BTC')
        .mockReturnValueOnce(1);

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Invalid address format'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const items = [{ json: {} }];
      const result = await executeRiskAssessmentOperations.call(mockExecuteFunctions, items);

      expect(result).toEqual([{
        json: { error: 'Invalid address format' },
        pairedItem: { item: 0 }
      }]);
    });
  });

  describe('getRiskAssessment operation', () => {
    it('should successfully retrieve risk assessment', async () => {
      const mockResponse = {
        assessmentId: 'assessment-123',
        status: 'completed',
        riskScore: 0.25,
        riskLevel: 'LOW'
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getRiskAssessment')
        .mockReturnValueOnce('assessment-123');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeRiskAssessmentOperations.call(mockExecuteFunctions, items);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 }
      }]);
    });
  });

  describe('getRiskCategories operation', () => {
    it('should successfully retrieve risk categories', async () => {
      const mockResponse = {
        categories: [
          { id: 1, name: 'Exchange', riskLevel: 'LOW' },
          { id: 2, name: 'Mixer', riskLevel: 'HIGH' }
        ]
      };

      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getRiskCategories');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeRiskAssessmentOperations.call(mockExecuteFunctions, items);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 }
      }]);
    });
  });

  describe('getExposureAnalysis operation', () => {
    it('should successfully analyze exposure', async () => {
      const mockResponse = {
        address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
        exposureScore: 0.15,
        exposures: []
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getExposureAnalysis')
        .mockReturnValueOnce('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2')
        .mockReturnValueOnce('BTC')
        .mockReturnValueOnce(2);

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeRiskAssessmentOperations.call(mockExecuteFunctions, items);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 }
      }]);
    });
  });
});

describe('Address Intelligence Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-api-key',
				baseUrl: 'https://api.chainalysis.com',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
			},
		};
	});

	describe('getAddressInfo', () => {
		it('should get address information successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAddressInfo')
				.mockReturnValueOnce('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')
				.mockReturnValueOnce('BTC');

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
				asset: 'BTC',
				balance: 0,
			});

			const result = await executeAddressIntelligenceOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://api.chainalysis.com/v1/address/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
				headers: {
					'X-API-Key': 'test-api-key',
					'Content-Type': 'application/json',
				},
				qs: { asset: 'BTC' },
				json: true,
			});

			expect(result).toEqual([
				{
					json: {
						address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
						asset: 'BTC',
						balance: 0,
					},
					pairedItem: { item: 0 },
				},
			]);
		});

		it('should handle errors when getting address info fails', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAddressInfo')
				.mockReturnValueOnce('invalid-address')
				.mockReturnValueOnce('BTC');

			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Invalid address format'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeAddressIntelligenceOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result).toEqual([
				{
					json: { error: 'Invalid address format' },
					pairedItem: { item: 0 },
				},
			]);
		});
	});

	describe('getAddressActivity', () => {
		it('should get address activity successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAddressActivity')
				.mockReturnValueOnce('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')
				.mockReturnValueOnce('BTC')
				.mockReturnValueOnce('2023-01-01T00:00:00Z')
				.mockReturnValueOnce('2023-12-31T23:59:59Z');

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				transactions: [],
				totalCount: 0,
			});

			const result = await executeAddressIntelligenceOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://api.chainalysis.com/v1/address/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa/activity',
				headers: {
					'X-API-Key': 'test-api-key',
					'Content-Type': 'application/json',
				},
				qs: {
					asset: 'BTC',
					startDate: '2023-01-01T00:00:00Z',
					endDate: '2023-12-31T23:59:59Z',
				},
				json: true,
			});

			expect(result).toEqual([
				{
					json: {
						transactions: [],
						totalCount: 0,
					},
					pairedItem: { item: 0 },
				},
			]);
		});
	});

	describe('getAddressClustering', () => {
		it('should get address clustering successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAddressClustering')
				.mockReturnValueOnce('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')
				.mockReturnValueOnce('BTC');

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				clusterId: 'cluster-123',
				entity: null,
			});

			const result = await executeAddressIntelligenceOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://api.chainalysis.com/v1/address/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa/clustering',
				headers: {
					'X-API-Key': 'test-api-key',
					'Content-Type': 'application/json',
				},
				qs: { asset: 'BTC' },
				json: true,
			});

			expect(result).toEqual([
				{
					json: {
						clusterId: 'cluster-123',
						entity: null,
					},
					pairedItem: { item: 0 },
				},
			]);
		});
	});

	describe('getAddressExposure', () => {
		it('should get address exposure successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAddressExposure')
				.mockReturnValueOnce('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')
				.mockReturnValueOnce('BTC')
				.mockReturnValueOnce('sanctions');

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				exposures: [],
				riskScore: 0,
			});

			const result = await executeAddressIntelligenceOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://api.chainalysis.com/v1/address/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa/exposure',
				headers: {
					'X-API-Key': 'test-api-key',
					'Content-Type': 'application/json',
				},
				qs: {
					asset: 'BTC',
					category: 'sanctions',
				},
				json: true,
			});

			expect(result).toEqual([
				{
					json: {
						exposures: [],
						riskScore: 0,
					},
					pairedItem: { item: 0 },
				},
			]);
		});
	});
});
});
