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
 * KYT Client Configuration
 */
export interface KytClientConfig {
  apiKey: string;
  organizationId: string;
  userId?: string;
  environment: 'production' | 'sandbox';
  baseUrl?: string;
}

/**
 * Transfer Types
 */
export type TransferType = 'sent' | 'received' | 'observed';

/**
 * Transfer Registration Request
 */
export interface TransferRequest {
  network: string;
  asset: string;
  transferReference: string;
  direction: TransferType;
  transferTimestamp: string;
  assetAmount: number;
  usdAmount?: number;
  outputAddress?: string;
  inputAddress?: string;
  txHash?: string;
}

/**
 * Withdrawal Attempt Request
 */
export interface WithdrawalAttemptRequest {
  network: string;
  asset: string;
  address: string;
  attemptIdentifier: string;
  assetAmount: number;
  attemptTimestamp: string;
}

/**
 * Deposit Address Request
 */
export interface DepositAddressRequest {
  network: string;
  asset: string;
  address: string;
  userId: string;
}

/**
 * User Registration Request
 */
export interface UserRequest {
  userId: string;
  name?: string;
  email?: string;
  metadata?: IDataObject;
}

/**
 * Chainalysis KYT Client
 */
export class KytClient {
  private client: AxiosInstance;
  private config: KytClientConfig;

  constructor(config: KytClientConfig) {
    this.config = config;
    this.client = this.createHttpClient();
  }

