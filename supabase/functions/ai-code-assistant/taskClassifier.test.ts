import { classifyTask } from "./taskClassifier.ts";

function assertEquals(actual: unknown, expected: unknown): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  }
}

Deno.test("keeps the legacy wizard-seed route isolated from research and memory", () => {
  const task = classifyTask({
    mode: "wizard-seed",
    editMode: false,
    navPageGen: false,
    surgicalEdit: false,
    behavioralEdit: false,
    debugMode: false,
  });

  assertEquals(task.type, "wizard_seed_generation");
  assertEquals(task.fastPath, true);
  assertEquals(task.shouldUseMemory, false);
  assertEquals(task.shouldUseCompactContext, true);
  assertEquals(task.skipResearch, true);
  assertEquals(task.skipThinking, true);
});

Deno.test("classifies Wizard content enrichment as compiler-owned JSON data", () => {
  const task = classifyTask({
    mode: "wizard-content",
    editMode: false,
    navPageGen: false,
    surgicalEdit: false,
    behavioralEdit: false,
    debugMode: false,
  });

  assertEquals(task.type, "wizard_content_enrichment");
  assertEquals(task.fastPath, true);
  assertEquals(task.prefersJsonOutput, true);
  assertEquals(task.skipResearch, true);
  assertEquals(task.skipThinking, true);
});

Deno.test("routes theme edits to isolated structured output", () => {
  const task = classifyTask({ mode: "theme-edit", editMode: true, navPageGen: false, surgicalEdit: false, behavioralEdit: false, debugMode: false });
  assertEquals(task.type, "theme_edit");
  assertEquals(task.prefersJsonOutput, true);
  assertEquals(task.shouldUseMemory, false);
  assertEquals(task.skipResearch, true);
  assertEquals(task.skipThinking, true);
});
