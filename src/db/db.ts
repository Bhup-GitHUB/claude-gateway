import { drizzle } from "drizzle-orm/d1";
import type { Env } from "../types";
import * as schema from "./schema";

export type Db = ReturnType<typeof drizzle<typeof schema>>;

export function createDb(env: Env): Db {
  return drizzle(env.DB, { schema });
}

export { schema };
