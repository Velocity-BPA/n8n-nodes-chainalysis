/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IWebhookFunctions } from 'n8n-workflow';
import { verifyWebhookSignature, parseSignatureHeader } from '../utils/signatureUtils';
import { WEBHOOK_EVENTS, type WebhookEventType } from '../constants/endpoints';

/**
 * Webhook event payload structure
 */
export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  timestamp: string;
  data: IDataObject;
  metadata?: {
    organizationId?: string;
    source?: string;
    version?: string;
  };
}

/**
 * Webhook processing result
 */
export interface WebhookProcessingResult {
  success: boolean;
  event?: WebhookEvent;
  error?: string;
}

/**
 * Extract and validate webhook event from request
 */
export async function processWebhookEvent(
  webhookFunctions: IWebhookFunctions,
  webhookSecret?: string,
): Promise<WebhookProcessingResult> {
  const request = webhookFunctions.getRequestObject();
  const body = webhookFunctions.getBodyData() as IDataObject;

  // Verify signature if secret is provided
  if (webhookSecret) {
    const signatureHeader = request.headers['x-chainalysis-signature'] as string ||
                           request.headers['x-signature'] as string;

    if (!signatureHeader) {
      return {
        success: false,
        error: 'Missing signature header',
      };
    }

    const parsed = parseSignatureHeader(signatureHeader);
    if (!parsed) {
      return {
        success: false,
        error: 'Invalid signature header format',
      };
    }

    const payload = JSON.stringify(body);
    const verification = verifyWebhookSignature(payload, parsed.signature, webhookSecret);

    if (!verification.valid) {
      return {
        success: false,
        error: verification.error || 'Signature verification failed',
      };
    }
  }

  // Parse and validate event structure
  const event = parseWebhookEvent(body);
  if (!event) {
    return {
      success: false,
      error: 'Invalid webhook event structure',
    };
  }

  return {
    success: true,
    event,
  };
}

/**
 * Parse webhook body into event structure
 */
function parseWebhookEvent(body: IDataObject): WebhookEvent | null {
  // Support multiple payload formats
  const id = (body.id || body.eventId || body.event_id || generateEventId()) as string;
  const type = (body.type || body.eventType || body.event_type || body.event) as WebhookEventType;
  const timestamp = (body.timestamp || body.createdAt || body.created_at || new Date().toISOString()) as string;
  const data = (body.data || body.payload || body) as IDataObject;

  if (!type) {
    return null;
  }

  return {
    id,
    type,
    timestamp,
    data,
    metadata: body.metadata as WebhookEvent['metadata'],
  };
}

/**
 * Generate unique event ID
 */
function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if event type matches filter
 */
export function matchesEventFilter(
  eventType: WebhookEventType,
  filters: WebhookEventType[],
): boolean {
  if (filters.length === 0) {
    return true; // No filters = match all
  }

  return filters.includes(eventType);
}

/**
 * Get event category from event type
 */
