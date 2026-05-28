// kredz.xyz — EffectStream multichain sync engine
//
// Replaces manual relayer/index.ts polling. Uses EffectStream's Sync Service
// to read events from all 5 networks and feed them into a unified state machine
// that computes the KREDZ Score (0-1000).
//
// Reference: https://effectstream.github.io/docs/
// Template: https://github.com/effectstream/effectstream/tree/main/templates/evm-midnight-v2

import { ConfigBuilder, ConfigNetworkType, ConfigSyncProtocolType } from '@effectstream/sm';
import { PrimitiveTypeEVMERC20 } from '@effectstream/sm/builtin';

// Midnight network for ZK contract events
const midnightNetwork = {
  name: 'midnight',
  type: ConfigNetworkType.MIDNIGHT,
};

// EVM network for Base SBT badge events
const evmNetwork = {
  name: 'base',
  type: ConfigNetworkType.EVM,
};

// Cardano network for wallet history analysis (Layer 1 scoring)
const cardanoNetwork = {
  name: 'cardano',
  type: ConfigNetworkType.CARDANO,
};

// Solana network for ScoreBadge PDA events
const solanaNetwork = {
  name: 'solana',
  type: ConfigNetworkType.SOLANA,
};

// NTP deterministic clock (main protocol — heartbeat of the state machine)
const ntpNetwork = {
  name: 'ntp',
  type: ConfigNetworkType.NTP,
};

export const kredzConfig = new ConfigBuilder()
  // Step 1: Define all 5 networks
  .buildNetworks(builder =>
    builder
      .addNetwork({
        name: 'ntp',
        type: ConfigNetworkType.NTP,
        startTime: Date.now(),
        blockTimeMS: 1000,
      })
      .addNetwork({
        name: 'midnight',
        type: ConfigNetworkType.MIDNIGHT,
      })
      .addNetwork({
        name: 'base',
        type: ConfigNetworkType.EVM,
      })
      .addNetwork({
        name: 'cardano',
        type: ConfigNetworkType.CARDANO,
      })
      .addNetwork({
        name: 'solana',
        type: ConfigNetworkType.SOLANA,
      })
  )

  // Step 2: Define contract deployments (aliases for cleaner config)
  .buildDeployments(builder =>
    builder
      .addDeployment(
        networks => networks.base,
        () => ({
          name: 'KredzScoreBadge',
          address: process.env.VITE_BADGE_ADDRESS || '0x0000000000000000000000000000000000000000',
        }),
      )
  )

  // Step 3: Define sync protocols
  .buildSyncProtocols(builder =>
    builder
      // Main clock — deterministic timeline for the state machine
      .addMain(
        networks => networks.ntp,
        () => ({
          name: 'mainNtp',
          type: ConfigSyncProtocolType.NTP_MAIN,
          startBlockHeight: 1,
          pollingInterval: 1000,
        }),
      )
      // Midnight — ZK contract events (score updates, tier changes, attestations)
      .addParallel(
        networks => networks.midnight,
        () => ({
          name: 'parallelMidnight',
          type: ConfigSyncProtocolType.MIDNIGHT_PARALLEL,
          startBlockHeight: 1,
          pollingInterval: 1000,
          indexer: process.env.MIDNIGHT_INDEXER || 'http://localhost:8088/api/v1/graphql',
        }),
      )
      // Base — EVM SBT badge events
      .addParallel(
        networks => networks.base,
        () => ({
          name: 'parallelBase',
          type: ConfigSyncProtocolType.EVM_RPC_PARALLEL,
          chainUri: process.env.BASE_RPC || 'https://sepolia.base.org',
          startBlockHeight: 1,
          pollingInterval: 500,
        }),
      )
      // Cardano — wallet history for Layer 1 scoring
      .addParallel(
        networks => networks.cardano,
        () => ({
          name: 'parallelCardano',
          type: ConfigSyncProtocolType.CARDANO_CARP_PARALLEL,
          startBlockHeight: 1,
          pollingInterval: 5000,
          carpUrl: process.env.CARDANO_CARP_URL || 'https://cardano-preview.blockfrost.io/api/v0',
        }),
      )
  )

  // Step 4: Define primitives (event watchers that feed the state machine)
  .buildPrimitives(builder =>
    builder
      // Midnight: score attestation events from kredz.compact
      .addPrimitive(
        protocols => protocols.parallelMidnight,
        () => ({
          name: 'KredzScoreUpdated',
          type: 'PrimitiveTypeMidnightGeneric',
          startBlockHeight: 0,
          scheduledPrefix: 'scoreUpdated',
        }),
      )
      // Midnight: tier change events
      .addPrimitive(
        protocols => protocols.parallelMidnight,
        () => ({
          name: 'KredzTierChanged',
          type: 'PrimitiveTypeMidnightGeneric',
          startBlockHeight: 0,
          scheduledPrefix: 'tierChanged',
        }),
      )
      // Midnight: attestation stored events (triggers cross-chain relay)
      .addPrimitive(
        protocols => protocols.parallelMidnight,
        () => ({
          name: 'KredzAttestationStored',
          type: 'PrimitiveTypeMidnightGeneric',
          startBlockHeight: 0,
          scheduledPrefix: 'attestationStored',
        }),
      )
      // Midnight: literacy module completion events
      .addPrimitive(
        protocols => protocols.parallelMidnight,
        () => ({
          name: 'KredzLiteracyCompleted',
          type: 'PrimitiveTypeMidnightGeneric',
          startBlockHeight: 0,
          scheduledPrefix: 'literacyCompleted',
        }),
      )
      // Base: ERC-20 transfer event on KredzScoreBadge SBT
      .addPrimitive(
        protocols => protocols.parallelBase,
        (_, deployments) => ({
          name: 'KredzSbtEvents',
          type: PrimitiveTypeEVMERC20,
          startBlockHeight: 0,
          contractAddress: deployments['KredzScoreBadge']?.address || '0x0',
          scheduledPrefix: 'sbtEvent',
        }),
      )
      // Cardano: wallet transaction history for Layer 1 scoring
      .addPrimitive(
        protocols => protocols.parallelCardano,
        () => ({
          name: 'CardanoWalletHistory',
          type: 'PrimitiveTypeCardanoTransfer',
          startBlockHeight: 0,
          scheduledPrefix: 'cardanoTx',
        }),
      )
  )

  .build();
