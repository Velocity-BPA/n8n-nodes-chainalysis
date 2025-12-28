/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { NETWORKS, type Network } from '../constants/networks';

/**
 * Address format patterns for different networks
 */
const ADDRESS_PATTERNS: Record<string, RegExp> = {
  // Bitcoin - Legacy, SegWit, and Native SegWit
  [NETWORKS.BITCOIN]: /^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/,

  // Ethereum and EVM-compatible (0x prefix, 40 hex chars)
  [NETWORKS.ETHEREUM]: /^0x[a-fA-F0-9]{40}$/,
  [NETWORKS.POLYGON]: /^0x[a-fA-F0-9]{40}$/,
  [NETWORKS.ARBITRUM]: /^0x[a-fA-F0-9]{40}$/,
  [NETWORKS.OPTIMISM]: /^0x[a-fA-F0-9]{40}$/,
  [NETWORKS.BASE]: /^0x[a-fA-F0-9]{40}$/,
  [NETWORKS.BINANCE_SMART_CHAIN]: /^0x[a-fA-F0-9]{40}$/,
  [NETWORKS.AVALANCHE]: /^0x[a-fA-F0-9]{40}$/,
  [NETWORKS.FANTOM]: /^0x[a-fA-F0-9]{40}$/,
  [NETWORKS.CRONOS]: /^0x[a-fA-F0-9]{40}$/,

  // Litecoin
  [NETWORKS.LITECOIN]: /^(L|M|ltc1)[a-zA-HJ-NP-Z0-9]{25,62}$/,

  // Bitcoin Cash
  [NETWORKS.BITCOIN_CASH]: /^(bitcoincash:)?[qp][a-z0-9]{41}$|^[13][a-zA-HJ-NP-Z0-9]{25,34}$/,

  // XRP
  [NETWORKS.RIPPLE]: /^r[0-9a-zA-Z]{24,34}$/,

  // Stellar
  [NETWORKS.STELLAR]: /^G[A-Z2-7]{55}$/,

  // TRON
  [NETWORKS.TRON]: /^T[a-zA-HJ-NP-Z0-9]{33}$/,

  // Dogecoin
  [NETWORKS.DOGECOIN]: /^D[5-9A-HJ-NP-U][a-zA-HJ-NP-Z0-9]{24,33}$/,

  // Solana
  [NETWORKS.SOLANA]: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,

  // Cardano
  [NETWORKS.CARDANO]: /^(addr1|Ae2)[a-zA-Z0-9]{50,100}$/,

  // Cosmos
  [NETWORKS.COSMOS]: /^cosmos[a-z0-9]{38,45}$/,

  // Polkadot
  [NETWORKS.POLKADOT]: /^[1-9A-HJ-NP-Za-km-z]{47,48}$/,

  // Algorand
  [NETWORKS.ALGORAND]: /^[A-Z2-7]{58}$/,

  // NEAR
  [NETWORKS.NEAR]: /^[a-z0-9._-]{2,64}(\.near|\.testnet)?$/,

  // Flow
  [NETWORKS.FLOW]: /^0x[a-fA-F0-9]{16}$/,

  // Hedera
  [NETWORKS.HEDERA]: /^0\.0\.[0-9]+$/,
};

/**
 * Validate cryptocurrency address format
 */
export function validateAddress(address: string, network?: Network): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  const trimmedAddress = address.trim();

  if (network) {
    const pattern = ADDRESS_PATTERNS[network];
    return pattern ? pattern.test(trimmedAddress) : true;
  }

  // If no network specified, check against all patterns
  return Object.values(ADDRESS_PATTERNS).some((pattern) => pattern.test(trimmedAddress));
}

/**
 * Detect network from address format
 */
