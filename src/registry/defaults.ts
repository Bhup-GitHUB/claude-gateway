import type {
  AccountSpec,
  GatewayKeySpec,
  ModelPricing,
  RoutingPolicyName,
} from "../types";

export const DEMO_MODEL = "sim-4o-mini";
export const DEMO_MODEL_LARGE = "sim-4o";

export const MODEL_PRICING: Record<string, ModelPricing> = {
  [DEMO_MODEL]: { inputPer1k: 0.15, outputPer1k: 0.6 },
  [DEMO_MODEL_LARGE]: { inputPer1k: 2.5, outputPer1k: 10 },
};

export const DEFAULT_POLICY: RoutingPolicyName = "quota-aware";

export const MAX_FAILOVER_ATTEMPTS = 3;

export const DEFAULT_ACCOUNTS: AccountSpec[] = [
  {
    id: "alpha",
    provider: "mock",
    endpoint: null,
    credentialEnv: null,
    models: [DEMO_MODEL, DEMO_MODEL_LARGE],
    weight: 3,
    concurrencyCap: 4,
    knownHeadroomTokens: 120000,
    rpmLimit: 60,
    tpmLimit: 90000,
    mock: {
      mode: "healthy",
      firstTokenDelayMs: 120,
      perChunkDelayMs: 15,
      completionTokens: 256,
      failRate: 0,
      throttleRemainingRequests: 0,
      throttleRetryAfterMs: 0,
      exhaustAfterTokens: 0,
      dieAfterChunks: 0,
    },
  },
  {
    id: "bravo",
    provider: "mock",
    endpoint: null,
    credentialEnv: null,
    models: [DEMO_MODEL],
    weight: 2,
    concurrencyCap: 4,
    knownHeadroomTokens: 80000,
    rpmLimit: 40,
    tpmLimit: 60000,
    mock: {
      mode: "healthy",
      firstTokenDelayMs: 150,
      perChunkDelayMs: 20,
      completionTokens: 256,
      failRate: 0,
      throttleRemainingRequests: 0,
      throttleRetryAfterMs: 0,
      exhaustAfterTokens: 0,
      dieAfterChunks: 0,
    },
  },
  {
    id: "charlie",
    provider: "mock",
    endpoint: null,
    credentialEnv: null,
    models: [DEMO_MODEL],
    weight: 2,
    concurrencyCap: 2,
    knownHeadroomTokens: 30000,
    rpmLimit: 30,
    tpmLimit: 40000,
    mock: {
      mode: "healthy",
      firstTokenDelayMs: 140,
      perChunkDelayMs: 18,
      completionTokens: 256,
      failRate: 0,
      throttleRemainingRequests: 0,
      throttleRetryAfterMs: 0,
      exhaustAfterTokens: 45000,
      dieAfterChunks: 0,
    },
  },
  {
    id: "delta",
    provider: "mock",
    endpoint: null,
    credentialEnv: null,
    models: [DEMO_MODEL],
    weight: 1,
    concurrencyCap: 4,
    knownHeadroomTokens: 150000,
    rpmLimit: 80,
    tpmLimit: 120000,
    mock: {
      mode: "slow",
      firstTokenDelayMs: 900,
      perChunkDelayMs: 140,
      completionTokens: 256,
      failRate: 0,
      throttleRemainingRequests: 0,
      throttleRetryAfterMs: 0,
      exhaustAfterTokens: 0,
      dieAfterChunks: 0,
    },
  },
  {
    id: "echo",
    provider: "mock",
    endpoint: null,
    credentialEnv: null,
    models: [DEMO_MODEL],
    weight: 2,
    concurrencyCap: 3,
    knownHeadroomTokens: 100000,
    rpmLimit: 50,
    tpmLimit: 70000,
    mock: {
      mode: "flaky",
      firstTokenDelayMs: 130,
      perChunkDelayMs: 16,
      completionTokens: 256,
      failRate: 0.4,
      throttleRemainingRequests: 0,
      throttleRetryAfterMs: 0,
      exhaustAfterTokens: 0,
      dieAfterChunks: 5,
    },
  },
];

export const DEFAULT_KEYS: GatewayKeySpec[] = [
  { key: "gwk_demo", tenantId: "tenant-demo", scopes: ["chat"] },
  { key: "gwk_ops", tenantId: "tenant-ops", scopes: ["chat", "admin"] },
];

export const TENANTS: { id: string; name: string }[] = [
  { id: "tenant-demo", name: "Demo Tenant" },
  { id: "tenant-ops", name: "Operations" },
];
