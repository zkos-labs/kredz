import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  attestorSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  attest_score(context: __compactRuntime.CircuitContext<PS>,
               user_pubkey_0: Uint8Array,
               score_0: bigint,
               salt_0: Uint8Array,
               tier_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  prove_tier(context: __compactRuntime.CircuitContext<PS>,
             user_pubkey_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  prove_score_hash(context: __compactRuntime.CircuitContext<PS>,
                   user_pubkey_0: Uint8Array,
                   score_0: bigint,
                   salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
  link_evm(context: __compactRuntime.CircuitContext<PS>,
           user_pubkey_0: Uint8Array,
           evm_address_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  link_solana(context: __compactRuntime.CircuitContext<PS>,
              user_pubkey_0: Uint8Array,
              solana_address_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  attest_score(context: __compactRuntime.CircuitContext<PS>,
               user_pubkey_0: Uint8Array,
               score_0: bigint,
               salt_0: Uint8Array,
               tier_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  prove_tier(context: __compactRuntime.CircuitContext<PS>,
             user_pubkey_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  prove_score_hash(context: __compactRuntime.CircuitContext<PS>,
                   user_pubkey_0: Uint8Array,
                   score_0: bigint,
                   salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
  link_evm(context: __compactRuntime.CircuitContext<PS>,
           user_pubkey_0: Uint8Array,
           evm_address_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  link_solana(context: __compactRuntime.CircuitContext<PS>,
              user_pubkey_0: Uint8Array,
              solana_address_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  attest_score(context: __compactRuntime.CircuitContext<PS>,
               user_pubkey_0: Uint8Array,
               score_0: bigint,
               salt_0: Uint8Array,
               tier_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  prove_tier(context: __compactRuntime.CircuitContext<PS>,
             user_pubkey_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  prove_score_hash(context: __compactRuntime.CircuitContext<PS>,
                   user_pubkey_0: Uint8Array,
                   score_0: bigint,
                   salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
  link_evm(context: __compactRuntime.CircuitContext<PS>,
           user_pubkey_0: Uint8Array,
           evm_address_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  link_solana(context: __compactRuntime.CircuitContext<PS>,
              user_pubkey_0: Uint8Array,
              solana_address_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly initialized: boolean;
  readonly attestor_key: Uint8Array;
  readonly total_users: bigint;
  tiers: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  score_hashes: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  evm_linked: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  solana_linked: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  readonly attestor_nonce: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
