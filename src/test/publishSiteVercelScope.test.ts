// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../supabase/functions/_shared/auth.ts", () => ({
  verifyAuth: vi.fn(async () => ({ user: { id: "test-user" } })),
  authError: vi.fn(),
}));
vi.mock("../../supabase/functions/_shared/cors.ts", () => ({
  getCorsHeaders: () => ({}),
  handleCorsPreflightRequest: () => null,
}));
vi.mock("../../supabase/functions/_shared/publishAttestation.ts", () => ({
  verifyPublishAttestation: vi.fn(),
}));

describe("Vercel publisher credential scope", () => {
  let handler: (request: Request) => Promise<Response>;
  let env: Record<string, string>;
  const fetchMock = vi.fn();

  beforeEach(async () => {
    vi.resetModules();
    fetchMock.mockReset();
    env = { VERCEL_TOKEN: "test-deployment-token" };
    vi.stubGlobal("Deno", {
      env: { get: (name: string) => env[name] },
      serve: (callback: typeof handler) => { handler = callback; },
    });
    vi.stubGlobal("fetch", fetchMock);
    await import("../../supabase/functions/publish-site/index.ts");
  });

  afterEach(() => vi.unstubAllGlobals());

  function publish() {
    return handler(new Request("https://example.test/publish-site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: "vercel", siteName: "customer-site", files: { "index.html": "<html><body>Hello</body></html>" } }),
    }));
  }

  it.each([undefined, "team_example"])("uses the same scope for preflight and deployment: %s", async (teamId) => {
    if (teamId) env.VERCEL_TEAM_ID = teamId;
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 200 }));
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ url: "customer-site.vercel.app" }), { status: 200 }));
    const response = await publish();
    expect(response.status).toBe(200);
    const preflightUrl = new URL(fetchMock.mock.calls[0][0]);
    const deploymentUrl = new URL(fetchMock.mock.calls[1][0]);
    expect(preflightUrl.pathname).toBe("/v6/deployments");
    expect(preflightUrl.searchParams.get("limit")).toBe("1");
    expect(deploymentUrl.pathname).toBe("/v13/deployments");
    expect(preflightUrl.searchParams.get("teamId")).toBe(teamId ?? null);
    expect(deploymentUrl.searchParams.get("teamId")).toBe(teamId ?? null);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).name).toBe("customer-site");
  });

  it("refuses deployment when the scoped credential check fails", async () => {
    env.VERCEL_TEAM_ID = "team_example";
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 403 }));
    expect((await publish()).status).toBe(502);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
