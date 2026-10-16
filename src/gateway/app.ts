import { Hono } from "hono";
import type { AppEnv, Env, GatewayHandle } from "../types";

export function createGateway(env: Env): GatewayHandle {
  const app = new Hono<AppEnv>().basePath("/");
  app.get("/healthz", (c) =>
    c.json({ ok: true, service: "claude-gateway", stack: "workers-d1-r2" }),
  );
  return { app: app as Hono<AppEnv> };
}
