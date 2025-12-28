# n8n-nodes-chainalysis

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for Chainalysis blockchain analytics, providing 23 resources and 250+ operations for address screening, transaction monitoring, sanctions checking, risk assessment, KYT compliance, and Reactor investigations.

![n8n](https://img.shields.io/badge/n8n-community_node-orange)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## Features

- **Address Screening**: Screen cryptocurrency addresses for risk, exposure, and sanctions
- **Transaction Monitoring**: Real-time transaction screening and risk assessment
- **Sanctions Compliance**: OFAC, UN, and EU sanctions list screening
- **KYT (Know Your Transaction)**: Transfer, withdrawal, and deposit monitoring
- **Risk Assessment**: Comprehensive risk scoring with category breakdowns
- **Entity & Cluster Analysis**: Entity identification and cluster tracking
- **Reactor Investigations**: Graph-based blockchain investigations
- **Webhook Integration**: Real-time event notifications
- **Multi-Network Support**: Bitcoin, Ethereum, TRON, and 25+ networks

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** > **Community Nodes**
3. Click **Install**
4. Enter `n8n-nodes-chainalysis`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n/custom
npm install n8n-nodes-chainalysis
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-chainalysis.git
cd n8n-nodes-chainalysis

# Install dependencies
npm install

# Build the project
npm run build

# Link to n8n
npm link
cd ~/.n8n
npm link n8n-nodes-chainalysis
```

## Credentials Setup

### Chainalysis API Credentials

| Field | Description |
|-------|-------------|
| Product | Select Chainalysis product (Address Screening, KYT, Reactor, Sanctions) |
| API Key | Your Chainalysis API key |
| API Secret | API secret (if required) |
| Organization ID | Your organization identifier |
| Environment | Production or Sandbox |

### Chainalysis KYT Credentials

| Field | Description |
|-------|-------------|
| KYT API Key | Your KYT-specific API key |
| Organization ID | Your organization identifier |
| User ID | Default user ID for operations |
| Environment | Production or Sandbox |

### Chainalysis Reactor Credentials

| Field | Description |
|-------|-------------|
| Reactor API Key | Your Reactor API key |
| Organization ID | Your organization identifier |
| Graph API Endpoint | Custom graph endpoint (optional) |
| Environment | Production or Sandbox |

## Resources & Operations

### Address Screening
- Screen Address
- Get Address Risk
- Get Address Exposures
- Get Address Cluster
- Get Address Summary

### Transaction Screening
- Screen Transaction
- Get Transaction Risk
- Get Transaction Details

### Sanctions Screening
- Check Sanctions Status
- Screen Against OFAC
- Bulk Sanctions Check

### Risk Assessment
- Get Risk Score
- Get Risk Breakdown

### Entity
- Get Entity
- Search Entities

### Cluster
- Get Cluster Info
- Get Cluster Addresses

### Exposure
- Get Direct Exposure
- Get Indirect Exposure

### Alert
- Get Alerts
- Get Alert Details
- Update Alert Status

### Case
- Create Case
- Get Case
- Get Cases

### Transfer (KYT)
- Register Transfer
- Get Transfers
- Get Transfer Risk

### Withdrawal (KYT)
- Register Withdrawal
- Get Withdrawals

### Deposit (KYT)
- Register Deposit Address
- Get Deposit Addresses

### User (KYT)
- Register User
- Get User
- Get Users

### Reactor (Investigations)
- Create Investigation
- Get Investigations
- Get Investigation Graph

### Graph
- Get Address Graph
- Get Shortest Path
- Get Fund Flow

### Webhook
- Create Webhook
- Get Webhooks
- Delete Webhook

### Utility
- Validate Address
- Get API Status
- Test Connection

## Trigger Node

The **Chainalysis Trigger** node receives real-time events via webhooks:

### Event Categories

- **Alert Events**: Alert created, updated, escalated, dismissed
- **Address Events**: Address screened, risk changed, sanctioned
- **Transaction Events**: Transaction screened, suspicious activity
- **Transfer Events (KYT)**: Transfer registered, withdrawal attempt
- **Case Events**: Case created, updated, closed
- **Sanctions Events**: Sanctions match, list updates
- **Monitoring Events**: Threshold exceeded, monitor alerts

## Usage Examples

### Screen an Address

```javascript
// Screen a Bitcoin address for risk
{
  "resource": "addressScreening",
  "operation": "screenAddress",
  "address": "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
  "network": "bitcoin"
}
```

### Check Sanctions Status

```javascript
// Check if address is on any sanctions list
{
  "resource": "sanctionsScreening",
  "operation": "checkSanctions",
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f5aB1D"
}
```

### Register KYT Transfer

```javascript
// Register an incoming transfer for compliance
{
  "resource": "transfer",
  "operation": "registerTransfer",
  "userId": "user_123",
  "network": "ethereum",
  "additionalFields": {
    "assetAmount": 1.5,
    "direction": "received"
  }
}
```

### Create Investigation

```javascript
// Create a new Reactor investigation
{
  "resource": "reactor",
  "operation": "createInvestigation",
  "additionalFields": {
    "name": "Suspicious Activity Investigation",
    "description": "Investigating potential money laundering"
  }
}
```

## Chainalysis Concepts

| Term | Description |
|------|-------------|
| Risk Score | 0-10 scale assessment of address/transaction risk |
| Exposure | Connection to risky addresses (direct or indirect) |
| Direct Exposure | First-hop risk exposure |
| Indirect Exposure | Multi-hop risk exposure |
| Category | Classification of address activity |
| Entity | Known organization or service |
| Cluster | Group of related addresses |
| Attribution | Identity of address owner |
| KYT | Know Your Transaction monitoring |
| Reactor | Investigation and graphing tool |

## Networks

| Network | Symbol | Smart Contracts |
|---------|--------|-----------------|
| Bitcoin | BTC | No |
| Ethereum | ETH | Yes |
| TRON | TRX | Yes |
| Polygon | MATIC | Yes |
| BNB Smart Chain | BNB | Yes |
| Solana | SOL | Yes |
| Litecoin | LTC | No |
| XRP Ledger | XRP | No |
| Arbitrum | ARB | Yes |
| Optimism | OP | Yes |
| Base | ETH | Yes |
| Avalanche | AVAX | Yes |

## Error Handling

Enable "Continue On Fail" in the node settings to handle errors gracefully:

```javascript
// Failed operations return error object
{
  "error": "Address not found"
}
```

## Security Best Practices

- Never log API keys or secrets
- Use environment variables for credentials
- Enable webhook signature verification
- Implement proper access controls
- Follow data retention policies
- Audit API calls regularly

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Lint
npm run lint

# Format
npm run format
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint` and `npm test`
5. Submit a pull request

## Support

- 📖 [Documentation](https://github.com/Velocity-BPA/n8n-nodes-chainalysis)
- 🐛 [Issue Tracker](https://github.com/Velocity-BPA/n8n-nodes-chainalysis/issues)
- 💬 [Discussions](https://github.com/Velocity-BPA/n8n-nodes-chainalysis/discussions)

## Acknowledgments

- [Chainalysis](https://www.chainalysis.com/) for their blockchain analytics platform
- [n8n](https://n8n.io/) for the workflow automation platform
- The open-source community for their contributions
