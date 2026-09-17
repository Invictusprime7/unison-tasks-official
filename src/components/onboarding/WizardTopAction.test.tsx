import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { WizardTopAction } from "./WizardTopAction";

const callbacks = {
  onQuestionsNext: vi.fn(),
  onTemplatesNext: vi.fn(),
  onLaunch: vi.fn(),
};

describe("WizardTopAction generation runtime", () => {
  it("renders a horizontal process rail driven by launcher statuses", () => {
    const { rerender } = render(
      <WizardTopAction
        {...callbacks}
        step="aesthetic"
        isLaunching
        launchStatus="Preparing your site…"
        canContinueQuestions
        canGenerate
      />,
    );

    const processRail = screen.getByRole("list", { name: "Site generation progress" });
    expect(processRail).toHaveClass("flex");
    expect(within(processRail).getByText("Prepare").closest("li")).toHaveAttribute("aria-current", "step");

    rerender(
      <WizardTopAction
        {...callbacks}
        step="aesthetic"
        isLaunching
        launchStatus="Generating site… (1/3 page groups)"
        canContinueQuestions
        canGenerate
      />,
    );
    expect(within(processRail).getByText("Generate").closest("li")).toHaveAttribute("aria-current", "step");

    rerender(
      <WizardTopAction
        {...callbacks}
        step="aesthetic"
        isLaunching
        launchStatus="Authoring 2 missing module group(s)…"
        canContinueQuestions
        canGenerate
      />,
    );
    expect(within(processRail).getByText("Complete").closest("li")).toHaveAttribute("aria-current", "step");

    rerender(
      <WizardTopAction
        {...callbacks}
        step="aesthetic"
        isLaunching
        launchStatus="Finalizing preview…"
        canContinueQuestions
        canGenerate
      />,
    );
    expect(within(processRail).getByText("Validate").closest("li")).toHaveAttribute("aria-current", "step");

    rerender(
      <WizardTopAction
        {...callbacks}
        step="aesthetic"
        isLaunching
        launchStatus="Creating the site workspace and live data contracts…"
        canContinueQuestions
        canGenerate
      />,
    );
    expect(within(processRail).getByText("Commit").closest("li")).toHaveAttribute("aria-current", "step");
    expect(screen.getByRole("button", { name: /creating workspace/i })).toBeDisabled();
  });
});