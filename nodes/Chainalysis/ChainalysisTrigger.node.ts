/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IHookFunctions,
  IWebhookFunctions,
  INodeType,
  INodeTypeDescription,
  IWebhookResponseData,
  IDataObject,
} from 'n8n-workflow';

import { createChainalysisClient, logLicensingNotice } from './transport/chainalysisClient';
import { processWebhookEvent, formatWebhookOutput, getSupportedEventTypes } from './transport/webhookHandler';
import { WEBHOOK_EVENTS } from './constants/endpoints';

logLicensingNotice();

export class ChainalysisTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Chainalysis Trigger',
    name: 'chainalysisTrigger',
    icon: 'file:chainalysis.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["events"]}}',
    description: 'Receive real-time events from Chainalysis via webhooks',
    defaults: {
      name: 'Chainalysis Trigger',
    },
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'chainalysisApi',
        required: true,
      },
    ],
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        path: 'webhook',
      },
    ],
    properties: [
      {
        displayName: 'Event Category',
        name: 'eventCategory',
        type: 'options',
        options: [
          { name: 'All Events', value: 'all' },
          { name: 'Alert Events', value: 'alert' },
          { name: 'Address Events', value: 'address' },
          { name: 'Transaction Events', value: 'transaction' },
          { name: 'Transfer Events (KYT)', value: 'transfer' },
          { name: 'Case Events', value: 'case' },
          { name: 'Sanctions Events', value: 'sanctions' },
          { name: 'Monitoring Events', value: 'monitoring' },
        ],
        default: 'all',
        description: 'Category of events to listen for',
      },
      {
        displayName: 'Events',
        name: 'events',
        type: 'multiOptions',
        options: [
          // Alert Events
          { name: 'Alert Created', value: WEBHOOK_EVENTS.ALERT_CREATED },
          { name: 'Alert Updated', value: WEBHOOK_EVENTS.ALERT_UPDATED },
          { name: 'Alert Escalated', value: WEBHOOK_EVENTS.ALERT_ESCALATED },
          { name: 'Alert Dismissed', value: WEBHOOK_EVENTS.ALERT_DISMISSED },
          // Address Events
          { name: 'Address Screened', value: WEBHOOK_EVENTS.ADDRESS_SCREENED },
          { name: 'Address Risk Changed', value: WEBHOOK_EVENTS.ADDRESS_RISK_CHANGED },
          { name: 'Address Sanctioned', value: WEBHOOK_EVENTS.ADDRESS_SANCTIONED },
          { name: 'Address Exposure Detected', value: WEBHOOK_EVENTS.ADDRESS_EXPOSURE_DETECTED },
          // Transaction Events
          { name: 'Transaction Screened', value: WEBHOOK_EVENTS.TRANSACTION_SCREENED },
          { name: 'Transaction Risk Changed', value: WEBHOOK_EVENTS.TRANSACTION_RISK_CHANGED },
          { name: 'Suspicious Transaction', value: WEBHOOK_EVENTS.TRANSACTION_SUSPICIOUS },
          { name: 'Large Transaction', value: WEBHOOK_EVENTS.TRANSACTION_LARGE },
          // Transfer Events (KYT)
          { name: 'Transfer Registered', value: WEBHOOK_EVENTS.TRANSFER_REGISTERED },
          { name: 'Transfer Alert', value: WEBHOOK_EVENTS.TRANSFER_ALERT },
          { name: 'Withdrawal Attempt', value: WEBHOOK_EVENTS.WITHDRAWAL_ATTEMPT },
          { name: 'Deposit Received', value: WEBHOOK_EVENTS.DEPOSIT_RECEIVED },
          // Case Events
          { name: 'Case Created', value: WEBHOOK_EVENTS.CASE_CREATED },
          { name: 'Case Updated', value: WEBHOOK_EVENTS.CASE_UPDATED },
          { name: 'Case Assigned', value: WEBHOOK_EVENTS.CASE_ASSIGNED },
          { name: 'Case Closed', value: WEBHOOK_EVENTS.CASE_CLOSED },
          { name: 'Case Escalated', value: WEBHOOK_EVENTS.CASE_ESCALATED },
          // Sanctions Events
          { name: 'Sanctions Match', value: WEBHOOK_EVENTS.SANCTIONS_MATCH },
          { name: 'Sanctions List Update', value: WEBHOOK_EVENTS.SANCTIONS_LIST_UPDATE },
          // Monitoring Events
          { name: 'Monitor Alert', value: WEBHOOK_EVENTS.MONITOR_ALERT },
          { name: 'Threshold Exceeded', value: WEBHOOK_EVENTS.THRESHOLD_EXCEEDED },
        ],
        default: [],
        displayOptions: {
          show: {
            eventCategory: ['all'],
          },
        },
        description: 'Specific events to listen for (leave empty for all events)',
      },
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Webhook Secret',
            name: 'webhookSecret',
            type: 'string',
            typeOptions: {
              password: true,
            },
            default: '',
            description: 'Secret for verifying webhook signatures',
          },
          {
            displayName: 'Include Raw Body',
            name: 'includeRawBody',
            type: 'boolean',
            default: false,
            description: 'Whether to include the raw webhook body in the output',
          },
        ],
      },
    ],
  };

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        const webhookUrl = this.getNodeWebhookUrl('default');
        const webhookData = this.getWorkflowStaticData('node');

        if (webhookData.webhookId === undefined) {
          return false;
        }

        try {
          const client = await createChainalysisClient(this, 'chainalysisApi');
          const webhooks = await client.getWebhooks();

          for (const webhook of webhooks) {
            if ((webhook as IDataObject).id === webhookData.webhookId) {
              return true;
            }
          }
        } catch {
          return false;
        }

        return false;
      },

      async create(this: IHookFunctions): Promise<boolean> {
        const webhookUrl = this.getNodeWebhookUrl('default');
        const events = this.getNodeParameter('events', []) as string[];
        const eventCategory = this.getNodeParameter('eventCategory') as string;
        const options = this.getNodeParameter('options', {}) as IDataObject;

        try {
          const client = await createChainalysisClient(this, 'chainalysisApi');

          const webhookData: IDataObject = {
            url: webhookUrl,
            events: events.length > 0 ? events : undefined,
            category: eventCategory !== 'all' ? eventCategory : undefined,
            secret: options.webhookSecret,
            active: true,
          };

          const response = await client.createWebhook(webhookData);

          if (response.id) {
            const staticData = this.getWorkflowStaticData('node');
            staticData.webhookId = response.id;
            return true;
          }
        } catch (error) {
          console.error('Failed to create Chainalysis webhook:', error);
          return false;
        }

        return false;
      },

      async delete(this: IHookFunctions): Promise<boolean> {
        const webhookData = this.getWorkflowStaticData('node');

        if (webhookData.webhookId === undefined) {
          return true;
        }

        try {
          const client = await createChainalysisClient(this, 'chainalysisApi');
          await client.deleteWebhook(webhookData.webhookId as string);
        } catch (error) {
          console.error('Failed to delete Chainalysis webhook:', error);
          return false;
        }

        delete webhookData.webhookId;
        return true;
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const options = this.getNodeParameter('options', {}) as IDataObject;
    const webhookSecret = options.webhookSecret as string | undefined;

    // Process and validate webhook event
    const result = await processWebhookEvent(this, webhookSecret);

    if (!result.success || !result.event) {
      // Return error response but don't throw
      return {
        webhookResponse: {
          status: 400,
          body: { error: result.error || 'Invalid webhook event' },
        },
      };
    }

    // Format output
    const outputData = formatWebhookOutput(result.event);

    // Include raw body if requested
    if (options.includeRawBody) {
      outputData.rawBody = this.getBodyData();
    }

    return {
      workflowData: [this.helpers.returnJsonArray([outputData])],
    };
  }
}
