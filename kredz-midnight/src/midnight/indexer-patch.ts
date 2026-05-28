import { ContractState } from '@midnight-ntwrk/compact-runtime';
import { LedgerParameters, ZswapChainState } from '@midnight-ntwrk/ledger-v8';

function fromHex(hex: string): Uint8Array {
  const normalized = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (normalized.length % 2 !== 0) throw new Error('Invalid hex string');
  const bytes = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < normalized.length; i += 2) {
    bytes[i / 2] = parseInt(normalized.slice(i, i + 2), 16);
  }
  return bytes;
}

export function createPatchedPublicDataProvider(queryUrl: string, subscriptionUrl: string) {
  async function queryLatest(query: string, address: string) {
    const res = await fetch(queryUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query, variables: { address } }),
    });
    if (!res.ok) throw new Error(`Indexer HTTP error: ${res.status}`);
    const payload = await res.json();
    if (payload.errors?.length) throw new Error(payload.errors.map((e: any) => e.message).join('; '));
    return payload.data?.contractAction ?? null;
  }

  return {
    async queryContractState(contractAddress: string, config?: any) {
      if (config) {
        const res = await queryLatest(
          `query STATE_WITH_CONFIG($address: HexEncoded!, $config: StateConfigInput!) {
            contractAction(address: $address) { state(config: $config) }
          }`,
          contractAddress,
        );
        return res ? ContractState.deserialize(fromHex(res.state)) : null;
      }

      const action = await queryLatest(
        `query LATEST_STATE($address: HexEncoded!) {
          contractAction(address: $address) { state }
        }`,
        contractAddress,
      );
      return action ? ContractState.deserialize(fromHex(action.state)) : null;
    },

    async queryZSwapAndContractState(contractAddress: string, config?: any) {
      if (config) {
        const res = await fetch(queryUrl, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            query: `query ZSWAP_AND_STATE($address: HexEncoded!) {
              contractAction(address: $address) {
                state
                zswapState
                transaction { block { ledgerParameters } }
              }
            }`,
            variables: { address: contractAddress },
          }),
        });
        if (!res.ok) throw new Error(`Indexer HTTP error: ${res.status}`);
        const payload = await res.json();
        const action = payload.data?.contractAction;
        if (!action?.zswapState) return null;
        return [
          ZswapChainState.deserialize(fromHex(action.zswapState)),
          ContractState.deserialize(fromHex(action.state)),
          action.transaction?.block?.ledgerParameters
            ? LedgerParameters.deserialize(fromHex(action.transaction.block.ledgerParameters))
            : LedgerParameters.initialParameters(),
        ];
      }

      const action = await queryLatest(
        `query ZSWAP_AND_STATE($address: HexEncoded!) {
          contractAction(address: $address) {
            state
            zswapState
            transaction { block { ledgerParameters } }
          }
        }`,
        contractAddress,
      );

      if (!action?.zswapState) return null;
      return [
        ZswapChainState.deserialize(fromHex(action.zswapState)),
        ContractState.deserialize(fromHex(action.state)),
        action.transaction?.block?.ledgerParameters
          ? LedgerParameters.deserialize(fromHex(action.transaction.block.ledgerParameters))
          : LedgerParameters.initialParameters(),
      ];
    },
  };
}
