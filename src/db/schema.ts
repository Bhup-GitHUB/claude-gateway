import {
  index,
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import type {
  AccountStatus,
  GatewayKeyScope,
  LabRunResultPayload,
  MockScript,
  QuotaProvenance,
  RoutingPolicyName,
  TraceOutcome,
  CandidateAssessment,
  FailoverAttempt,
} from "../types";
;

export const tenants = sqliteTable("tenants", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const apiKeys = sqliteTable("api_keys", {
  key: text("key").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id),
  scopes: text("scopes", { mode: "json" })
    .$type<GatewayKeyScope[]>()
    .notNull(),
  createdAt: integer("created_at").notNull(),
});

export const accounts = sqliteTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    runId: text("run_id"),
    provider: text("provider").notNull(),
    endpoint: text("endpoint"),
    credentialEnv: text("credential_env"),
    models: text("models", { mode: "json" }).$type<string[]>().notNull(),
    weight: integer("weight").notNull(),
    concurrencyCap: integer("concurrency_cap").notNull(),
    status: text("status").$type<AccountStatus>().notNull(),
    statusReason: text("status_reason"),
    headroomTokens: integer("headroom_tokens"),
    headroomProvenance: text("headroom_provenance")
      .$type<QuotaProvenance>()
      .notNull(),
    headroomUpdatedAt: integer("headroom_updated_at"),
    reservedTokens: integer("reserved_tokens").notNull().default(0),
    inflight: integer("inflight").notNull().default(0),
    rpmWindowStart: integer("rpm_window_start"),
    rpmRequests: integer("rpm_requests").notNull().default(0),
    tpmTokens: integer("tpm_tokens").notNull().default(0),
    rpmLimit: integer("rpm_limit"),
    tpmLimit: integer("tpm_limit"),
    cooldownUntil: integer("cooldown_until"),
    cooldownProvenance: text("cooldown_provenance")
      .$type<QuotaProvenance>()
      .notNull()
      .default("estimated"),
    budgetResetAt: integer("budget_reset_at"),
    mock: text("mock", { mode: "json" }).$type<MockScript | null>(),
    credentialHint: text("credential_hint"),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [index("accounts_run_idx").on(t.runId)],
);

export const decisionTraces = sqliteTable(
  "decision_traces",
  {
    traceId: text("trace_id").primaryKey(),
    requestId: text("request_id").notNull(),
    runId: text("run_id"),
    tenantId: text("tenant_id").notNull(),
    createdAt: integer("created_at").notNull(),
    model: text("model").notNull(),
    requestedPolicy: text("requested_policy")
      .$type<RoutingPolicyName>()
      .notNull(),
    estimatedInputTokens: integer("estimated_input_tokens").notNull(),
    assessments: text("assessments", { mode: "json" })
      .$type<CandidateAssessment[]>()
      .notNull(),
    rankedSpark: text("ranked_spark", { mode: "json" })
      .$type<{ accountId: string; score: number }[]>()
      .notNull(),
    selectedAccountId: text("selected_account_id"),
    selectionReason: text("selection_reason"),
    failovers: text("failovers", { mode: "json" })
      .$type<FailoverAttempt[]>()
      .notNull(),
    outcome: text("outcome", { mode: "json" }).$type<TraceOutcome | null>(),
  },
  (t) => [
    index("traces_run_created_idx").on(t.runId, t.createdAt),
    index("traces_tenant_idx").on(t.tenantId, t.createdAt),
  ],
);

export const usageEvents = sqliteTable(
  "usage_events",
  {
    id: text("id").primaryKey(),
    runId: text("run_id"),
    tenantId: text("tenant_id").notNull(),
    accountId: text("account_id").notNull(),
    traceId: text("trace_id").notNull(),
    inputTokens: integer("input_tokens").notNull(),
    outputTokens: integer("output_tokens").notNull(),
    costEstimate: real("cost_estimate").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [index("usage_run_idx").on(t.runId), index("usage_tenant_idx").on(t.tenantId)],
);

export const labRuns = sqliteTable("lab_runs", {
  runId: text("run_id").primaryKey(),
  scenario: text("scenario").notNull(),
  policies: text("policies", { mode: "json" })
    .$type<RoutingPolicyName[]>()
    .notNull(),
  requestCount: integer("request_count").notNull(),
  concurrency: integer("concurrency").notNull(),
  seed: integer("seed").notNull(),
  status: text("status").notNull(),
  reportKey: text("report_key"),
  result: text("result", { mode: "json" }).$type<LabRunResultPayload | null>(),
  errorDetail: text("error_detail"),
  createdAt: integer("created_at").notNull(),
  finishedAt: integer("finished_at"),
});
