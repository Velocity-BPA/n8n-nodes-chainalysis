/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Risk Score Ranges
 * Chainalysis uses a 0-10 scale for risk assessment
 */
export const RISK_SCORE_RANGES = {
  LOW: { min: 0, max: 3 },
  MEDIUM: { min: 3.01, max: 6 },
  HIGH: { min: 6.01, max: 8 },
  SEVERE: { min: 8.01, max: 10 },
} as const;

/**
 * Risk Level Labels
 */
export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  SEVERE: 'severe',
} as const;

export type RiskLevel = (typeof RISK_LEVELS)[keyof typeof RISK_LEVELS];

/**
 * Exposure Types
 */
export const EXPOSURE_TYPES = {
  DIRECT: 'direct',
  INDIRECT: 'indirect',
  INBOUND: 'inbound',
  OUTBOUND: 'outbound',
} as const;

export type ExposureType = (typeof EXPOSURE_TYPES)[keyof typeof EXPOSURE_TYPES];

/**
 * Risk Triggers
 */
export const RISK_TRIGGERS = {
  SANCTIONS_EXPOSURE: 'sanctions_exposure',
  DARKNET_EXPOSURE: 'darknet_exposure',
  RANSOMWARE_EXPOSURE: 'ransomware_exposure',
  SCAM_EXPOSURE: 'scam_exposure',
  STOLEN_FUNDS_EXPOSURE: 'stolen_funds_exposure',
  MIXER_EXPOSURE: 'mixer_exposure',
  HIGH_RISK_EXCHANGE_EXPOSURE: 'high_risk_exchange_exposure',
  HIGH_RISK_JURISDICTION: 'high_risk_jurisdiction',
  UNUSUAL_ACTIVITY: 'unusual_activity',
  RAPID_MOVEMENT: 'rapid_movement',
  LARGE_TRANSACTION: 'large_transaction',
  STRUCTURING: 'structuring',
  CUSTOM_RULE: 'custom_rule',
} as const;

export type RiskTrigger = (typeof RISK_TRIGGERS)[keyof typeof RISK_TRIGGERS];

/**
 * Transfer Directions
 */
export const TRANSFER_DIRECTIONS = {
  SENT: 'sent',
  RECEIVED: 'received',
  INTERNAL: 'internal',
  EXTERNAL: 'external',
} as const;

export type TransferDirection = (typeof TRANSFER_DIRECTIONS)[keyof typeof TRANSFER_DIRECTIONS];

/**
 * Get risk level from score
 */
export function getRiskLevelFromScore(score: number): RiskLevel {
  if (score <= RISK_SCORE_RANGES.LOW.max) {
    return RISK_LEVELS.LOW;
  }
  if (score <= RISK_SCORE_RANGES.MEDIUM.max) {
    return RISK_LEVELS.MEDIUM;
  }
  if (score <= RISK_SCORE_RANGES.HIGH.max) {
    return RISK_LEVELS.HIGH;
  }
  return RISK_LEVELS.SEVERE;
}

/**
 * Risk score thresholds for n8n options
 */
export const RISK_THRESHOLD_OPTIONS = [
  { name: 'Low (0-3)', value: 3 },
  { name: 'Medium (3-6)', value: 6 },
  { name: 'High (6-8)', value: 8 },
  { name: 'Severe (8-10)', value: 10 },
] as const;
