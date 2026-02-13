/**
 * Workflow Trigger Utilities
 * 
 * Helper functions to trigger workflows from your application code.
 * Use Inngest for CRM automations, Trigger.dev for heavy compute tasks.
 */

import { inngest } from "./inngest";
import type { InngestEvents } from "./inngest";

// ============================================
// INNGEST: CRM Event Triggers
// ============================================

/**
 * Trigger a deal stage change workflow
 */
export async function triggerDealStageChange(params: {
  dealId: string;
  businessId: string;
  previousStage: string;
  newStage: string;
  contactId?: string;
  contactEmail?: string;
}) {
  return inngest.send({
    name: "crm/deal.stage.changed",
    data: params,
  });
}

/**
 * Trigger a new lead workflow
 */
export async function triggerLeadCreated(params: {
  leadId: string;
  businessId: string;
  email?: string;
  phone?: string;
  source?: string;
}) {
  return inngest.send({
    name: "crm/lead.created",
    data: params,
  });
}

/**
 * Trigger a booking confirmation workflow
 */
export async function triggerBookingCreated(params: {
  bookingId: string;
  businessId: string;
  contactId?: string;
  contactEmail?: string;
  contactPhone?: string;
  service: string;
  scheduledAt: string;
}) {
  return inngest.send({
    name: "booking/created",
    data: params,
  });
}

/**
 * Trigger a booking completion workflow (for review requests)
 */
export async function triggerBookingCompleted(params: {
  bookingId: string;
  businessId: string;
  contactId?: string;
  contactEmail?: string;
}) {
  return inngest.send({
    name: "booking/completed",
    data: params,
  });
}

/**
 * Trigger a form submission workflow
 */
export async function triggerFormSubmitted(params: {
  formId: string;
  businessId: string;
  submissionId: string;
  email?: string;
  phone?: string;
  data: Record<string, unknown>;
}) {
  return inngest.send({
    name: "form/submitted",
    data: params,
  });
}

// ============================================
// TRIGGER.DEV: Heavy Job Triggers
// ============================================

// Import tasks from trigger folder for type-safe triggering
// In production, use:
// import { generateReportTask, batchImportTask } from "@/trigger/jobs";

/**
 * Trigger a CRM report generation (heavy task)
 * 
 * Returns immediately - report generates in background.
 */
export async function triggerReportGeneration(params: {
  businessId: string;
  reportType: "daily" | "weekly" | "monthly";
  startDate: string;
  endDate: string;
}) {
  // In production:
  // const handle = await generateReportTask.trigger(params);
  // return handle;
  
  console.log("Report generation triggered:", params);
  return { id: `run_${Date.now()}`, params };
}

/**
 * Trigger a batch contact import (heavy task)
 */
export async function triggerBatchImport(params: {
  businessId: string;
  fileUrl: string;
  importType: "contacts" | "leads" | "deals";
  options?: {
    skipDuplicates?: boolean;
    updateExisting?: boolean;
  };
}) {
  // In production:
  // const handle = await batchImportTask.trigger(params);
  // return handle;
  
  console.log("Batch import triggered:", params);
  return { id: `run_${Date.now()}`, params };
}

/**
 * Trigger AI content generation (heavy task)
 */
export async function triggerAIContentGeneration(params: {
  businessId: string;
  contentType: "email" | "sms" | "social" | "blog";
  context: {
    industry?: string;
    tone?: string;
    goal?: string;
    keywords?: string[];
    targetAudience?: string;
  };
  count?: number;
}) {
  // In production:
  // const handle = await aiContentGenerationTask.trigger(params);
  // return handle;
  
  console.log("AI content generation triggered:", params);
  return { id: `run_${Date.now()}`, params };
}

/**
 * Trigger a data export (heavy task)
 */
export async function triggerDataExport(params: {
  businessId: string;
  exportType: "contacts" | "leads" | "deals" | "automations" | "all";
  format: "csv" | "xlsx" | "json";
  filters?: Record<string, unknown>;
}) {
  // In production:
  // const handle = await dataExportTask.trigger(params);
  // return handle;
  
  console.log("Data export triggered:", params);
  return { id: `run_${Date.now()}`, params };
}

// ============================================
// Combined Utilities
// ============================================

/**
 * Get the status of a Trigger.dev job
 */
export async function getJobStatus(runId: string) {
  // In production:
  // return await runs.retrieve(runId);
  
  return {
    id: runId,
    status: "pending" as const,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Cancel a running Trigger.dev job
 */
export async function cancelJob(runId: string) {
  // In production:
  // return await runs.cancel(runId);
  
  return {
    id: runId,
    status: "cancelled" as const,
  };
}
