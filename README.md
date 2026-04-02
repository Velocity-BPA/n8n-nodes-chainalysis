# n8n-nodes-chainalysis

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

This n8n community node provides comprehensive integration with Chainalysis blockchain analytics platform, offering 5 specialized resources for cryptocurrency compliance and investigation workflows. Key capabilities include address screening for sanctions compliance, real-time transaction monitoring, risk assessment scoring, and detailed address intelligence gathering.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Blockchain Analytics](https://img.shields.io/badge/Blockchain-Analytics-orange)
![Compliance](https://img.shields.io/badge/Compliance-Ready-green)
![Cryptocurrency](https://img.shields.io/badge/Crypto-Intelligence-purple)

## Features

- **Address Screening** - Screen cryptocurrency addresses against sanctions lists and known entities
- **Transaction Monitoring** - Monitor blockchain transactions in real-time for suspicious activity
- **Sanctions Compliance** - Automated compliance checking against OFAC and international sanctions lists
- **Risk Assessment** - Calculate risk scores for addresses and transactions based on behavioral patterns
- **Address Intelligence** - Gather comprehensive intelligence on cryptocurrency addresses and entities
- **Multi-Chain Support** - Support for Bitcoin, Ethereum, and other major blockchain networks
- **Real-Time Alerts** - Configure automated alerts for high-risk transactions and addresses
- **Compliance Reporting** - Generate detailed compliance reports for regulatory requirements

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-chainalysis`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-chainalysis
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-chainalysis.git
cd n8n-nodes-chainalysis
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-chainalysis
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API Key | Your Chainalysis API key from the dashboard | Yes |
| Environment | API environment (production/sandbox) | Yes |
| Base URL | Custom API base URL (optional) | No |

## Resources & Operations

### 1. Address Screening

| Operation | Description |
|-----------|-------------|
| Screen Address | Screen a single cryptocurrency address against sanctions lists |
| Batch Screen | Screen multiple addresses simultaneously |
| Get Screening Results | Retrieve results from a previous screening operation |
| Update Screening | Update screening parameters for an existing address |

### 2. Transaction Monitoring

| Operation | Description |
|-----------|-------------|
| Monitor Transaction | Monitor a specific transaction for compliance violations |
| Set Monitoring Rules | Configure automated monitoring rules and thresholds |
| Get Monitoring Alerts | Retrieve active monitoring alerts |
| Stop Monitoring | Disable monitoring for specific transactions or addresses |
| Get Transaction History | Retrieve monitoring history for transactions |

### 3. Sanctions Compliance

| Operation | Description |
|-----------|-------------|
| Check Sanctions | Check address or entity against current sanctions lists |
| Get Sanctions List | Retrieve current sanctions lists and updates |
| Validate Compliance | Perform comprehensive compliance validation |
| Generate Compliance Report | Create detailed compliance reports |
| Export Compliance Data | Export compliance data for regulatory submissions |

### 4. Risk Assessment

| Operation | Description |
|-----------|-------------|
| Calculate Risk Score | Calculate risk score for addresses or transactions |
| Get Risk Factors | Retrieve detailed risk factor analysis |
| Set Risk Thresholds | Configure custom risk scoring thresholds |
| Compare Risk Profiles | Compare risk profiles between multiple addresses |
| Generate Risk Report | Create comprehensive risk assessment reports |

### 5. Address Intelligence

| Operation | Description |
|-----------|-------------|
| Get Address Intelligence | Retrieve comprehensive intelligence on cryptocurrency addresses |
| Get Entity Information | Get detailed information about known entities |
| Search Addresses | Search addresses by various criteria |
| Get Address Cluster | Retrieve address clustering information |
| Get Transaction Graph | Analyze transaction flow and relationships |

## Usage Examples

```javascript
// Screen Bitcoin address for sanctions compliance
{
  "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "currency": "BTC",
  "screening_type": "sanctions"
}
```

```javascript
// Monitor Ethereum transaction for suspicious activity
{
  "transaction_hash": "0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060",
  "network": "ethereum",
  "monitoring_rules": ["high_risk_addresses", "large_amounts"]
}
```

```javascript
// Calculate risk score for multiple addresses
{
  "addresses": [
    "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy"
  ],
  "risk_factors": ["sanctions", "darkweb", "exchange"],
  "include_details": true
}
```

```javascript
// Get comprehensive address intelligence
{
  "address": "34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo",
  "currency": "BTC",
  "include_transactions": true,
  "include_clustering": true,
  "date_range": "30d"
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid API Key | API authentication failed | Verify API key in credentials |
| Rate Limit Exceeded | Too many requests in time period | Implement request throttling |
| Address Not Found | Cryptocurrency address not recognized | Verify address format and network |
| Insufficient Permissions | API key lacks required permissions | Contact Chainalysis support for access |
| Network Timeout | Request timeout during API call | Retry request or check network connectivity |
| Invalid Currency | Unsupported cryptocurrency specified | Use supported currency codes (BTC, ETH, etc.) |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
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
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-chainalysis/issues)
- **Chainalysis API Documentation**: [Chainalysis Developer Portal](https://docs.chainalysis.com)
- **Blockchain Compliance Guide**: [Chainalysis Compliance Resources](https://www.chainalysis.com/compliance)