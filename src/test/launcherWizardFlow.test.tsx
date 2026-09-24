import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LauncherWizard } from "@/components/onboarding/wizard/LauncherWizard";
import { runLaunchPipeline } from "@/services/launch/launchOrchestrator";

vi.mock("@/services/launch/launchOrchestrator", () => ({ runLaunchPipeline: vi.fn() }));
vi.mock("@/contexts/useLaunchHooks", () => ({ useLaunch: () => ({ setLaunch: vi.fn() }) }));
vi.mock("@/components/onboarding/ImportProjectZipButton", () => ({ ImportProjectZipButton: () => null }));
vi.mock("@/components/onboarding/ImportUnisonSiteZipButton", () => ({ ImportUnisonSiteZipButton: () => null }));
vi.mock("@/components/onboarding/TemplateLivePreview", () => ({ TemplateLivePreview: () => null }));
vi.mock("@/components/VFSPreview", () => ({ VFSPreview: ({ onReady, files }: { onReady: () => void; files: Record<string,string> }) => <button onClick={onReady}>Preview loaded {files['/src/App.tsx']}</button> }));
vi.mock("@/components/onboarding/StyleTokenCard", () => ({ StyleTokenCard: () => null }));
vi.mock("@/components/onboarding/wizard/DesignContractInspector", () => ({ DesignContractInspector: () => null }));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("Launcher Wizard guided flow", () => {
  it("keeps the opening screen focused and routes a prompt through review before launch", () => {
    render(<MemoryRouter><LauncherWizard open onOpenChange={vi.fn()} /></MemoryRouter>);
    expect(screen.getByRole("button", { name: "Shape my idea" })).toBeDisabled();
    expect(screen.getByText("Or explore by industry").closest("details")).not.toHaveAttribute("open");
    expect(screen.queryByText("Design details")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Describe your website"), { target: { value: "Luxury salon with online booking and lookbook gallery" } });
    fireEvent.click(screen.getByRole("button", { name: "Shape my idea" }));
    expect(screen.getByRole("heading", { name: "What should the site do for you?" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.queryByRole("heading", { name: "Choose a starting layout" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Name it and choose a style" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Generate site" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Business name"), { target: { value: "Studio Glow" } });
    expect(screen.getByRole("button", { name: "Generate site" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByLabelText("Business name")).toHaveValue("Studio Glow");
    expect(runLaunchPipeline).not.toHaveBeenCalled();
  }, 20000);
});

it('requires preview readiness and discards the first candidate when regenerating', async () => {
 const accepted: number[] = [];
 vi.mocked(runLaunchPipeline).mockImplementation(async (_input, callbacks) => {
  const take = vi.mocked(runLaunchPipeline).mock.calls.length;
  const accept = await callbacks!.onReview!({ files: { '/src/App.tsx': String(take) }, entryPoint: '/src/App.tsx' });
  if (accept) accepted.push(take);
  const error = new Error('discarded'); error.name = 'LaunchReviewCancelled'; throw error;
 });
 render(<MemoryRouter><LauncherWizard open onOpenChange={vi.fn()} /></MemoryRouter>);
 fireEvent.change(screen.getByLabelText('Describe your website'), {target:{value:'Luxury salon with online booking'}});
 fireEvent.click(screen.getByRole('button',{name:'Shape my idea'}));
 fireEvent.click(screen.getByRole('button',{name:'Continue'}));
 fireEvent.change(screen.getByLabelText('Business name'),{target:{value:'Glow'}});
 fireEvent.click(screen.getByRole('button',{name:'Generate site'}));
 await screen.findByRole('heading',{name:'Preview your site'});
 expect(screen.getByRole('button',{name:'Launch this site'})).toBeDisabled();
 expect(accepted).toEqual([]);
 fireEvent.click(screen.getByRole('button',{name:'Preview loaded 1'}));
 expect(screen.getByRole('button',{name:'Launch this site'})).toBeEnabled();
 fireEvent.click(screen.getByRole('button',{name:'Regenerate'}));
 await screen.findByRole('button',{name:'Preview loaded 2'});
 expect(runLaunchPipeline).toHaveBeenCalledTimes(2);
 expect(vi.mocked(runLaunchPipeline).mock.calls[1][0].regenerationNonce).toBeTruthy();
 expect(screen.getByRole('button',{name:'Launch this site'})).toBeDisabled();
 fireEvent.click(screen.getByRole('button',{name:'Preview loaded 2'}));
 fireEvent.click(screen.getByRole('button',{name:'Launch this site'}));
 await waitFor(()=>expect(accepted).toEqual([2]));
},20000);
