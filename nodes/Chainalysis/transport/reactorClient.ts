/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  ICredentialDataDecryptedObject,
  IDataObject,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { API_ENDPOINTS } from '../constants/endpoints';
import type { PaginationParams, PaginatedResponse } from './chainalysisClient';

/**
 * Reactor Client Configuration
 */
export interface ReactorClientConfig {
  apiKey: string;
  organizationId: string;
  graphEndpoint?: string;
  environment: 'production' | 'sandbox';
}

/**
 * Investigation Creation Request
 */
export interface InvestigationRequest {
  name: string;
  description?: string;
  status?: 'open' | 'in_progress' | 'closed';
  tags?: string[];
  metadata?: IDataObject;
}

/**
 * Graph Query Options
 */
export interface GraphQueryOptions {
  depth?: number;
  direction?: 'inbound' | 'outbound' | 'both';
  limit?: number;
  includeLabels?: boolean;
  includeRisk?: boolean;
  network?: string;
}

/**
 * Chainalysis Reactor Client
 */
export class ReactorClient {
  private client: AxiosInstance;
  private config: ReactorClientConfig;

  constructor(config: ReactorClientConfig) {
    this.config = config;
    this.client = this.createHttpClient();
  }

  private createHttpClient(): AxiosInstance {
    const baseURL = this.config.graphEndpoint ||
      (this.config.environment === 'sandbox' ? API_ENDPOINTS.REACTOR.SANDBOX : API_ENDPOINTS.REACTOR.PRODUCTION);

    const client = axios.create({
      baseURL,
      timeout: 60000, // Longer timeout for graph operations
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-API-Key': this.config.apiKey,
        'X-Organization-ID': this.config.organizationId,
      },
    });

