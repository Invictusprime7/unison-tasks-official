import type { AIMessage } from "./AIAssistantCore";

export const SITE_CONFIRMATION_MARKER = "<UNISON_SITE_CONFIRMATION>";

export function isSiteConfirmation(value: string): boolean {
  const normalized = value.trim().toLowerCase().replace(/[.!?]+$/, "").replace(/\s+/g, " ");
  return /^(?:yes(?:,? please)?|yep|yeah|correct|confirmed|confirm|looks good|that(?:'s| is) right|go ahead|let's do it|sure|absolutely|proceed)$/.test(normalized);
}

export function stripSiteConfirmationMarker(value: string): string {
  return value.replace(SITE_CONFIRMATION_MARKER, "").trim();
}

export function buildConfirmedSiteBrief(messages: AIMessage[]): string {
  const lastAssistantMessage = [...messages]
    .reverse()
    .find((message) => message.role === "assistant");
  const summary = lastAssistantMessage
    ? stripSiteConfirmationMarker(lastAssistantMessage.content)
    : "";
  const userRequests = messages
    .filter((message) => message.role === "user")
    .map((message) => message.content.trim())
    .filter((content) => Boolean(content) && !isSiteConfirmation(content));

  return [
    summary && `Confirmed site direction:\n${summary}`,
    userRequests.length > 0 && `Conversation details:\n${userRequests.join("\n")}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function hasSiteConfirmationRequest(message: AIMessage | undefined): boolean {
  return message?.role === "assistant"
    && message.content.includes(SITE_CONFIRMATION_MARKER);
}

export function describeAssistantFailure(error: unknown): string {
  const status = (error as { context?: { status?: number } } | null)?.context?.status;
  const message = error instanceof Error ? error.message : "";
  if (status === 401 || /session expired|sign in again|invalid or expired token/i.test(message)) {
    return "Your session expired. Please sign in again.";
  }
  return message && message.length <= 160 ? message : "Failed to get AI response";
}

// A backend that predates the isolated discovery lane ignores the mode and
// answers with builder-lane output, which must not be shown as chat.
export function isSiteDiscoveryResponse(data: unknown): boolean {
  return (data as { mode?: unknown } | null)?.mode === "site-discovery";
}
