/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Sanctions Lists
 */
export const SANCTIONS_LISTS = {
  OFAC_SDN: 'ofac_sdn',
  OFAC_CONS: 'ofac_consolidated',
  UN: 'un_sanctions',
  EU: 'eu_sanctions',
  UK: 'uk_sanctions',
  FATF: 'fatf_blacklist',
  CUSTOM: 'custom',
} as const;

export type SanctionsList = (typeof SANCTIONS_LISTS)[keyof typeof SANCTIONS_LISTS];

/**
 * Sanctions List Display Names
 */
export const SANCTIONS_LIST_NAMES: Record<SanctionsList, string> = {
  [SANCTIONS_LISTS.OFAC_SDN]: 'OFAC SDN List',
  [SANCTIONS_LISTS.OFAC_CONS]: 'OFAC Consolidated List',
  [SANCTIONS_LISTS.UN]: 'UN Sanctions',
  [SANCTIONS_LISTS.EU]: 'EU Sanctions',
  [SANCTIONS_LISTS.UK]: 'UK Sanctions',
  [SANCTIONS_LISTS.FATF]: 'FATF Blacklist',
  [SANCTIONS_LISTS.CUSTOM]: 'Custom Watchlist',
};

/**
 * Sanctions Match Status
 */
export const SANCTIONS_MATCH_STATUS = {
  MATCH: 'match',
  NO_MATCH: 'no_match',
  POTENTIAL_MATCH: 'potential_match',
  FALSE_POSITIVE: 'false_positive',
  CONFIRMED_MATCH: 'confirmed_match',
} as const;

export type SanctionsMatchStatus =
  (typeof SANCTIONS_MATCH_STATUS)[keyof typeof SANCTIONS_MATCH_STATUS];

/**
 * Sanctions Programs (OFAC)
 */
export const SANCTIONS_PROGRAMS = {
  CYBER2: 'CYBER2',
  DPRK: 'DPRK',
  DPRK2: 'DPRK2',
  DPRK3: 'DPRK3',
  DPRK4: 'DPRK4',
  GLOMAG: 'GLOMAG',
  IRAN: 'IRAN',
  IRAN_TRA: 'IRAN-TRA',
  IRGC: 'IRGC',
  RUSSIA_EO14024: 'RUSSIA-EO14024',
  SDGT: 'SDGT',
  SDNT: 'SDNT',
  SDNTK: 'SDNTK',
  TCO: 'TCO',
  VENEZUELA: 'VENEZUELA',
} as const;

export type SanctionsProgram = (typeof SANCTIONS_PROGRAMS)[keyof typeof SANCTIONS_PROGRAMS];

/**
 * Sanctions Alert Severity
 */
export const SANCTIONS_ALERT_SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

export type SanctionsAlertSeverity =
  (typeof SANCTIONS_ALERT_SEVERITY)[keyof typeof SANCTIONS_ALERT_SEVERITY];

/**
 * Sanctions screening result interface
 */
export interface SanctionsScreeningResult {
  address: string;
  isMatch: boolean;
  matchStatus: SanctionsMatchStatus;
  lists: SanctionsList[];
  programs: SanctionsProgram[];
  confidence: number;
  lastChecked: string;
  details?: {
    entityName?: string;
    entityType?: string;
    country?: string;
    aliases?: string[];
    notes?: string;
  };
}

/**
 * Sanctions options for n8n dropdowns
 */
export const SANCTIONS_LIST_OPTIONS = [
  { name: 'OFAC SDN List', value: SANCTIONS_LISTS.OFAC_SDN },
  { name: 'OFAC Consolidated', value: SANCTIONS_LISTS.OFAC_CONS },
  { name: 'UN Sanctions', value: SANCTIONS_LISTS.UN },
  { name: 'EU Sanctions', value: SANCTIONS_LISTS.EU },
  { name: 'UK Sanctions', value: SANCTIONS_LISTS.UK },
  { name: 'FATF Blacklist', value: SANCTIONS_LISTS.FATF },
  { name: 'All Lists', value: 'all' },
] as const;