export function detectNetworkFromAddress(address: string): Network | null {
  if (!address || typeof address !== 'string') {
    return null;
  }

  const trimmedAddress = address.trim();

  // Check EVM addresses first (most common)
  if (/^0x[a-fA-F0-9]{40}$/.test(trimmedAddress)) {
    return NETWORKS.ETHEREUM; // Default to Ethereum for EVM addresses
  }

  // Check Bitcoin
  if (/^(1|3)[a-zA-HJ-NP-Z0-9]{25,34}$/.test(trimmedAddress)) {
    return NETWORKS.BITCOIN;
  }
  if (/^bc1[a-zA-HJ-NP-Z0-9]{39,59}$/.test(trimmedAddress)) {
    return NETWORKS.BITCOIN;
  }

  // Check TRON
  if (/^T[a-zA-HJ-NP-Z0-9]{33}$/.test(trimmedAddress)) {
    return NETWORKS.TRON;
  }

  // Check XRP
  if (/^r[0-9a-zA-Z]{24,34}$/.test(trimmedAddress)) {
    return NETWORKS.RIPPLE;
  }

  // Check Stellar
  if (/^G[A-Z2-7]{55}$/.test(trimmedAddress)) {
    return NETWORKS.STELLAR;
  }

  // Check Solana
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmedAddress)) {
    return NETWORKS.SOLANA;
  }

  // Check Litecoin
  if (/^(L|M)[a-zA-HJ-NP-Z0-9]{25,34}$/.test(trimmedAddress)) {
    return NETWORKS.LITECOIN;
  }
  if (/^ltc1[a-zA-HJ-NP-Z0-9]{39,59}$/.test(trimmedAddress)) {
    return NETWORKS.LITECOIN;
  }

  // Check Cosmos
  if (/^cosmos[a-z0-9]{38,45}$/.test(trimmedAddress)) {
    return NETWORKS.COSMOS;
  }

  return null;
}

/**
 * Normalize address format
 */
export function normalizeAddress(address: string, network?: Network): string {
  if (!address) {
    return '';
  }

  let normalized = address.trim();

  // Handle EVM addresses - normalize to lowercase
  if (network && isEvmNetwork(network)) {
    normalized = normalized.toLowerCase();
  } else if (/^0x[a-fA-F0-9]{40}$/.test(normalized)) {
    normalized = normalized.toLowerCase();
  }

  // Handle Bitcoin Cash prefix
  if (network === NETWORKS.BITCOIN_CASH && !normalized.startsWith('bitcoincash:')) {
    if (/^[qp][a-z0-9]{41}$/.test(normalized)) {
      normalized = `bitcoincash:${normalized}`;
    }
  }

  return normalized;
}

/**
 * Check if network is EVM-compatible
 */
export function isEvmNetwork(network: Network): boolean {
  const evmNetworks: Network[] = [
    NETWORKS.ETHEREUM,
    NETWORKS.POLYGON,
    NETWORKS.ARBITRUM,
    NETWORKS.OPTIMISM,
    NETWORKS.BASE,
    NETWORKS.BINANCE_SMART_CHAIN,
    NETWORKS.AVALANCHE,
    NETWORKS.FANTOM,
    NETWORKS.CRONOS,
  ];
  return evmNetworks.includes(network);
}

/**
 * Parse multiple addresses from input (comma, newline, or space separated)
 */
export function parseAddresses(input: string): string[] {
  if (!input) {
    return [];
  }

  return input
    .split(/[,\n\s]+/)
    .map((addr) => addr.trim())
    .filter((addr) => addr.length > 0);
}

/**
 * Format address for display (truncate middle)
 */
export function formatAddressForDisplay(address: string, prefixLength = 6, suffixLength = 4): string {
  if (!address || address.length <= prefixLength + suffixLength + 3) {
    return address;
  }
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
}

/**
 * Check if address is a contract (basic heuristic)
 */
export function isLikelyContract(address: string): boolean {
  // This is a basic heuristic - EVM contracts typically have code at the address
  // For accurate detection, you would need to query the blockchain
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
    // Known contract prefixes or patterns could be added here
    return false; // Cannot determine without blockchain query
  }
  return false;
}
