import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "./schema";
import { env } from "../lib/env";

const client = createClient({
  url: env.databaseUrl,
});

export const db = drizzle(client, { schema });
