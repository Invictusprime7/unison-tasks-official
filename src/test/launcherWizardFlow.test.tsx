import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LauncherWizard } from "@/components/onboarding/wizard/LauncherWizard";
import { runLaunchPipeline } from "@/services/launch/launchOrchestrator";

vi.mock("@/services/launch/launchOrchestrator", () => ({ runLaunchPipeline: vi.fn() }));
vi.mock("@/contexts/useLaunchHooks", () => ({ useLaunch: () => ({ setLaunch: vi.fn() }) }));
vi.mock("@/components/onboarding/ImportProjectZipButton", () => ({ ImportProjectZipButton: () => null }));
vi.mock("@/components/onboarding/ImportUnisonSiteZipButton", () => ({ ImportUnisonSiteZipButton: () => null }));
vi.mock("@/components/onboarding/TemplateLivePreview", () => ({ TemplateLivePreview: () => null }));
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
