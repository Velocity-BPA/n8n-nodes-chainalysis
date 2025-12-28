/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Chainalysis Risk Categories
 * Categories used to classify addresses and entities
 */
export const RISK_CATEGORIES = {
  // High Risk Categories
  DARKNET_MARKET: 'darknet market',
  RANSOMWARE: 'ransomware',
  TERRORIST_FINANCING: 'terrorist financing',
  CHILD_ABUSE_MATERIAL: 'child abuse material',
  SANCTIONS: 'sanctions',
  SCAM: 'scam',
  STOLEN_FUNDS: 'stolen funds',
  FRAUD_SHOP: 'fraud shop',

  // Medium Risk Categories
  MIXER: 'mixer',
  HIGH_RISK_EXCHANGE: 'high risk exchange',
  HIGH_RISK_JURISDICTION: 'high risk jurisdiction',
  GAMBLING: 'gambling',
  ILLICIT_ACTOR: 'illicit actor',

  // Low Risk Categories
  EXCHANGE: 'exchange',
  MINING: 'mining',
  P2P_EXCHANGE: 'p2p exchange',
  MERCHANT_SERVICES: 'merchant services',
  PAYMENT_PROCESSOR: 'payment processor',
  HOSTED_WALLET: 'hosted wallet',
  ICO: 'ico',
  DECENTRALIZED_EXCHANGE: 'decentralized exchange',
  DEFI: 'defi',
  NFT: 'nft',
  BRIDGE: 'bridge',

  // Other
  OTHER: 'other',
  UNNAMED_SERVICE: 'unnamed service',
  UNKNOWN: 'unknown',
} as const;

export type RiskCategory = (typeof RISK_CATEGORIES)[keyof typeof RISK_CATEGORIES];

/**
 * Category Risk Levels
 */
export const CATEGORY_RISK_LEVELS: Record<string, 'severe' | 'high' | 'medium' | 'low'> = {
  [RISK_CATEGORIES.DARKNET_MARKET]: 'severe',
  [RISK_CATEGORIES.RANSOMWARE]: 'severe',
  [RISK_CATEGORIES.TERRORIST_FINANCING]: 'severe',
  [RISK_CATEGORIES.CHILD_ABUSE_MATERIAL]: 'severe',
  [RISK_CATEGORIES.SANCTIONS]: 'severe',
  [RISK_CATEGORIES.SCAM]: 'high',
  [RISK_CATEGORIES.STOLEN_FUNDS]: 'high',
  [RISK_CATEGORIES.FRAUD_SHOP]: 'high',
  [RISK_CATEGORIES.MIXER]: 'medium',
  [RISK_CATEGORIES.HIGH_RISK_EXCHANGE]: 'medium',
  [RISK_CATEGORIES.HIGH_RISK_JURISDICTION]: 'medium',
  [RISK_CATEGORIES.GAMBLING]: 'medium',
  [RISK_CATEGORIES.ILLICIT_ACTOR]: 'high',
  [RISK_CATEGORIES.EXCHANGE]: 'low',
  [RISK_CATEGORIES.MINING]: 'low',
  [RISK_CATEGORIES.P2P_EXCHANGE]: 'low',
  [RISK_CATEGORIES.MERCHANT_SERVICES]: 'low',
  [RISK_CATEGORIES.PAYMENT_PROCESSOR]: 'low',
  [RISK_CATEGORIES.HOSTED_WALLET]: 'low',
  [RISK_CATEGORIES.ICO]: 'low',
  [RISK_CATEGORIES.DECENTRALIZED_EXCHANGE]: 'low',
  [RISK_CATEGORIES.DEFI]: 'low',
  [RISK_CATEGORIES.NFT]: 'low',
  [RISK_CATEGORIES.BRIDGE]: 'low',
  [RISK_CATEGORIES.OTHER]: 'low',
  [RISK_CATEGORIES.UNNAMED_SERVICE]: 'low',
  [RISK_CATEGORIES.UNKNOWN]: 'low',
};

/**
 * Entity Types
 */
export const ENTITY_TYPES = {
  EXCHANGE: 'exchange',
  SERVICE: 'service',
  INDIVIDUAL: 'individual',
  ORGANIZATION: 'organization',
  SMART_CONTRACT: 'smart_contract',
  PROTOCOL: 'protocol',
  UNKNOWN: 'unknown',
} as const;

export type EntityType = (typeof ENTITY_TYPES)[keyof typeof ENTITY_TYPES];

/**
 * Alert Types
 */
export const ALERT_TYPES = {
  HIGH_RISK: 'high_risk',
  SANCTIONS: 'sanctions',
  EXPOSURE: 'exposure',
  THRESHOLD: 'threshold',
  CATEGORY: 'category',
  CUSTOM: 'custom',
} as const;

export type AlertType = (typeof ALERT_TYPES)[keyof typeof ALERT_TYPES];

/**
 * Alert Statuses
 */
export const ALERT_STATUSES = {
  NEW: 'new',
  UNDER_REVIEW: 'under_review',
  ESCALATED: 'escalated',
  DISMISSED: 'dismissed',
  RESOLVED: 'resolved',
} as const;

export type AlertStatus = (typeof ALERT_STATUSES)[keyof typeof ALERT_STATUSES];

/**
 * Case Statuses
 */
export const CASE_STATUSES = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  PENDING_REVIEW: 'pending_review',
  ESCALATED: 'escalated',
  CLOSED: 'closed',
  ARCHIVED: 'archived',
} as const;

export type CaseStatus = (typeof CASE_STATUSES)[keyof typeof CASE_STATUSES];
