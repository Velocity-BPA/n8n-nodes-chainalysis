 itemIndex) as string;
          return client.registerTransfer(userId, {
            network,
            asset: network,
            transferReference: `transfer_${Date.now()}`,
            direction: 'received',
            transferTimestamp: new Date().toISOString(),
            assetAmount: 0,
          });
        }
        case 'getTransfers': { const result = await client.getTransfers(userId, { limit: additionalFields.limit as number }); return result.items; }
        case 'getTransferRisk': {
          const transferId = context.getNodeParameter('transferId', itemIndex, '') as string;
          return client.getTransferRisk(userId, transferId);
        }
        default: throw new NodeOperationError(context.getNode(), `Unknown operation: ${operation}`);
      }
    }
    case 'withdrawal': {
      switch (operation) {
        case 'registerWithdrawalAttempt': {
          const network = context.getNodeParameter('network', itemIndex) as string;
          const address = context.getNodeParameter('address', itemIndex) as string;
          return client.registerWithdrawalAttempt(userId, {
            network,
            asset: network,
            address,
            attemptIdentifier: `withdrawal_${Date.now()}`,
            assetAmount: 0,
            attemptTimestamp: new Date().toISOString(),
          });
        }
        case 'getWithdrawalAttempts': { const result = await client.getWithdrawalAttempts(userId, { limit: additionalFields.limit as number }); return result.items; }
        default: throw new NodeOperationError(context.getNode(), `Unknown operation: ${operation}`);
      }
    }
    case 'deposit': {
      switch (operation) {
        case 'registerDepositAddress': {
          const network = context.getNodeParameter('network', itemIndex) as string;
          const address = context.getNodeParameter('address', itemIndex) as string;
          return client.registerDepositAddress({ network, asset: network, address, userId });
        }
        case 'getDepositAddresses': { const result = await client.getDepositAddresses(userId, { limit: additionalFields.limit as number }); return result.items; }
        default: throw new NodeOperationError(context.getNode(), `Unknown operation: ${operation}`);
      }
    }
    case 'user': {
      switch (operation) {
        case 'registerUser': return client.registerUser({ userId });
        case 'getUser': return client.getUser(userId);
        case 'getUsers': { const result = await client.getUsers({ limit: additionalFields.limit as number }); return result.items; }
        default: throw new NodeOperationError(context.getNode(), `Unknown operation: ${operation}`);
      }
    }
    default:
      throw new NodeOperationError(context.getNode(), `Unknown KYT resource: ${resource}`);
  }
}

async function executeReactorOperation(
  context: IExecuteFunctions,
  client: Awaited<ReturnType<typeof createReactorClient>>,
  resource: string,
  operation: string,
  itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
  const address = context.getNodeParameter('address', itemIndex, '') as string;
  const additionalFields = context.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

  if (resource === 'reactor') {
    const investigationId = context.getNodeParameter('investigationId', itemIndex, '') as string;
    switch (operation) {
      case 'createInvestigation': return client.createInvestigation({ name: 'New Investigation' });
      case 'getInvestigations': { const result = await client.getInvestigations({ limit: additionalFields.limit as number }); return result.items; }
      case 'getInvestigationGraph': return client.getInvestigationGraph(investigationId, { depth: additionalFields.depth as number });
      default: throw new NodeOperationError(context.getNode(), `Unknown operation: ${operation}`);
    }
  } else if (resource === 'graph') {
    switch (operation) {
      case 'getAddressGraph': return client.getAddressGraph(address, { depth: additionalFields.depth as number });
      case 'getShortestPath': {
        const targetAddress = context.getNodeParameter('targetAddress', itemIndex) as string;
        return client.getShortestPath(address, targetAddress);
      }
      case 'getFundFlow': return client.getFundFlow(address, { depth: additionalFields.depth as number });
      default: throw new NodeOperationError(context.getNode(), `Unknown operation: ${operation}`);
    }
  }

  throw new NodeOperationError(context.getNode(), `Unknown Reactor resource: ${resource}`);
}
