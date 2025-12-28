/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Chainalysis API Endpoints
 */
export const API_ENDPOINTS = {
  // Address Screening
  ADDRESS_SCREENING: {
    PRODUCTION: 'https://api.chainalysis.com/api/risk/v2',
    SANDBOX: 'https://api.chainalysis.com/api/risk/v2/sandbox',
  },

  // KYT (Know Your Transaction)
  KYT: {
    PRODUCTION: 'https://api.chainalysis.com/kyt/v2',
    SANDBOX: 'https://api.chainalysis.com/kyt/v2/sandbox',
  },

  // Reactor
  REACTOR: {
    PRODUCTION: 'https://reactor.chainalysis.com/api/v1',
    SANDBOX: 'https://reactor.chainalysis.com/api/v1/sandbox',
  },

  // Sanctions Screening
  SANCTIONS: {
    PRODUCTION: 'https://api.chainalysis.com/api/sanctions/v1',
    SANDBOX: 'https://api.chainalysis.com/api/sanctions/v1/sandbox',
  },

  // Transaction Monitoring
  TRANSACTION_MONITORING: {
    PRODUCTION: 'https://api.chainalysis.com/api/monitoring/v1',
    SANDBOX: 'https://api.chainalysis.com/api/monitoring/v1/sandbox',
  },
} as const;

/**
 * API Versions
 */
export const API_VERSIONS = {
  ADDRESS_SCREENING: 'v2',
  KYT: 'v2',
  REACTOR: 'v1',
  SANCTIONS: 'v1',
  TRANSACTION_MONITORING: 'v1',
} as const;

/**
 * Webhook Event Types
 */
export const WEBHOOK_EVENTS = {
  // Alert Events
  ALERT_CREATED: 'alert.created',
  ALERT_UPDATED: 'alert.updated',
  ALERT_ESCALATED: 'alert.escalated',
  ALERT_DISMISSED: 'alert.dismissed',

  // Address Events
  ADDRESS_SCREENED: 'address.screened',
  ADDRESS_RISK_CHANGED: 'address.risk_changed',
  ADDRESS_SANCTIONED: 'address.sanctioned',
  ADDRESS_EXPOSURE_DETECTED: 'address.exposure_detected',

  // Transaction Events
  TRANSACTION_SCREENED: 'transaction.screened',
  TRANSACTION_RISK_CHANGED: 'transaction.risk_changed',
  TRANSACTION_SUSPICIOUS: 'transaction.suspicious',
  TRANSACTION_LARGE: 'transaction.large',

  // KYT Events
  TRANSFER_REGISTERED: 'transfer.registered',
  TRANSFER_ALERT: 'transfer.alert',
  WITHDRAWAL_ATTEMPT: 'withdrawal.attempt',
  DEPOSIT_RECEIVED: 'deposit.received',

  // Case Events
  CASE_CREATED: 'case.created',
  CASE_UPDATED: 'case.updated',
  CASE_ASSIGNED: 'case.assigned',
  CASE_CLOSED: 'case.closed',
  CASE_ESCALATED: 'case.escalated',

  // Sanctions Events
  SANCTIONS_MATCH: 'sanctions.match',
  SANCTIONS_LIST_UPDATE: 'sanctions.list_update',

  // Monitoring Events
  MONITOR_ALERT: 'monitor.alert',
  THRESHOLD_EXCEEDED: 'monitor.threshold_exceeded',
} as const;

export type WebhookEventType = (typeof WEBHOOK_EVENTS)[keyof typeof WEBHOOK_EVENTS];
