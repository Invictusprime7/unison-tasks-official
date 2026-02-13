import type { TriggerConfig } from "@trigger.dev/sdk/v3";

export const config: TriggerConfig = {
  project: "unison-tasks",
  projectRef: "proj_aaksoijlysnjimgbcexh",
  
  // Retry configuration
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      factor: 2,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 30000,
    },
  },
  
  // Dependencies to include in the build
  additionalPackages: [
    // Add packages you need in your tasks
    // "@supabase/supabase-js",
  ],
  
  // Folders to include in the build
  additionalFiles: [
    // "./src/lib/**/*",
  ],
};
