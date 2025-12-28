/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { NodeOperationError, type INode } from 'n8n-workflow';
import { validateAddress, detectNetworkFromAddress } from './addressUtils';
import type { Network } from '../constants/networks';

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate required string field
 */
export function validateRequiredString(
  value: unknown,
  fieldName: string,
  node: INode,
): string {
  if (value === undefined || value === null || value === '') {
    throw new NodeOperationError(node, `${fieldName} is required`, {
      description: `Please provide a valid ${fieldName}`,
    });
  }

  if (typeof value !== 'string') {
    throw new NodeOperationError(node, `${fieldName} must be a string`, {
      description: `Expected string but received ${typeof value}`,
    });
  }

  return value.trim();
}

/**
 * Validate optional string field
 */
export function validateOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value !== 'string') {
    return String(value);
  }

  return value.trim();
}

/**
 * Validate cryptocurrency address
 */
export function validateCryptoAddress(
  address: unknown,
  network: Network | undefined,
  node: INode,
): string {
  const addressStr = validateRequiredString(address, 'Address', node);

  if (!validateAddress(addressStr, network)) {
    const detectedNetwork = detectNetworkFromAddress(addressStr);
    if (detectedNetwork && network && detectedNetwork !== network) {
      throw new NodeOperationError(
        node,
        `Address appears to be for ${detectedNetwork}, not ${network}`,
        {
          description: 'Please check the address format matches the selected network',
        },
      );
    }

    throw new NodeOperationError(node, 'Invalid cryptocurrency address format', {
      description: `The provided address "${addressStr}" does not match expected format`,
    });
  }

  return addressStr;
}

/**
 * Validate transaction hash
 */
export function validateTransactionHash(
  hash: unknown,
  network: Network | undefined,
  node: INode,
): string {
  const hashStr = validateRequiredString(hash, 'Transaction Hash', node);

  // EVM transaction hashes are 66 characters (0x + 64 hex)
  if (network && isEvmLikeNetwork(network)) {
    if (!/^0x[a-fA-F0-9]{64}$/.test(hashStr)) {
      throw new NodeOperationError(node, 'Invalid EVM transaction hash format', {
        description: 'Transaction hash should be 0x followed by 64 hexadecimal characters',
      });
    }
  }

  // Bitcoin transaction hashes are 64 hex characters
  if (network === 'bitcoin' || network === 'litecoin') {
    if (!/^[a-fA-F0-9]{64}$/.test(hashStr)) {
      throw new NodeOperationError(node, 'Invalid Bitcoin-style transaction hash format', {
        description: 'Transaction hash should be 64 hexadecimal characters',
      });
    }
  }

  return hashStr;
}

/**
 * Check if network is EVM-like
 */
function isEvmLikeNetwork(network: Network): boolean {
  const evmNetworks = [
    'ethereum',
    'polygon',
    'arbitrum',
    'optimism',
    'base',
    'binance_smart_chain',
    'avalanche',
    'fantom',
    'cronos',
  ];
  return evmNetworks.includes(network);
}

/**
 * Validate numeric value within range
 */
export function validateNumber(
  value: unknown,
  fieldName: string,
  node: INode,
  options: { min?: number; max?: number; integer?: boolean } = {},
): number {
  if (value === undefined || value === null || value === '') {
    throw new NodeOperationError(node, `${fieldName} is required`, {
      description: `Please provide a valid ${fieldName}`,
    });
  }

  const num = Number(value);

  if (isNaN(num)) {
    throw new NodeOperationError(node, `${fieldName} must be a valid number`, {
      description: `Expected number but received "${value}"`,
    });
  }

  if (options.integer && !Number.isInteger(num)) {
    throw new NodeOperationError(node, `${fieldName} must be an integer`, {
      description: `Expected integer but received ${num}`,
    });
  }

  if (options.min !== undefined && num < options.min) {
    throw new NodeOperationError(node, `${fieldName} must be at least ${options.min}`, {
      description: `Received ${num}`,
    });
  }

  if (options.max !== undefined && num > options.max) {
    throw new NodeOperationError(node, `${fieldName} must be at most ${options.max}`, {
      description: `Received ${num}`,
    });
  }

  return num;
}

/**
 * Validate optional number
 */
export function validateOptionalNumber(
  value: unknown,
  options: { min?: number; max?: number; integer?: boolean } = {},
): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const num = Number(value);

  if (isNaN(num)) {
    return undefined;
  }

  if (options.integer && !Number.isInteger(num)) {
    return undefined;
  }

  if (options.min !== undefined && num < options.min) {
    return undefined;
  }

  if (options.max !== undefined && num > options.max) {
    return undefined;
  }

  return num;
}

/**
 * Validate enum value
 */
export function validateEnum<T extends string>(
  value: unknown,
  fieldName: string,
  allowedValues: readonly T[],
  node: INode,
): T {
  const strValue = validateRequiredString(value, fieldName, node);

  if (!allowedValues.includes(strValue as T)) {
    throw new NodeOperationError(node, `Invalid ${fieldName}: ${strValue}`, {
      description: `Allowed values: ${allowedValues.join(', ')}`,
    });
  }

  return strValue as T;
}

/**
 * Validate ISO date string
 */
export function validateDateString(value: unknown, fieldName: string, node: INode): string {
  const strValue = validateRequiredString(value, fieldName, node);

  const date = new Date(strValue);
  if (isNaN(date.getTime())) {
    throw new NodeOperationError(node, `Invalid date format for ${fieldName}`, {
      description: 'Please provide a valid ISO 8601 date string',
    });
  }

  return date.toISOString();
}

/**
 * Validate optional date string
 */
export function validateOptionalDateString(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const strValue = typeof value === 'string' ? value.trim() : String(value);
  const date = new Date(strValue);

  if (isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
}

/**
 * Validate array of strings
 */
export function validateStringArray(
  value: unknown,
  fieldName: string,
  node: INode,
): string[] {
  if (!value) {
    throw new NodeOperationError(node, `${fieldName} is required`, {
      description: `Please provide at least one ${fieldName}`,
    });
  }

  if (typeof value === 'string') {
    // Try to parse as JSON array or split by comma
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((v) => String(v).trim()).filter((v) => v.length > 0);
      }
    } catch {
      // Not JSON, split by comma
      return value
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
    }
  }

  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter((v) => v.length > 0);
  }

  throw new NodeOperationError(node, `${fieldName} must be an array`, {
    description: `Expected array but received ${typeof value}`,
  });
}

/**
 * Validate UUID format
 */
export function validateUuid(value: unknown, fieldName: string, node: INode): string {
  const strValue = validateRequiredString(value, fieldName, node);

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(strValue)) {
    throw new NodeOperationError(node, `Invalid UUID format for ${fieldName}`, {
      description: 'Please provide a valid UUID',
    });
  }

  return strValue.toLowerCase();
}

/**
 * Validate risk score (0-10)
 */
export function validateRiskScore(value: unknown, fieldName: string, node: INode): number {
  return validateNumber(value, fieldName, node, { min: 0, max: 10 });
}
