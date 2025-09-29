// import { defineNuxtPlugin, useRuntimeConfig } from "nuxt/app";
// import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// export default defineNuxtPlugin(() => {
//   const config = useRuntimeConfig();
//   const url = config.public.SUPABASE_URL as string | undefined;
//   const key = config.public.SUPABASE_KEY as string | undefined;

//   // If env vars aren’t set, keep null so the UI still mounts
//   const supabase: SupabaseClient | null =
//     url && key ? createClient(url, key) : null;

//   return {
//     provide: { supabase },
//   };
// });

// plugins/supabase.client.ts
import { defineNuxtPlugin, useRuntimeConfig } from "nuxt/app";
import { createClient } from "@supabase/supabase-js";

export default defineNuxtPlugin(() => {
  const {
    public: { SUPABASE_URL, SUPABASE_KEY },
  } = useRuntimeConfig() as any;

  // Keep null if not configured yet so UI still renders
  const supabase =
    SUPABASE_URL && SUPABASE_KEY
      ? createClient(SUPABASE_URL as string, SUPABASE_KEY as string)
      : null;

  return { provide: { supabase } };
});
