import type { Hono } from "hono";

export type AppEnv = {
  Bindings: Env;
  Variables: Record<string, unknown>;
};

export type ErrorClass =
  | "throttled"
  | "budget_exhausted"
  | "auth_invalid"
  | "upstream_error"
  | "invalid_request"
  | "cancelled"
  | "terminated_stream"
  | "unknown";

export type QuotaProvenance = "provider-reported" | "estimated" | "unknown";

export type AccountStatus = "active" | "cooldown" | "budget_exhausted" | "disabled";

export type RoutingPolicyName =
  | "fill-first"
  | "round-robin"
  | "least-loaded"
  | "quota-aware";

export type GatewayKeyScope = "chat" | "admin";

export interface Usage {
  inputTokens: number;
  outputTokens: number;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ModelPricing {
  inputPer1k: number;
  outputPer1k: number;
}

export type MockMode =
  | "healthy"
  | "throttle"
  | "exhausted"
  | "slow"
  | "flaky"
  | "dead";

export interface MockScript {
  mode: MockMode;
  firstTokenDelayMs: number;
  perChunkDelayMs: number;
  completionTokens: number;
  failRate: number;
  throttleRemainingRequests: number;
  throttleRetryAfterMs: number;
  exhaustAfterTokens: number;
  dieAfterChunks: number;
}

export interface AccountSpec {
  id: string;
  provider: string;
  endpoint: string | null;
  credentialEnv: string | null;
  models: string[];
  weight: number;
  concurrencyCap: number;
  knownHeadroomTokens: number | null;
  rpmLimit: number | null;
  tpmLimit: number | null;
  mock: MockScript | null;
}

export interface AccountRecord {
  id: string;
  runId: string | null;
  provider: string;
  endpoint: string | null;
  credentialEnv: string | null;
  models: string[];
  weight: number;
  concurrencyCap: number;
  status: AccountStatus;
  statusReason: string | null;
  headroomTokens: number | null;
  headroomProvenance: QuotaProvenance;
  headroomUpdatedAt: number | null;
  reservedTokens: number;
  inflight: number;
  rpmWindowStart: number | null;
  rpmRequests: number;
  tpmTokens: number;
  rpmLimit: number | null;
  tpmLimit: number | null;
  cooldownUntil: number | null;
  budgetResetAt: number | null;
  mock: MockScript | null;
}

export interface QuotaSnapshot {
  accountId: string;
  status: AccountStatus;
  statusReason: string | null;
  headroomTokens: number | null;
  headroomProvenance: QuotaProvenance;
  headroomUpdatedAt: number | null;
  reservedTokens: number;
  inflight: number;
  concurrencyCap: number;
  rpmWindowStart: number | null;
  rpmRequests: number;
  rpmLimit: number | null;
  tpmTokens: number;
  tpmLimit: number | null;
  cooldownUntil: number | null;
  budgetResetAt: number | null;
  cooldownProvenance: QuotaProvenance;
}

export interface CandidateAssessment {
  accountId: string;
  modelsServed: boolean;
  status: AccountStatus;
  eligible: boolean;
  kind: "eligible" | "soft-block" | "hard-block";
  rejectionReason: string | null;
  headroomTokens: number | null;
  headroomProvenance: QuotaProvenance;
  inflight: number;
  concurrencyCap: number;
  weight: number;
}

export interface RankedCandidate {
  accountId: string;
  kind: "eligible" | "blocked";
  score: number;
  rank: number;
  rejectionReason: string | null;
}

export type FailoverAttemptOutcome =
  | "upstream_ok"
  | "no_capacity"
  | ErrorClass;

export interface FailoverAttempt {
  attempt: number;
  accountId: string;
  outcome: FailoverAttemptOutcome;
  detail: string;
}

export interface TraceOutcome {
  outcome: "succeeded" | "failed" | "client_aborted";
  upstreamAccountId: string | null;
  errorClass: ErrorClass | null;
  latencyMs: number | null;
  usage: Usage | null;
  usageProvenance: QuotaProvenance;
  costEstimate: number | null;
  streamed: boolean;
}

export interface DecisionTrace {
  traceId: string;
  requestId: string;
  tenantId: string;
  runId: string | null;
  createdAt: number;
  requestedPolicy: RoutingPolicyName;
  model: string;
  estimatedInputTokens: number;
  assessments: CandidateAssessment[];
  selectedAccountId: string | null;
  selectionReason: string | null;
  failovers: FailoverAttempt[];
  outcome: TraceOutcome | null;
}

export interface RoutedRequest {
  requestId: string;
  traceId: string;
  tenantId: string;
  runId: string | null;
  model: string;
  messages: ChatMessage[];
  stream: boolean;
  maxTokens: number | null;
  estimatedInputTokens: number;
  policy: RoutingPolicyName;
  deadlineAt: number | null;
}

export interface Reservation {
  id: string;
  accountId: string;
  requestId: string;
  runId: string | null;
  reservedTokens: number;
  inflightBefore: number;
  createdAt: number;
}

export type StreamProbe =
  | { ok: true; usage: Usage | null; terminated: boolean }
  | { ok: false; errorClass: ErrorClass; detail: string };

export type DispatchSuccess = {
  ok: true;
  response: Response;
  probe: Promise<StreamProbe>;
  retryAfterMs: number | null;
  resetAfterMs: number | null;
  remainingTokens: number | null;
  remainingTokensProvenance: QuotaProvenance;
};

export type DispatchFailure = {
  ok: false;
  errorClass: ErrorClass;
  detail: string;
  retryAfterMs: number | null;
  resetAfterMs: number | null;
  remainingTokens: number | null;
  remainingTokensProvenance: QuotaProvenance;
};

export type DispatchResult = DispatchSuccess | DispatchFailure;

export interface Dispatcher {
  dispatch(
    account: AccountRecord,
    req: RoutedRequest,
    body: Record<string, unknown>,
    signal: AbortSignal,
  ): Promise<DispatchResult>;
}

export interface AssessRequest {
  requestId: string;
  traceId: string;
  tenantId: string;
  runId: string | null;
  model: string;
  estimatedInputTokens: number;
  policy: RoutingPolicyName;
}

export interface AssessResult {
  assessments: CandidateAssessment[];
  ranked: RankedCandidate[];
  reservation: Reservation | null;
  selectionReason: string | null;
}

export type UpstreamQuotaEffect =
  | {
      kind: "exhausted";
      errorClass: "budget_exhausted";
      resetAfterMs: number | null;
      detail: string;
    }
  | {
      kind: "throttled";
      errorClass: "throttled";
      retryAfterMs: number | null;
      remainingTokens: number | null;
      remainingTokensProvenance: QuotaProvenance;
      detail: string;
    }
  | { kind: "auth"; errorClass: "auth_invalid"; detail: string }
  | { kind: "upstream"; errorClass: ErrorClass; detail: string }
  | {
      kind: "ok";
      usage: Usage | null;
      uncertainty: boolean;
      remainingTokens: number | null;
      remainingTokensProvenance: QuotaProvenance;
      detail: string;
    };

export interface Env {
  DB: D1Database;
  REPORTS: R2Bucket;
  [key: string]: unknown;
}

export interface AccountRepo {
  ensureSeed(): Promise<void>;
  listAccounts(runId: string | null): Promise<AccountRecord[]>;
  getAccount(accountId: string, runId: string | null): Promise<AccountRecord | null>;
  tryReserve(args: {
    account: AccountRecord;
    requestId: string;
    traceId: string;
    runId: string | null;
    estimatedTokens: number;
    now: number;
  }): Promise<Reservation | null>;
  commitReservation(args: {
    reservation: Reservation;
    usage: Usage | null;
    now: number;
  }): Promise<void>;
  releaseReservation(args: {
    reservation: Reservation;
    uncertainty: boolean;
    now: number;
  }): Promise<void>;
  applyUpstreamEffect(args: {
    account: AccountRecord;
    effect: UpstreamQuotaEffect;
    now: number;
  }): Promise<void>;
  injectHeadroom(args: {
    accountId: string;
    runId: string | null;
    tokens: number | null;
    provenance: QuotaProvenance;
    now: number;
  }): Promise<void>;
  setStatus(args: {
    accountId: string;
    runId: string | null;
    status: AccountStatus;
    reason: string | null;
    budgetResetAt?: number | null;
  }): Promise<void>;
  setMockScript(args: {
    accountId: string;
    runId: string | null;
    mock: MockScript | null;
  }): Promise<void>;
  createRunAccounts(args: {
    runId: string;
    accounts: AccountSpec[];
    now: number;
  }): Promise<void>;
  deleteRunAccounts(runId: string): Promise<void>;
}

export interface ApiKeyRepo {
  findByKey(key: string): Promise<GatewayKeySpec | null>;
}

export type GatewayKeySpec = {
  key: string;
  tenantId: string;
  scopes: GatewayKeyScope[];
};

export interface UsageEvent {
  id: string;
  runId: string | null;
  tenantId: string;
  accountId: string;
  traceId: string;
  inputTokens: number;
  outputTokens: number;
  costEstimate: number;
  createdAt: number;
}

export interface UsageRepo {
  record(event: UsageEvent): Promise<void>;
  summarize(args: { runId: string | null; tenantId: string | null }): Promise<{
    requests: number;
    inputTokens: number;
    outputTokens: number;
    costEstimate: number;
  }>;
}

export interface TraceRepo {
  save(trace: DecisionTrace): Promise<void>;
  get(traceId: string, runId: string | null): Promise<DecisionTrace | null>;
  list(args: {
    runId: string | null;
    tenantId: string | null;
    limit: number;
  }): Promise<DecisionTrace[]>;
}

export interface LabRunRecord {
  runId: string;
  scenario: string;
  policies: RoutingPolicyName[];
  requestCount: number;
  concurrency: number;
  seed: number;
  status: "queued" | "running" | "completed" | "failed";
  reportKey: string | null;
  result: LabRunResultPayload | null;
  errorDetail: string | null
  createdAt: number;
  finishedAt: number | null;
}

export type PolicyMetricSet = {
  policy: RoutingPolicyName;
  clientRequests: number;
  completed: number;
  clientFailures: number;
  clientAborted: number;
  upstreamAttempts: number;
  retryAmplification: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  costEstimate: number;
  costPerSuccessfulRequest: number;
  outputTokens: number;
};

export type ScenarioMetricSet = {
  scenario: string;
  seed: number;
  requestCount: number;
  concurrency: number;
  policyMetrics: PolicyMetricSet[];
  accountsAtEnd: QuotaSnapshot[];
};

export type LabRunResultPayload = {
  experiments: ScenarioMetricSet[];
  generatedAt: number;
};

export interface LabRunRepo {
  create(run: LabRunRecord): Promise<void>;
  update(run: LabRunRecord): Promise<void>;
  get(runId: string): Promise<LabRunRecord | null>;
  list(limit: number): Promise<LabRunRecord[]>;
}

export interface PoolCoordinator {
  assess(req: AssessRequest): Promise<AssessResult>;
}

export type RunScope = { runId: string };

export interface GatewayServices {
  accounts: AccountRepo;
  keys: ApiKeyRepo;
  usage: UsageRepo;
  traces: TraceRepo;
  runs: LabRunRepo;
  coordinator: PoolCoordinator;
  dispatcher: Dispatcher;
  runId: string | null;
}

export interface GatewayHandle {
  app: Hono<AppEnv>;
}
