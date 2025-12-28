/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 */

import { validateAddress, detectNetworkFromAddress, normalizeAddress } from '../../nodes/Chainalysis/utils/addressUtils';
import { getRiskLevelFromScore, calculateOverallRiskLevel } from '../../nodes/Chainalysis/utils/riskUtils';
import { verifyWebhookSignature, generateWebhookSignature } from '../../nodes/Chainalysis/utils/signatureUtils';
import { NETWORKS } from '../../nodes/Chainalysis/constants/networks';
import { RISK_LEVELS } from '../../nodes/Chainalysis/constants/riskLevels';

describe('Address Utils', () => {
  describe('validateAddress', () => {
    it('should validate Bitcoin addresses', () => {
      expect(validateAddress('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2', NETWORKS.BITCOIN)).toBe(true);
      expect(validateAddress('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', NETWORKS.BITCOIN)).toBe(true);
      expect(validateAddress('bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', NETWORKS.BITCOIN)).toBe(true);
    });

    it('should validate Ethereum addresses', () => {
      expect(validateAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f5aB1D', NETWORKS.ETHEREUM)).toBe(true);
      expect(validateAddress('0x742d35cc6634c0532925a3b844bc9e7595f5ab1d', NETWORKS.ETHEREUM)).toBe(true);
    });

    it('should reject invalid addresses', () => {
      expect(validateAddress('invalid', NETWORKS.BITCOIN)).toBe(false);
      expect(validateAddress('0xinvalid', NETWORKS.ETHEREUM)).toBe(false);
      expect(validateAddress('', NETWORKS.BITCOIN)).toBe(false);
    });
  });

  describe('detectNetworkFromAddress', () => {
    it('should detect Bitcoin network', () => {
      expect(detectNetworkFromAddress('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2')).toBe(NETWORKS.BITCOIN);
      expect(detectNetworkFromAddress('bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq')).toBe(NETWORKS.BITCOIN);
    });

    it('should detect Ethereum network', () => {
      expect(detectNetworkFromAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f5aB1D')).toBe(NETWORKS.ETHEREUM);
    });

    it('should detect TRON network', () => {
      expect(detectNetworkFromAddress('TJCnKsPa7y5okkXvQAidZBzqx3QyQ6sxMW')).toBe(NETWORKS.TRON);
    });

    it('should return null for unknown addresses', () => {
      expect(detectNetworkFromAddress('invalid')).toBe(null);
    });
  });

  describe('normalizeAddress', () => {
    it('should normalize Ethereum addresses to lowercase', () => {
      expect(normalizeAddress('0x742D35CC6634C0532925A3B844BC9E7595F5AB1D', NETWORKS.ETHEREUM))
        .toBe('0x742d35cc6634c0532925a3b844bc9e7595f5ab1d');
    });

    it('should trim whitespace', () => {
      expect(normalizeAddress('  0x742d35cc6634c0532925a3b844bc9e7595f5ab1d  ', NETWORKS.ETHEREUM))
        .toBe('0x742d35cc6634c0532925a3b844bc9e7595f5ab1d');
    });
  });
});

describe('Risk Utils', () => {
  describe('getRiskLevelFromScore', () => {
    it('should return LOW for scores 0-3', () => {
      expect(getRiskLevelFromScore(0)).toBe(RISK_LEVELS.LOW);
      expect(getRiskLevelFromScore(1.5)).toBe(RISK_LEVELS.LOW);
      expect(getRiskLevelFromScore(3)).toBe(RISK_LEVELS.LOW);
    });

    it('should return MEDIUM for scores 3.01-6', () => {
      expect(getRiskLevelFromScore(3.5)).toBe(RISK_LEVELS.MEDIUM);
      expect(getRiskLevelFromScore(5)).toBe(RISK_LEVELS.MEDIUM);
      expect(getRiskLevelFromScore(6)).toBe(RISK_LEVELS.MEDIUM);
    });

    it('should return HIGH for scores 6.01-8', () => {
      expect(getRiskLevelFromScore(6.5)).toBe(RISK_LEVELS.HIGH);
      expect(getRiskLevelFromScore(7.5)).toBe(RISK_LEVELS.HIGH);
      expect(getRiskLevelFromScore(8)).toBe(RISK_LEVELS.HIGH);
    });

    it('should return SEVERE for scores 8.01-10', () => {
      expect(getRiskLevelFromScore(8.5)).toBe(RISK_LEVELS.SEVERE);
      expect(getRiskLevelFromScore(9.5)).toBe(RISK_LEVELS.SEVERE);
      expect(getRiskLevelFromScore(10)).toBe(RISK_LEVELS.SEVERE);
    });
  });

  describe('calculateOverallRiskLevel', () => {
    it('should calculate weighted risk score', () => {
      const result = calculateOverallRiskLevel(5, 3, 4, 2);
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(10);
      expect(result.level).toBeDefined();
    });

    it('should return low risk for zero values', () => {
      const result = calculateOverallRiskLevel(0, 0, 0, 0);
      expect(result.score).toBe(0);
      expect(result.level).toBe(RISK_LEVELS.LOW);
    });
  });
});

describe('Signature Utils', () => {
  const testSecret = 'test-webhook-secret';
  const testPayload = '{"type":"alert.created","data":{"id":"123"}}';

  describe('generateWebhookSignature', () => {
    it('should generate consistent signatures', () => {
      const sig1 = generateWebhookSignature(testPayload, testSecret);
      const sig2 = generateWebhookSignature(testPayload, testSecret);
      expect(sig1).toBe(sig2);
    });

    it('should generate different signatures for different payloads', () => {
      const sig1 = generateWebhookSignature(testPayload, testSecret);
      const sig2 = generateWebhookSignature('different payload', testSecret);
      expect(sig1).not.toBe(sig2);
    });
  });

  describe('verifyWebhookSignature', () => {
    it('should verify valid signatures', () => {
      const signature = generateWebhookSignature(testPayload, testSecret);
      const result = verifyWebhookSignature(testPayload, signature, testSecret);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid signatures', () => {
      const result = verifyWebhookSignature(testPayload, 'invalid-signature', testSecret);
      expect(result.valid).toBe(false);
    });

    it('should handle missing signature', () => {
      const result = verifyWebhookSignature(testPayload, '', testSecret);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Missing signature header');
    });

    it('should handle missing secret', () => {
      const signature = generateWebhookSignature(testPayload, testSecret);
      const result = verifyWebhookSignature(testPayload, signature, '');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Missing webhook secret');
    });
  });
});
