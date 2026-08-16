import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

// This client is server-side only. The service role key must never be exposed to the frontend.
export const supabase =
  env.supabaseUrl && env.supabaseServiceRoleKey
    ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey)
    : null;
