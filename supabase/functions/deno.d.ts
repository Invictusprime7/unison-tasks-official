// Type definitions for Deno Edge Functions runtime
// This file suppresses TypeScript errors in VS Code for Deno-specific code
// Note: Deno namespace is already available globally in Deno runtime

declare module "https://deno.land/std@*/http/server.ts" {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

declare module "https://esm.sh/@supabase/supabase-js@*" {
  export function createClient(
    supabaseUrl: string,
    supabaseKey: string,
    options?: any
  ): any;
}
