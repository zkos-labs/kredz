declare global {
  interface Navigator {
    modelContext?: {
      provideContext: (config: { tools: WebMCPTool[]; signal?: AbortSignal }) => void;
    };
  }
}

interface WebMCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (params: unknown) => Promise<unknown>;
}

export function registerWebMCP(): AbortController | null {
  const mc = navigator.modelContext;
  if (!mc) return null;

  const controller = new AbortController();

  mc.provideContext({
    signal: controller.signal,
    tools: [
      {
        name: 'kredz_get_score',
        description: 'Get a credit score profile for a Midnight address on the Kredz privacy-preserving identity protocol',
        inputSchema: {
          type: 'object',
          properties: {
            address: { type: 'string', description: 'Midnight wallet address (e.g. mn_addr_preprod1...)' },
          },
          required: ['address'],
        },
        execute: async (params: unknown) => {
          const { address } = params as { address: string };
          return { address, tier: null, note: 'Query the Midnight indexer at https://indexer.preprod.midnight.network/api/v4/graphql for live contract state' };
        },
      },
      {
        name: 'kredz_prove_tier',
        description: 'Prove a credit tier (Anonymous/Pseudonymous/Full Compliance) without revealing the exact credit score using ZK selective disclosure',
        inputSchema: {
          type: 'object',
          properties: {
            address: { type: 'string', description: 'Midnight wallet address' },
          },
          required: ['address'],
        },
        execute: async (params: unknown) => {
          const { address } = params as { address: string };
          return { address, note: 'Call prove_tier circuit on the deployed Kredz contract to get the attested tier' };
        },
      },
    ],
  });

  return controller;
}
