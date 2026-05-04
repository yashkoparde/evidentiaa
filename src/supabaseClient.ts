import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

export const getSupabase = () => {
  if (supabaseClient) return supabaseClient;

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim().replace(/\/$/, "") || "";
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || "";

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    const error = new Error(
      "Supabase configuration missing."
    );
    (error as any).isConfigError = true;
    throw error;
  }

  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabaseClient;
};

export const hasSupabaseConfig = () => {
  try {
    const url = (import.meta.env.VITE_SUPABASE_URL || "").trim();
    const key = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();
    return !!url && !!key;
  } catch {
    return false;
  }
};

// For backward compatibility with existing imports, we keep the export
// but we will need to update the services to use the getter or handle null.
// However, the cleanest way is to update the services.
export const supabase = (function() {
  try {
    return getSupabase();
  } catch (e) {
    // Return a proxy that only throws when calling functions or accessing major services
    // to prevent early crashes during React introspection/DevTools access
    console.warn("Supabase initialization deferred until configuration is provided.");
    return new Proxy({} as SupabaseClient, {
      get(target, prop) {
        if (prop === 'auth' || prop === 'from' || prop === 'storage' || prop === 'functions' || prop === 'rpc') {
          return new Proxy(() => {}, {
            get() { throw e; },
            apply() { throw e; }
          });
        }
        return undefined;
      }
    });
  }
})();
