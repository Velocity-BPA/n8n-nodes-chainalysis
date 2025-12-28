/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Supported Blockchain Networks
 */
export const NETWORKS = {
  // Major Networks
  BITCOIN: 'bitcoin',
  ETHEREUM: 'ethereum',
  LITECOIN: 'litecoin',
  BITCOIN_CASH: 'bitcoin_cash',
  RIPPLE: 'ripple',
  STELLAR: 'stellar',
  TRON: 'tron',
  DOGECOIN: 'dogecoin',

  // Ethereum Layer 2s
  POLYGON: 'polygon',
  ARBITRUM: 'arbitrum',
  OPTIMISM: 'optimism',
  BASE: 'base',

  // EVM Compatible
  BINANCE_SMART_CHAIN: 'binance_smart_chain',
  AVALANCHE: 'avalanche',
  FANTOM: 'fantom',
  CRONOS: 'cronos',

  // Privacy Coins
  MONERO: 'monero',
  ZCASH: 'zcash',
  DASH: 'dash',

  // Stablecoins (represented on multiple chains)
  USDT: 'usdt',
  USDC: 'usdc',
  BUSD: 'busd',
  DAI: 'dai',

  // Other
  SOLANA: 'solana',
  CARDANO: 'cardano',
  POLKADOT: 'polkadot',
  COSMOS: 'cosmos',
  ALGORAND: 'algorand',
  NEAR: 'near',
  FLOW: 'flow',
  HEDERA: 'hedera',
} as const;

export type Network = (typeof NETWORKS)[keyof typeof NETWORKS];

/**
 * Network Display Names
 */
export const NETWORK_NAMES: Record<Network, string> = {
  [NETWORKS.BITCOIN]: 'Bitcoin',
  [NETWORKS.ETHEREUM]: 'Ethereum',
  [NETWORKS.LITECOIN]: 'Litecoin',
  [NETWORKS.BITCOIN_CASH]: 'Bitcoin Cash',
  [NETWORKS.RIPPLE]: 'XRP Ledger',
  [NETWORKS.STELLAR]: 'Stellar',
  [NETWORKS.TRON]: 'TRON',
  [NETWORKS.DOGECOIN]: 'Dogecoin',
  [NETWORKS.POLYGON]: 'Polygon',
  [NETWORKS.ARBITRUM]: 'Arbitrum',
  [NETWORKS.OPTIMISM]: 'Optimism',
  [NETWORKS.BASE]: 'Base',
  [NETWORKS.BINANCE_SMART_CHAIN]: 'BNB Smart Chain',
  [NETWORKS.AVALANCHE]: 'Avalanche',
  [NETWORKS.FANTOM]: 'Fantom',
  [NETWORKS.CRONOS]: 'Cronos',
  [NETWORKS.MONERO]: 'Monero',
  [NETWORKS.ZCASH]: 'Zcash',
  [NETWORKS.DASH]: 'Dash',
  [NETWORKS.USDT]: 'Tether (USDT)',
  [NETWORKS.USDC]: 'USD Coin (USDC)',
  [NETWORKS.BUSD]: 'Binance USD (BUSD)',
  [NETWORKS.DAI]: 'Dai',
  [NETWORKS.SOLANA]: 'Solana',
  [NETWORKS.CARDANO]: 'Cardano',
  [NETWORKS.POLKADOT]: 'Polkadot',
  [NETWORKS.COSMOS]: 'Cosmos',
  [NETWORKS.ALGORAND]: 'Algorand',
  [NETWORKS.NEAR]: 'NEAR Protocol',
  [NETWORKS.FLOW]: 'Flow',
  [NETWORKS.HEDERA]: 'Hedera',
};

/**
 * Network Symbols
 */
export const NETWORK_SYMBOLS: Record<Network, string> = {
  [NETWORKS.BITCOIN]: 'BTC',
  [NETWORKS.ETHEREUM]: 'ETH',
  [NETWORKS.LITECOIN]: 'LTC',
  [NETWORKS.BITCOIN_CASH]: 'BCH',
  [NETWORKS.RIPPLE]: 'XRP',
  [NETWORKS.STELLAR]: 'XLM',
  [NETWORKS.TRON]: 'TRX',
  [NETWORKS.DOGECOIN]: 'DOGE',
  [NETWORKS.POLYGON]: 'MATIC',
  [NETWORKS.ARBITRUM]: 'ARB',
  [NETWORKS.OPTIMISM]: 'OP',
  [NETWORKS.BASE]: 'ETH',
  [NETWORKS.BINANCE_SMART_CHAIN]: 'BNB',
  [NETWORKS.AVALANCHE]: 'AVAX',
  [NETWORKS.FANTOM]: 'FTM',
  [NETWORKS.CRONOS]: 'CRO',
  [NETWORKS.MONERO]: 'XMR',
  [NETWORKS.ZCASH]: 'ZEC',
  [NETWORKS.DASH]: 'DASH',
  [NETWORKS.USDT]: 'USDT',
  [NETWORKS.USDC]: 'USDC',
  [NETWORKS.BUSD]: 'BUSD',
  [NETWORKS.DAI]: 'DAI',
  [NETWORKS.SOLANA]: 'SOL',
  [NETWORKS.CARDANO]: 'ADA',
  [NETWORKS.POLKADOT]: 'DOT',
  [NETWORKS.COSMOS]: 'ATOM',
  [NETWORKS.ALGORAND]: 'ALGO',
  [NETWORKS.NEAR]: 'NEAR',
  [NETWORKS.FLOW]: 'FLOW',
  [NETWORKS.HEDERA]: 'HBAR',
};

/**
 * Network options for n8n dropdowns
 */
export const NETWORK_OPTIONS = Object.entries(NETWORK_NAMES).map(([value, name]) => ({
  name,
  value,
}));

/**
 * Primary Networks (most commonly used)
 */
export const PRIMARY_NETWORK_OPTIONS = [
  { name: 'Bitcoin', value: NETWORKS.BITCOIN },
  { name: 'Ethereum', value: NETWORKS.ETHEREUM },
  { name: 'TRON', value: NETWORKS.TRON },
  { name: 'Polygon', value: NETWORKS.POLYGON },
  { name: 'BNB Smart Chain', value: NETWORKS.BINANCE_SMART_CHAIN },
  { name: 'Solana', value: NETWORKS.SOLANA },
  { name: 'Litecoin', value: NETWORKS.LITECOIN },
  { name: 'XRP Ledger', value: NETWORKS.RIPPLE },
] as const;

/**
 * Check if network supports smart contracts
 */
export function supportsSmartContracts(network: Network): boolean {
  const smartContractNetworks: Network[] = [
    NETWORKS.ETHEREUM,
    NETWORKS.POLYGON,
    NETWORKS.ARBITRUM,
    NETWORKS.OPTIMISM,
    NETWORKS.BASE,
    NETWORKS.BINANCE_SMART_CHAIN,
    NETWORKS.AVALANCHE,
    NETWORKS.FANTOM,
    NETWORKS.CRONOS,
    NETWORKS.SOLANA,
    NETWORKS.CARDANO,
    NETWORKS.TRON,
    NETWORKS.ALGORAND,
    NETWORKS.NEAR,
    NETWORKS.FLOW,
  ];
  return smartContractNetworks.includes(network);
}
