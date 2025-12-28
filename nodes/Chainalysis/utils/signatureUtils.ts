/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import crypto from 'crypto';

/**
 * Webhook signature verification result
 */
export interface SignatureVerificationResult {
  valid: boolean;
  error?: string;
}

/**
 * Verify Chainalysis webhook signature
 *
 * Chainalysis uses HMAC-SHA256 for webhook signatures
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string,
): SignatureVerificationResult {
  if (!signature) {
    return { valid: false, error: 'Missing signature header' };
  }

  if (!secret) {
    return { valid: false, error: 'Missing webhook secret' };
  }

  try {
    const payloadString = typeof payload === 'string' ? payload : payload.toString('utf8');

    // Compute expected signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');

    // Compare signatures using timing-safe comparison
    const providedSignatureBuffer = Buffer.from(signature.toLowerCase(), 'hex');
    const expectedSignatureBuffer = Buffer.from(expectedSignature.toLowerCase(), 'hex');

    if (providedSignatureBuffer.length !== expectedSignatureBuffer.length) {
      return { valid: false, error: 'Signature length mismatch' };
    }

    const valid = crypto.timingSafeEqual(providedSignatureBuffer, expectedSignatureBuffer);

    return { valid, error: valid ? undefined : 'Signature mismatch' };
  } catch (error) {
    return {
      valid: false,
      error: `Signature verification failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Verify Chainalysis webhook signature with timestamp validation
 *
 * Includes replay attack protection by checking timestamp
 */
export function verifyWebhookSignatureWithTimestamp(
  payload: string | Buffer,
  signature: string,
  timestamp: string,
  secret: string,
  toleranceSeconds = 300,
): SignatureVerificationResult {
  if (!timestamp) {
    return { valid: false, error: 'Missing timestamp header' };
  }

  // Validate timestamp
  const timestampNum = parseInt(timestamp, 10);
  if (isNaN(timestampNum)) {
    return { valid: false, error: 'Invalid timestamp format' };
  }

  const now = Math.floor(Date.now() / 1000);
  const diff = Math.abs(now - timestampNum);

  if (diff > toleranceSeconds) {
    return {
      valid: false,
      error: `Timestamp too old or too new (${diff}s difference, tolerance: ${toleranceSeconds}s)`,
    };
  }

  // Verify signature with timestamp included in payload
  const payloadString = typeof payload === 'string' ? payload : payload.toString('utf8');
  const signedPayload = `${timestamp}.${payloadString}`;

  return verifyWebhookSignature(signedPayload, signature, secret);
}

/**
 * Generate webhook signature for testing
 */
export function generateWebhookSignature(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Generate webhook signature with timestamp
 */
export function generateWebhookSignatureWithTimestamp(
  payload: string,
  secret: string,
  timestamp?: number,
): { signature: string; timestamp: number } {
  const ts = timestamp || Math.floor(Date.now() / 1000);
  const signedPayload = `${ts}.${payload}`;
  const signature = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');

  return { signature, timestamp: ts };
}

/**
 * Parse webhook signature header
 *
 * Handles various signature header formats
 */
export function parseSignatureHeader(
  header: string,
): { signature: string; timestamp?: string } | null {
  if (!header) {
    return null;
  }

  // Simple hex signature
  if (/^[a-fA-F0-9]{64}$/.test(header)) {
    return { signature: header };
  }

  // Format: t=timestamp,v1=signature
  const parts = header.split(',');
  let signature: string | undefined;
  let timestamp: string | undefined;

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key === 't') {
      timestamp = value;
    } else if (key === 'v1' || key === 'signature') {
      signature = value;
    }
  }

  if (signature) {
    return { signature, timestamp };
  }

  // Format: sha256=signature
  if (header.startsWith('sha256=')) {
    return { signature: header.slice(7) };
  }

  return null;
}

/**
 * Generate a secure random webhook secret
 */
export function generateWebhookSecret(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash sensitive data for logging (PII protection)
 */
export function hashForLogging(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex').slice(0, 12) + '...';
}
