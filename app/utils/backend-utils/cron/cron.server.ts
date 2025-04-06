import { refreshExpiringFiles } from "~/services/maintenance.server";

export async function runScheduledJobs() {
  // Run daily at 3AM
  if (new Date().getHours() === 3) {
    await refreshExpiringFiles();
  }
}

// Call this from your entry.server.ts or a dedicated worker
