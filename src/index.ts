import { createGateway } from "./gateway/app";
import type { Env } from "./types";

export default {
  async fetch(
    request: Request,
    env: Env,
    _ctx: ExecutionContext,
  ): Promise<Response> {
    const { app } = createGateway(env);
    return app.fetch(request, env);
  },
};