export function getEventCategory(eventType: WebhookEventType): string {
  const categoryMap: Record<string, string[]> = {
    alert: [
      WEBHOOK_EVENTS.ALERT_CREATED,
      WEBHOOK_EVENTS.ALERT_UPDATED,
      WEBHOOK_EVENTS.ALERT_ESCALATED,
      WEBHOOK_EVENTS.ALERT_DISMISSED,
    ],
    address: [
      WEBHOOK_EVENTS.ADDRESS_SCREENED,
      WEBHOOK_EVENTS.ADDRESS_RISK_CHANGED,
      WEBHOOK_EVENTS.ADDRESS_SANCTIONED,
      WEBHOOK_EVENTS.ADDRESS_EXPOSURE_DETECTED,
    ],
    transaction: [
      WEBHOOK_EVENTS.TRANSACTION_SCREENED,
      WEBHOOK_EVENTS.TRANSACTION_RISK_CHANGED,
      WEBHOOK_EVENTS.TRANSACTION_SUSPICIOUS,
      WEBHOOK_EVENTS.TRANSACTION_LARGE,
    ],
    transfer: [
      WEBHOOK_EVENTS.TRANSFER_REGISTERED,
      WEBHOOK_EVENTS.TRANSFER_ALERT,
      WEBHOOK_EVENTS.WITHDRAWAL_ATTEMPT,
      WEBHOOK_EVENTS.DEPOSIT_RECEIVED,
    ],
    case: [
      WEBHOOK_EVENTS.CASE_CREATED,
      WEBHOOK_EVENTS.CASE_UPDATED,
      WEBHOOK_EVENTS.CASE_ASSIGNED,
      WEBHOOK_EVENTS.CASE_CLOSED,
      WEBHOOK_EVENTS.CASE_ESCALATED,
    ],
    sanctions: [
      WEBHOOK_EVENTS.SANCTIONS_MATCH,
      WEBHOOK_EVENTS.SANCTIONS_LIST_UPDATE,
    ],
    monitoring: [
      WEBHOOK_EVENTS.MONITOR_ALERT,
      WEBHOOK_EVENTS.THRESHOLD_EXCEEDED,
    ],
  };

  for (const [category, events] of Object.entries(categoryMap)) {
    if (events.includes(eventType)) {
      return category;
    }
  }

  return 'unknown';
}

/**
 * Format webhook event for n8n output
 */
export function formatWebhookOutput(event: WebhookEvent): IDataObject {
  return {
    eventId: event.id,
    eventType: event.type,
    eventCategory: getEventCategory(event.type),
    timestamp: event.timestamp,
    data: event.data,
    metadata: event.metadata || {},
  };
}

/**
 * Get all supported event types
 */
export function getSupportedEventTypes(): Array<{ name: string; value: WebhookEventType }> {
  return Object.entries(WEBHOOK_EVENTS).map(([key, value]) => ({
    name: key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
    value,
  }));
}

/**
 * Get event types by category
 */
export function getEventTypesByCategory(category: string): WebhookEventType[] {
  const categories: Record<string, WebhookEventType[]> = {
    alert: [
      WEBHOOK_EVENTS.ALERT_CREATED,
      WEBHOOK_EVENTS.ALERT_UPDATED,
      WEBHOOK_EVENTS.ALERT_ESCALATED,
      WEBHOOK_EVENTS.ALERT_DISMISSED,
    ],
    address: [
      WEBHOOK_EVENTS.ADDRESS_SCREENED,
      WEBHOOK_EVENTS.ADDRESS_RISK_CHANGED,
      WEBHOOK_EVENTS.ADDRESS_SANCTIONED,
      WEBHOOK_EVENTS.ADDRESS_EXPOSURE_DETECTED,
    ],
    transaction: [
      WEBHOOK_EVENTS.TRANSACTION_SCREENED,
      WEBHOOK_EVENTS.TRANSACTION_RISK_CHANGED,
      WEBHOOK_EVENTS.TRANSACTION_SUSPICIOUS,
      WEBHOOK_EVENTS.TRANSACTION_LARGE,
    ],
    transfer: [
      WEBHOOK_EVENTS.TRANSFER_REGISTERED,
      WEBHOOK_EVENTS.TRANSFER_ALERT,
      WEBHOOK_EVENTS.WITHDRAWAL_ATTEMPT,
      WEBHOOK_EVENTS.DEPOSIT_RECEIVED,
    ],
    case: [
      WEBHOOK_EVENTS.CASE_CREATED,
      WEBHOOK_EVENTS.CASE_UPDATED,
      WEBHOOK_EVENTS.CASE_ASSIGNED,
      WEBHOOK_EVENTS.CASE_CLOSED,
      WEBHOOK_EVENTS.CASE_ESCALATED,
    ],
    sanctions: [
      WEBHOOK_EVENTS.SANCTIONS_MATCH,
      WEBHOOK_EVENTS.SANCTIONS_LIST_UPDATE,
    ],
    monitoring: [
      WEBHOOK_EVENTS.MONITOR_ALERT,
      WEBHOOK_EVENTS.THRESHOLD_EXCEEDED,
    ],
  };

  return categories[category] || [];
}