    client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => this.handleError(error),
    );

    return client;
  }

  private handleError(error: AxiosError): never {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as IDataObject;
      let errorMessage = 'Reactor API error';

      if (data && typeof data === 'object') {
        errorMessage = (data.message as string) || (data.error as string) || errorMessage;
      }

      switch (status) {
        case 400:
          throw new Error(`Invalid request: ${errorMessage}`);
        case 401:
          throw new Error('Unauthorized: Invalid API key');
        case 403:
          throw new Error(`Forbidden: ${errorMessage}`);
        case 404:
          throw new Error(`Not found: ${errorMessage}`);
        case 429:
          throw new Error('Rate limited: Too many requests');
        default:
          throw new Error(`Reactor API error (${status}): ${errorMessage}`);
      }
    }

    throw new Error(`Network error: ${error.message}`);
  }

  // Investigation Operations
  async createInvestigation(investigation: InvestigationRequest): Promise<IDataObject> {
    const response = await this.client.post('/investigations', investigation);
    return response.data;
  }

  async getInvestigation(investigationId: string): Promise<IDataObject> {
    const response = await this.client.get(`/investigations/${encodeURIComponent(investigationId)}`);
    return response.data;
  }

  async getInvestigations(pagination?: PaginationParams): Promise<PaginatedResponse<IDataObject>> {
    const response = await this.client.get('/investigations', {
      params: {
        limit: pagination?.limit || 100,
        offset: pagination?.offset || 0,
      },
    });
    
    const data = response.data as IDataObject;
    const items = (data.items || data.investigations || []) as IDataObject[];
    
    return {
      items,
      total: (data.total as number) || items.length,
      limit: pagination?.limit || 100,
      offset: pagination?.offset || 0,
      hasMore: items.length === (pagination?.limit || 100),
    };
  }

  async updateInvestigation(investigationId: string, updates: Partial<InvestigationRequest>): Promise<IDataObject> {
    const response = await this.client.patch(`/investigations/${encodeURIComponent(investigationId)}`, updates);
    return response.data;
  }

  async deleteInvestigation(investigationId: string): Promise<void> {
    await this.client.delete(`/investigations/${encodeURIComponent(investigationId)}`);
  }

  async addAddressToInvestigation(investigationId: string, address: string, network?: string): Promise<IDataObject> {
    const response = await this.client.post(`/investigations/${encodeURIComponent(investigationId)}/addresses`, {
      address,
      network,
    });
    return response.data;
  }

  async addTransactionToInvestigation(investigationId: string, txHash: string, network: string): Promise<IDataObject> {
    const response = await this.client.post(`/investigations/${encodeURIComponent(investigationId)}/transactions`, {
      hash: txHash,
      network,
    });
    return response.data;
  }

  async getInvestigationGraph(investigationId: string, options?: GraphQueryOptions): Promise<IDataObject> {
    const response = await this.client.get(`/investigations/${encodeURIComponent(investigationId)}/graph`, {
      params: options,
    });
    return response.data;
  }

  async exportInvestigation(investigationId: string, format: 'json' | 'csv' | 'pdf' = 'json'): Promise<IDataObject> {
    const response = await this.client.get(`/investigations/${encodeURIComponent(investigationId)}/export`, {
      params: { format },
    });
    return response.data;
  }

  async shareInvestigation(investigationId: string, userIds: string[]): Promise<IDataObject> {
    const response = await this.client.post(`/investigations/${encodeURIComponent(investigationId)}/share`, {
      users: userIds,
    });
    return response.data;
  }

  async getInvestigationNotes(investigationId: string): Promise<IDataObject[]> {
    const response = await this.client.get(`/investigations/${encodeURIComponent(investigationId)}/notes`);
    return response.data;
  }

  async addInvestigationNote(investigationId: string, content: string, metadata?: IDataObject): Promise<IDataObject> {
    const response = await this.client.post(`/investigations/${encodeURIComponent(investigationId)}/notes`, {
      content,
      metadata,
    });
    return response.data;
  }

  // Graph Operations
  async getAddressGraph(address: string, options?: GraphQueryOptions): Promise<IDataObject> {
    const response = await this.client.get(`/graph/address/${encodeURIComponent(address)}`, {
      params: options,
    });
    return response.data;
  }

  async getTransactionGraph(txHash: string, network: string, options?: GraphQueryOptions): Promise<IDataObject> {
    const response = await this.client.get(`/graph/transaction/${encodeURIComponent(txHash)}`, {
      params: { network, ...options },
    });
    return response.data;
  }

  async getEntityGraph(entityId: string, options?: GraphQueryOptions): Promise<IDataObject> {
    const response = await this.client.get(`/graph/entity/${encodeURIComponent(entityId)}`, {
      params: options,
    });
    return response.data;
  }

  async getClusterGraph(clusterId: string, options?: GraphQueryOptions): Promise<IDataObject> {
    const response = await this.client.get(`/graph/cluster/${encodeURIComponent(clusterId)}`, {
      params: options,
    });
    return response.data;
  }

  async getConnectionsGraph(address: string, options?: GraphQueryOptions): Promise<IDataObject> {
    const response = await this.client.get(`/graph/connections/${encodeURIComponent(address)}`, {
      params: options,
    });
    return response.data;
  }

  async expandGraphNode(nodeId: string, options?: GraphQueryOptions): Promise<IDataObject> {
    const response = await this.client.get(`/graph/node/${encodeURIComponent(nodeId)}/expand`, {
      params: options,
    });
    return response.data;
  }

  async getGraphDepth(address: string, targetAddress: string): Promise<IDataObject> {
    const response = await this.client.get(`/graph/depth`, {
      params: { source: address, target: targetAddress },
    });
    return response.data;
  }

  async getShortestPath(sourceAddress: string, targetAddress: string, options?: GraphQueryOptions): Promise<IDataObject> {
    const response = await this.client.get(`/graph/path`, {
      params: { source: sourceAddress, target: targetAddress, ...options },
    });
    return response.data;
  }

  async getFundFlow(address: string, options?: GraphQueryOptions): Promise<IDataObject> {
    const response = await this.client.get(`/graph/flow/${encodeURIComponent(address)}`, {
      params: options,
    });
    return response.data;
  }

  async getGraphStatistics(address: string): Promise<IDataObject> {
    const response = await this.client.get(`/graph/statistics/${encodeURIComponent(address)}`);
    return response.data;
  }

  async exportGraph(address: string, format: 'json' | 'graphml' | 'gexf' = 'json'): Promise<IDataObject> {
    const response = await this.client.get(`/graph/export/${encodeURIComponent(address)}`, {
      params: { format },
    });
    return response.data;
  }

  // Path Analysis
  async getPathsBetweenAddresses(
    sourceAddress: string,
    targetAddress: string,
    maxDepth: number = 6,
  ): Promise<IDataObject> {
    const response = await this.client.get(`/paths`, {
      params: {
        source: sourceAddress,
        target: targetAddress,
        maxDepth,
      },
    });
    return response.data;
  }

  async getConnections(address: string, depth: number = 3): Promise<IDataObject> {
    const response = await this.client.get(`/connections/${encodeURIComponent(address)}`, {
      params: { depth },
    });
    return response.data;
  }

  // Attribution
  async getAttributions(address: string): Promise<IDataObject[]> {
    const response = await this.client.get(`/attributions/${encodeURIComponent(address)}`);
    return response.data;
  }

  async searchAttributions(query: string): Promise<IDataObject[]> {
    const response = await this.client.get(`/attributions/search`, {
      params: { q: query },
    });
    return response.data;
  }
}

/**
 * Create Reactor client from n8n credentials
 */
export async function createReactorClient(
  context: IExecuteFunctions | ILoadOptionsFunctions,
): Promise<ReactorClient> {
  let credentials: ICredentialDataDecryptedObject;

  try {
    credentials = await context.getCredentials('chainalysisReactor');
  } catch {
    throw new NodeOperationError(context.getNode(), 'Please configure Chainalysis Reactor credentials');
  }

  const config: ReactorClientConfig = {
    apiKey: credentials.apiKey as string,
    organizationId: credentials.organizationId as string,
    graphEndpoint: credentials.graphEndpoint as string,
    environment: (credentials.environment as 'production' | 'sandbox') || 'production',
  };

  return new ReactorClient(config);
}
