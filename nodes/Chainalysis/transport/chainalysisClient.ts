/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import axios, { type AxiosInstance, type AxiosError, type AxiosRequestConfig } from 'axios';
import type {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  ICredentialDataDecryptedObject,
  IDataObject,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { API_ENDPOINTS } from '../constants/endpoints';

/**
 * Chainalysis API client configuration
 */
export interface ChainalysisClientConfig {
  product: 'addressScreening' | 'kyt' | 'reactor' | 'sanctions' | 'transactionMonitoring' | 'custom';
  apiKey: string;
  apiSecret?: string;
  organizationId?: string;
  environment: 'production' | 'sandbox';
  baseUrl?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  limit?: number;
  offset?: number;
  cursor?: string;
  page?: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  nextCursor?: string;
}

/**
 * Error codes from Chainalysis API
 */
export const ERROR_CODES = {
  INVALID_ADDRESS: 'INVALID_ADDRESS',
  ADDRESS_NOT_FOUND: 'ADDRESS_NOT_FOUND',
  TRANSACTION_NOT_FOUND: 'TRANSACTION_NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  INVALID_REQUEST: 'INVALID_REQUEST',
  ENTITY_NOT_FOUND: 'ENTITY_NOT_FOUND',
} as const;

/**
 * Chainalysis API Client
 */
export class ChainalysisClient {
  private client: AxiosInstance;
  private config: ChainalysisClientConfig;

  constructor(config: ChainalysisClientConfig) {
    this.config = config;
    this.client = this.createHttpClient();
  }

  private createHttpClient(): AxiosInstance {
    const baseURL = this.getBaseUrl();

    const client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-API-Key': this.config.apiKey,
      },
    });

    if (this.config.organizationId) {
      client.defaults.headers.common['X-Organization-ID'] = this.config.organizationId;
    }

    client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => this.handleError(error),
    );

    return client;
  }

  private getBaseUrl(): string {
    if (this.config.baseUrl) {
      return this.config.baseUrl;
    }

    const env = this.config.environment === 'sandbox' ? 'SANDBOX' : 'PRODUCTION';

    switch (this.config.product) {
      case 'addressScreening':
        return API_ENDPOINTS.ADDRESS_SCREENING[env];
      case 'kyt':
        return API_ENDPOINTS.KYT[env];
      case 'reactor':
        return API_ENDPOINTS.REACTOR[env];
      case 'sanctions':
        return API_ENDPOINTS.SANCTIONS[env];
      case 'transactionMonitoring':
        return API_ENDPOINTS.TRANSACTION_MONITORING[env];
      default:
        return API_ENDPOINTS.ADDRESS_SCREENING[env];
    }
  }

  private handleError(error: AxiosError): never {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as IDataObject;
      let errorMessage = 'Chainalysis API error';

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
        case 500:
        case 502:
        case 503:
          throw new Error(`Server error: ${errorMessage}`);
        default:
          throw new Error(`API error (${status}): ${errorMessage}`);
      }
    }

    if (error.code === 'ECONNREFUSED') {
      throw new Error('Connection refused: Unable to reach Chainalysis API');
    }

    if (error.code === 'ETIMEDOUT') {
      throw new Error('Request timeout: Chainalysis API did not respond');
    }

    throw new Error(`Network error: ${error.message}`);
  }

  async get<T>(path: string, params?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(path, { params, ...config });
    return response.data;
  }

  async post<T>(path: string, data?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(path, data, config);
    return response.data;
  }

  async put<T>(path: string, data?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(path, data, config);
    return response.data;
  }

  async patch<T>(path: string, data?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(path, data, config);
    return response.data;
  }

  async delete<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(path, config);
    return response.data;
  }

  async getPaginated<T>(
    path: string,
    pagination: PaginationParams,
    params?: Record<string, unknown>,
  ): Promise<PaginatedResponse<T>> {
    const response = await this.get<{
      items?: T[];
      data?: T[];
      total?: number;
      count?: number;
      nextCursor?: string;
      hasMore?: boolean;
    }>(path, {
      ...params,
      limit: pagination.limit || 100,
      offset: pagination.offset || 0,
      cursor: pagination.cursor,
    });

    const items = response.items || response.data || [];
    const total = response.total || response.count || items.length;

    return {
      items,
      total,
      limit: pagination.limit || 100,
      offset: pagination.offset || 0,
      hasMore: response.hasMore ?? items.length === (pagination.limit || 100),
      nextCursor: response.nextCursor,
    };
  }

  // Address Screening
  async screenAddress(address: string, network?: string): Promise<IDataObject> {
    return this.post('/addresses', { address, network });
  }

  async screenAddressesBatch(addresses: Array<{ address: string; network?: string }>): Promise<IDataObject[]> {
    return this.post('/addresses/batch', { addresses });
  }

  async getAddressRisk(address: string): Promise<IDataObject> {
    return this.get(`/addresses/${encodeURIComponent(address)}/risk`);
  }

  async getAddressIdentifications(address: string): Promise<IDataObject> {
    return this.get(`/addresses/${encodeURIComponent(address)}/identifications`);
  }

  async getAddressExposures(address: string): Promise<IDataObject> {
    return this.get(`/addresses/${encodeURIComponent(address)}/exposures`);
  }

  async getAddressCategories(address: string): Promise<IDataObject> {
    return this.get(`/addresses/${encodeURIComponent(address)}/categories`);
  }

  async getAddressCluster(address: string): Promise<IDataObject> {
    return this.get(`/addresses/${encodeURIComponent(address)}/cluster`);
  }

  async getAddressEntities(address: string): Promise<IDataObject> {
    return this.get(`/addresses/${encodeURIComponent(address)}/entities`);
  }

  async getAddressSanctionsStatus(address: string): Promise<IDataObject> {
    return this.get(`/addresses/${encodeURIComponent(address)}/sanctions`);
  }

  async getAddressTransactions(address: string, pagination?: PaginationParams): Promise<PaginatedResponse<IDataObject>> {
    return this.getPaginated(`/addresses/${encodeURIComponent(address)}/transactions`, pagination || {});
  }

  async getAddressSummary(address: string): Promise<IDataObject> {
    return this.get(`/addresses/${encodeURIComponent(address)}/summary`);
  }

  async getAddressLabels(address: string): Promise<IDataObject> {
    return this.get(`/addresses/${encodeURIComponent(address)}/labels`);
  }

  async registerAddress(address: string, data: IDataObject): Promise<IDataObject> {
    return this.post('/addresses/register', { address, ...data });
  }

  async getRegisteredAddresses(pagination?: PaginationParams): Promise<PaginatedResponse<IDataObject>> {
    return this.getPaginated('/addresses/registered', pagination || {});
  }

  // Transaction Screening
  async screenTransaction(txHash: string, network: string, outputAddress?: string): Promise<IDataObject> {
    return this.post('/transactions', { hash: txHash, network, outputAddress });
  }

  async screenTransactionsBatch(transactions: Array<{ hash: string; network: string }>): Promise<IDataObject[]> {
    return this.post('/transactions/batch', { transactions });
  }

  async getTransactionRisk(txHash: string): Promise<IDataObject> {
    return this.get(`/transactions/${encodeURIComponent(txHash)}/risk`);
  }

  async getTransactionDetails(txHash: string): Promise<IDataObject> {
    return this.get(`/transactions/${encodeURIComponent(txHash)}`);
  }

  async getTransactionEntities(txHash: string): Promise<IDataObject> {
    return this.get(`/transactions/${encodeURIComponent(txHash)}/entities`);
  }

  async getTransactionExposures(txHash: string): Promise<IDataObject> {
    return this.get(`/transactions/${encodeURIComponent(txHash)}/exposures`);
  }

  // Sanctions Screening
  async checkSanctions(address: string): Promise<IDataObject> {
    return this.get(`/sanctions/address/${encodeURIComponent(address)}`);
  }

  async screenAgainstOFAC(address: string): Promise<IDataObject> {
    return this.post('/sanctions/ofac', { address });
  }

  async screenAgainstUN(address: string): Promise<IDataObject> {
    return this.post('/sanctions/un', { address });
  }

  async screenAgainstEU(address: string): Promise<IDataObject> {
    return this.post('/sanctions/eu', { address });
  }

  async bulkSanctionsCheck(addresses: string[]): Promise<IDataObject[]> {
    return this.post('/sanctions/batch', { addresses });
  }

  async getSanctionsAlerts(pagination?: PaginationParams): Promise<PaginatedResponse<IDataObject>> {
    return this.getPaginated('/sanctions/alerts', pagination || {});
  }

  // Risk Assessment
  async getRiskScore(address: string): Promise<IDataObject> {
    return this.get(`/risk/address/${encodeURIComponent(address)}/score`);
  }

  async getRiskBreakdown(address: string): Promise<IDataObject> {
    return this.get(`/risk/address/${encodeURIComponent(address)}/breakdown`);
  }

  async getRiskCategories(address: string): Promise<IDataObject> {
    return this.get(`/risk/address/${encodeURIComponent(address)}/categories`);
  }

  async getRiskTriggers(address: string): Promise<IDataObject> {
    return this.get(`/risk/address/${encodeURIComponent(address)}/triggers`);
  }

  async getRiskExposure(address: string): Promise<IDataObject> {
    return this.get(`/risk/address/${encodeURIComponent(address)}/exposure`);
  }

  // Entity
  async getEntity(entityId: string): Promise<IDataObject> {
    return this.get(`/entities/${encodeURIComponent(entityId)}`);
  }

  async searchEntities(query: string, filters?: IDataObject): Promise<IDataObject> {
    return this.get('/entities/search', { q: query, ...filters });
  }

  async getEntityCategories(entityId: string): Promise<IDataObject> {
    return this.get(`/entities/${encodeURIComponent(entityId)}/categories`);
  }

  async getEntityAddresses(entityId: string, pagination?: PaginationParams): Promise<PaginatedResponse<IDataObject>> {
    return this.getPaginated(`/entities/${encodeURIComponent(entityId)}/addresses`, pagination || {});
  }

  // Cluster
  async getCluster(clusterId: string): Promise<IDataObject> {
    return this.get(`/clusters/${encodeURIComponent(clusterId)}`);
  }

  async getClusterAddresses(clusterId: string, pagination?: PaginationParams): Promise<PaginatedResponse<IDataObject>> {
    return this.getPaginated(`/clusters/${encodeURIComponent(clusterId)}/addresses`, pagination || {});
  }

  async getClusterBalance(clusterId: string): Promise<IDataObject> {
    return this.get(`/clusters/${encodeURIComponent(clusterId)}/balance`);
  }

  async getClusterTransactions(clusterId: string, pagination?: PaginationParams): Promise<PaginatedResponse<IDataObject>> {
    return this.getPaginated(`/clusters/${encodeURIComponent(clusterId)}/transactions`, pagination || {});
  }

  // Exposure
  async getDirectExposure(address: string): Promise<IDataObject> {
    return this.get(`/exposure/address/${encodeURIComponent(address)}/direct`);
  }

  async getIndirectExposure(address: string): Promise<IDataObject> {
    return this.get(`/exposure/address/${encodeURIComponent(address)}/indirect`);
  }

  async getExposureByCategory(address: string, category: string): Promise<IDataObject> {
    return this.get(`/exposure/address/${encodeURIComponent(address)}/category/${category}`);
  }

  // Alert
  async getAlerts(filters?: IDataObject): Promise<PaginatedResponse<IDataObject>> {
    return this.getPaginated('/alerts', { limit: 100 }, filters);
  }

  async getAlert(alertId: string): Promise<IDataObject> {
    return this.get(`/alerts/${encodeURIComponent(alertId)}`);
  }

  async updateAlertStatus(alertId: string, status: string, note?: string): Promise<IDataObject> {
    return this.patch(`/alerts/${encodeURIComponent(alertId)}`, { status, note });
  }

  async dismissAlert(alertId: string, reason: string): Promise<IDataObject> {
    return this.post(`/alerts/${encodeURIComponent(alertId)}/dismiss`, { reason });
  }

  async escalateAlert(alertId: string, note?: string): Promise<IDataObject> {
    return this.post(`/alerts/${encodeURIComponent(alertId)}/escalate`, { note });
  }

  async createAlertRule(data: IDataObject): Promise<IDataObject> {
    return this.post('/alerts/rules', data);
  }

  async getAlertRules(): Promise<IDataObject[]> {
    return this.get('/alerts/rules');
  }

  // Case
  async createCase(data: IDataObject): Promise<IDataObject> {
    return this.post('/cases', data);
  }

  async getCase(caseId: string): Promise<IDataObject> {
    return this.get(`/cases/${encodeURIComponent(caseId)}`);
  }

  async updateCase(caseId: string, data: IDataObject): Promise<IDataObject> {
    return this.patch(`/cases/${encodeURIComponent(caseId)}`, data);
  }

  async closeCase(caseId: string, resolution: string): Promise<IDataObject> {
    return this.post(`/cases/${encodeURIComponent(caseId)}/close`, { resolution });
  }

  async getCases(filters?: IDataObject): Promise<PaginatedResponse<IDataObject>> {
    return this.getPaginated('/cases', { limit: 100 }, filters);
  }

  async addAlertToCase(caseId: string, alertId: string): Promise<IDataObject> {
    return this.post(`/cases/${encodeURIComponent(caseId)}/alerts`, { alertId });
  }

  async addNoteToCase(caseId: string, note: string): Promise<IDataObject> {
    return this.post(`/cases/${encodeURIComponent(caseId)}/notes`, { content: note });
  }

  // Webhook
  async createWebhook(data: IDataObject): Promise<IDataObject> {
    return this.post('/webhooks', data);
  }

  async getWebhooks(): Promise<IDataObject[]> {
    return this.get('/webhooks');
  }

  async getWebhook(webhookId: string): Promise<IDataObject> {
    return this.get(`/webhooks/${encodeURIComponent(webhookId)}`);
  }

  async updateWebhook(webhookId: string, data: IDataObject): Promise<IDataObject> {
    return this.patch(`/webhooks/${encodeURIComponent(webhookId)}`, data);
  }

  async deleteWebhook(webhookId: string): Promise<void> {
    await this.delete(`/webhooks/${encodeURIComponent(webhookId)}`);
  }

  async testWebhook(webhookId: string): Promise<IDataObject> {
    return this.post(`/webhooks/${encodeURIComponent(webhookId)}/test`, {});
  }

  // Report
  async generateRiskReport(address: string, options?: IDataObject): Promise<IDataObject> {
    return this.post('/reports/risk', { address, ...options });
  }

  async getReportStatus(reportId: string): Promise<IDataObject> {
    return this.get(`/reports/${encodeURIComponent(reportId)}/status`);
  }

  async downloadReport(reportId: string): Promise<IDataObject> {
    return this.get(`/reports/${encodeURIComponent(reportId)}/download`);
  }

  // Audit
  async getAuditLog(filters?: IDataObject): Promise<PaginatedResponse<IDataObject>> {
    return this.getPaginated('/audit/logs', { limit: 100 }, filters);
  }

  async getApiCalls(filters?: IDataObject): Promise<PaginatedResponse<IDataObject>> {
    return this.getPaginated('/audit/api-calls', { limit: 100 }, filters);
  }

  // Configuration
  async getRiskSettings(): Promise<IDataObject> {
    return this.get('/config/risk-settings');
  }

  async updateRiskSettings(settings: IDataObject): Promise<IDataObject> {
    return this.put('/config/risk-settings', settings);
  }

  async getAlertThresholds(): Promise<IDataObject> {
    return this.get('/config/alert-thresholds');
  }

  async updateAlertThresholds(thresholds: IDataObject): Promise<IDataObject> {
    return this.put('/config/alert-thresholds', thresholds);
  }

  async getSupportedAssets(): Promise<IDataObject[]> {
    return this.get('/config/supported-assets');
  }

  async getSupportedNetworks(): Promise<IDataObject[]> {
    return this.get('/config/supported-networks');
  }

  // Network
  async getNetworkInfo(network: string): Promise<IDataObject> {
    return this.get(`/networks/${encodeURIComponent(network)}`);
  }

  async getNetworkStatistics(network: string): Promise<IDataObject> {
    return this.get(`/networks/${encodeURIComponent(network)}/statistics`);
  }

  // Utility
  async validateAddress(address: string): Promise<IDataObject> {
    return this.post('/util/validate-address', { address });
  }

  async getApiStatus(): Promise<IDataObject> {
    return this.get('/status');
  }

  async getRateLimits(): Promise<IDataObject> {
    return this.get('/rate-limits');
  }

  async testConnection(): Promise<IDataObject> {
    return this.get('/status');
  }
}

/**
 * Create Chainalysis client from n8n credentials
 */
export async function createChainalysisClient(
  context: IExecuteFunctions | ILoadOptionsFunctions,
  credentialType: 'chainalysisApi' | 'chainalysisKyt' | 'chainalysisReactor' = 'chainalysisApi',
): Promise<ChainalysisClient> {
  let credentials: ICredentialDataDecryptedObject;

  try {
    credentials = await context.getCredentials(credentialType);
  } catch {
    throw new NodeOperationError(context.getNode(), `Please configure ${credentialType} credentials`);
  }

  const config: ChainalysisClientConfig = {
    product: (credentials.product as ChainalysisClientConfig['product']) || 'addressScreening',
    apiKey: credentials.apiKey as string,
    apiSecret: credentials.apiSecret as string,
    organizationId: credentials.organizationId as string,
    environment: (credentials.environment as 'production' | 'sandbox') || 'production',
    baseUrl: credentials.baseUrl as string,
  };

  return new ChainalysisClient(config);
}

/**
 * Log licensing notice (called once per node load)
 */
let licensingNoticeLogged = false;

export function logLicensingNotice(): void {
  if (!licensingNoticeLogged) {
    console.warn(`
[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
`);
    licensingNoticeLogged = true;
  }
}
