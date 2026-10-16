# claude-gateway

A quota-aware LLM gateway with a built-in routing evaluation lab. Routes requests across a pool of upstream accounts, explains every decision, and measures which routing policy survives realistic failure conditions best.

## Why

Key-rotation gateways are a solved problem — they react *after* a request fails. This gateway is different in two ways:

1. **Schedules ahead of failure.** A request is routed using remaining allowance, estimated request size, current concurrency, and cooldown state. Every decision records a reason: `selected B — headroom 8k ≥ est 8k, load 0/4`. The dashboard answers "why was this account selected?", not just green dots.

2. **Proves the routing works.** A built-in lab runs the same seeded workload against multiple policies (fill-first, quota-aware) with injected failures — exhausted budget, throttled account, dead mid-stream. The output is a comparison report: client-visible failures, p95 latency, retry amplification, completion rate. Simulated results are labeled and kept separate from measurements against real providers.

## Failure taxonomy

Why an account became unavailable determines the gateway's behavior. Sharing an HTTP status does not mean sharing handling rules:

| Condition | Gateway behavior |
|---|---|
| Temporary throttling (429, resets) | Respect scope/reset info, fail over to an independently eligible account |
| Exhausted credits/budget | Mark route unavailable until condition changes; no repeated retries |
| Invalid credentials/permissions | Disable credential, surface an admin error — never treated as throttling |
| Failure after output reached client | Surface the failure; never silently splice in a new generation |

Streaming retries are bounded at the operation level — no per-layer independent retries.

## Design decisions

- **Atomic reservation.** Eligibility check and capacity claim happen in one coordinated step under a lock. A conservative allowance is reserved before dispatch, then reconciled after. Failed requests that may have consumed usage preserve that uncertainty.
- **Account failover ≠ model fallback.** Failover is between accounts serving the same model. Cross-model fallback is opt-in, capability-checked, and recorded — future work.
- **Gateway keys ≠ provider secrets.** Clients hold scoped gateway keys. Upstream credentials stay server-side, redacted from logs.
- **Honest quota data.** Every quota number is labeled provider-reported / locally-estimated / unknown, with a timestamp. Unknown capacity → conservative concurrency limits, not invented percentages.
- **Decision traces are first-class.** Each request emits a trace (candidates considered, scores, rejection reasons, final selection) attached to the calling tenant's gateway key.

## Scope (v1)

In: one protocol (`POST /v1/chat/completions`, `GET /v1/models`), small account pool, fill-first + quota-aware policies, cooldowns, bounded failover, streaming + cancellation, mock upstreams, one failure scenario, policy comparison report, per-request decision traces.

Out (explicitly): cross-model routing / eval-aware routing, billing/metering system, additional API protocols, subscription-login adapters, tenant multi-tenancy at scale.

The eval lab ships before the real-provider integration.

## Stack

- **Hono on Cloudflare Workers** — routing, streaming SSE, one runtime for gateway + mocks.
- **Durable Objects** (SQLite-backed) — one DO per upstream account holds quota state, atomic reservation via mutex, reconciliation; one DO as the pool coordinator / policy engine.
- **TypeScript**, **Bun** for local tooling, **wrangler** for deploy.
- **Mock upstreams** as in-Worker functions or service bindings — zero external infra for the lab.

Paid Workers plan ($5/mo) required: Durable Objects, 30s CPU, 1000 subrequests. Streaming is wall-clock unlimited; cancellation propagates via `AbortSignal`.

## Layout

```
src/
  gateway/        # /v1/chat/completions, auth, trace emission
  routing/        # eligibility, reservation, policies, cooldowns
  pool/           # Durable Object: account state + coordinator
  mocks/          # scripted upstream accounts (throttle/exhaust/slow/dead)
  lab/            # scenario runner, seeded workloads, report generation
```

## Deployment

1. `bun install`
2. Set upstream secrets: `bunx wrangler secret put UPSTREAM_<NAME>_KEY`
3. `bunx wrangler dev` — local, DO simulator included
4. `bunx wrangler deploy`

## Status

Scaffold stage. Sequence: passthrough with traces → pool state + failover → second policy + report → real provider → cross-model routing (may never).