  private createHttpClient(): AxiosInstance {
    const baseURL = this.config.baseUrl ||
      (this.config.environment === 'sandbox' ? API_ENDPOINTS.KYT.SANDBOX : API_ENDPOINTS.KYT.PRODUCTION);

    const client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Token: this.config.apiKey,
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
      let errorMessage = 'KYT API error';

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
          throw new Error(`KYT API error (${status}): ${errorMessage}`);
      }
    }

    throw new Error(`Network error: ${error.message}`);
  }

  // Transfer Operations
  async registerTransfer(userId: string, transfer: TransferRequest): Promise<IDataObject> {
    const response = await this.client.post(`/users/${encodeURIComponent(userId)}/transfers`, transfer);
    return response.data;
  }

  async getTransfer(userId: string, transferId: string): Promise<IDataObject> {
    const response = await this.client.get(`/users/${encodeURIComponent(userId)}/transfers/${transferId}`);
    return response.data;
  }

  async getTransfers(userId: string, pagination?: PaginationParams): Promise<PaginatedResponse<IDataObject>> {
    const response = await this.client.get(`/users/${encodeURIComponent(userId)}/transfers`, {
      params: {
        limit: pagination?.limit || 100,
        offset: pagination?.offset || 0,
      },
    });
    
    const data = response.data as IDataObject;
    const items = (data.items || data.transfers || []) as IDataObject[];
    
    return {
      items,
      total: (data.total as number) || items.length,
      limit: pagination?.limit || 100,
      offset: pagination?.offset || 0,
      hasMore: items.length === (pagination?.limit || 100),
    };
  }

  async getTransferRisk(userId: string, transferId: string): Promise<IDataObject> {
    const response = await this.client.get(`/users/${encodeURIComponent(userId)}/transfers/${transferId}/risk`);
    return response.data;
  }

  async getTransferAlerts(userId: string, transferId: string): Promise<IDataObject[]> {
    const response = await this.client.get(`/users/${encodeURIComponent(userId)}/transfers/${transferId}/alerts`);
    return response.data;
  }

  async getTransferExposure(userId: string, transferId: string): Promise<IDataObject> {
    const response = await this.client.get(`/users/${encodeURIComponent(userId)}/transfers/${transferId}/exposure`);
    return response.data;
  }

  async getSentTransfers(userId: string, pagination?: PaginationParams): Promise<PaginatedResponse<IDataObject>> {
    const response = await this.client.get(`/users/${encodeURIComponent(userId)}/transfers`, {
      params: {
        direction: 'sent',
        limit: pagination?.limit || 100,
        offset: pagination?.offset || 0,
      },
    });
    
    const data = response.data as IDataObject;
    const items = (data.items || data.transfers || []) as IDataObject[];
    
    return {
      items,
      total: (data.total as number) || items.length,
      limit: pagination?.limit || 100,
      offset: pagination?.offset || 0,
      hasMore: items.length === (pagination?.limit || 100),
    };
  }

  async getReceivedTransfers(userId: string, pagination?: PaginationParams): Promise<PaginatedResponse<IDataObject>> {
    const response = await this.client.get(`/users/${encodeURIComponent(userId)}/transfers`, {
      params: {
        direction: 'received',
        limit: pagination?.limit || 100,
        offset: pagination?.offset || 0,
      },
    });
    
    const data = response.data as IDataObject;
    const items = (data.items || data.transfers || []) as IDataObject[];
    
    return {
      items,
      total: (data.total as number) || items.length,
      limit: pagination?.limit || 100,
      offset: pagination?.offset || 0,
      hasMore: items.length === (pagination?.limit || 100),
    };
  }

  // Withdrawal Operations
  async registerWithdrawalAttempt(userId: string, withdrawal: WithdrawalAttemptRequest): Promise<IDataObject> {
    const response = await this.client.post(`/users/${encodeURIComponent(userId)}/withdrawal-attempts`, withdrawal);
    return response.data;
  }

  async getWithdrawalAttempt(userId: string, attemptId: string): Promise<IDataObject> {
    const response = await this.client.get(`/users/${encodeURIComponent(userId)}/withdrawal-attempts/${attemptId}`);
    return response.data;
  }

  async getWithdrawalAttempts(userId: string, pagination?: PaginationParams): Promise<PaginatedResponse<IDataObject>> {
    const response = await this.client.get(`/users/${encodeURIComponent(userId)}/withdrawal-attempts`, {
      params: {
        limit: pagination?.limit || 100,
        offset: pagination?.offset || 0,
      },
    });
    
    const data = response.data as IDataObject;
    const items = (data.items || data.withdrawalAttempts || []) as IDataObject[];
    
    return {
      items,
      total: (data.total as number) || items.length,
      limit: pagination?.limit || 100,
      offset: pagination?.offset || 0,
      hasMore: items.length === (pagination?.limit || 100),
    };
  }

  async getWithdrawalRisk(userId: string, attemptId: string): Promise<IDataObject> {
    const response = await this.client.get(`/users/${encodeURIComponent(userId)}/withdrawal-attempts/${attemptId}/risk`);
    return response.data;
  }

  async getWithdrawalAlerts(userId: string, attemptId: string): Promise<IDataObject[]> {
    const response = await this.client.get(`/users/${encodeURIComponent(userId)}/withdrawal-attempts/${attemptId}/alerts`);
    return response.data;
  }

  // Deposit Address Operations
  async registerDepositAddress(deposit: DepositAddressRequest): Promise<IDataObject> {
    const response = await this.client.post(`/users/${encodeURIComponent(deposit.userId)}/deposit-addresses`, deposit);
    return response.data;
  }

  async getDepositAddress(userId: string, addressId: string): Promise<IDataObject> {
    const response = await this.client.get(`/users/${encodeURIComponent(userId)}/deposit-addresses/${addressId}`);
    return response.data;
  }

  async getDepositAddresses(userId: string, pagination?: PaginationParams): Promise<PaginatedResponse<IDataObject>> {
    const response = await this.client.get(`/users/${encodeURIComponent(userId)}/deposit-addresses`, {
      params: {
        limit: pagination?.limit || 100,
        offset: pagination?.offset || 0,
      },
    });
    
    const data = response.data as IDataObject;
    const items = (data.items || data.depositAddresses || []) as IDataObject[];
    
    return {
      items,
      total: (data.total as number) || items.length,
      limit: pagination?.limit || 100,
      offset: pagination?.offset || 0,
      hasMore: items.length === (pagination?.limit || 100),
    };
  }

  async getDepositAlerts(userId: string, addressId: string): Promise<IDataObject[]> {
    const response = await this.client.get(`/users/${encodeURIComponent(userId)}/deposit-addresses/${addressId}/alerts`);
    return response.data;
  }

  async getDepositRisk(userId: string, addressId: string): Promise<IDataObject> {
    const response = await this.client.get(`/users/${encodeURIComponent(userId)}/deposit-addresses/${addressId}/risk`);
    return response.data;
  }

  async deactivateDepositAddress(userId: string, addressId: string): Promise<IDataObject> {
    const response = await this.client.delete(`/users/${encodeURIComponent(userId)}/deposit-addresses/${addressId}`);
    return response.data;
  }

  // User Operations
  async registerUser(user: UserRequest): Promise<IDataObject> {
    const response = await this.client.post('/users', user);
    return response.data;
  }

  async getUser(userId: string): Promise<IDataObject> {
    const response = await this.client.get(`/users/${encodeURIComponent(userId)}`);
    return response.data;
  }

  async updateUser(userId: string, updates: Partial<UserRequest>): Promise<IDataObject> {
    const response = await this.client.patch(`/users/${encodeURIComponent(userId)}`, updates);
    return response.data;
  }

  async getUsers(pagination?: PaginationParams): Promise<PaginatedResponse<IDataObject>> {
    const response = await this.client.get('/users', {
      params: {
        limit: pagination?.limit || 100,
        offset: pagination?.offset || 0,
      },
    });
    
    const data = response.data as IDataObject;
    const items = (data.items || data.users || []) as IDataObject[];
    
    return {
      items,
      total: (data.total as number) || items.length,
      limit: pagination?.limit || 100,
      offset: pagination?.offset || 0,
      hasMore: items.length === (pagination?.limit || 100),
    };
  }

  async getUserTransfers(userId: string, pagination?: PaginationParams): Promise<PaginatedResponse<IDataObject>> {
    return this.getTransfers(userId, pagination);
  }

  async getUserAlerts(userId: string): Promise<IDataObject[]> {
    const response = await this.client.get(`/users/${encodeURIComponent(userId)}/alerts`);
    return response.data;
  }

  async getUserRiskProfile(userId: string): Promise<IDataObject> {
    const response = await this.client.get(`/users/${encodeURIComponent(userId)}/risk`);
    return response.data;
  }

  async getUserAddresses(userId: string, pagination?: PaginationParams): Promise<PaginatedResponse<IDataObject>> {
    return this.getDepositAddresses(userId, pagination);
  }

  async deactivateUser(userId: string): Promise<IDataObject> {
    const response = await this.client.delete(`/users/${encodeURIComponent(userId)}`);
    return response.data;
  }

  // Summary Operations
  async getSummary(): Promise<IDataObject> {
    const response = await this.client.get('/summary');
    return response.data;
  }

  async getAlertsSummary(): Promise<IDataObject> {
    const response = await this.client.get('/alerts/summary');
    return response.data;
  }
}

/**
 * Create KYT client from n8n credentials
 */
export async function createKytClient(
  context: IExecuteFunctions | ILoadOptionsFunctions,
): Promise<KytClient> {
  let credentials: ICredentialDataDecryptedObject;

  try {
    credentials = await context.getCredentials('chainalysisKyt');
  } catch {
    throw new NodeOperationError(context.getNode(), 'Please configure Chainalysis KYT credentials');
  }

  const config: KytClientConfig = {
    apiKey: credentials.apiKey as string,
    organizationId: credentials.organizationId as string,
    userId: credentials.userId as string,
    environment: (credentials.environment as 'production' | 'sandbox') || 'production',
    baseUrl: credentials.baseUrl as string,
  };

  return new KytClient(config);
}
