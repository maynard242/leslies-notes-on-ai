import { describe, expect, it } from "vitest";
import { parsePublishArgs, validatePaths } from "../scripts/publish-workflow.mjs";

describe("Hermes-facing publish workflow", () => {
  it("keeps review commands side-effect free at the argument boundary", () => {
    expect(parsePublishArgs(["preflight"])).toEqual({ action: "preflight" });
    expect(parsePublishArgs(["review"])).toEqual({ action: "review" });
    expect(() => parsePublishArgs(["review", "--confirm-push"])).toThrow("accepts no additional arguments");
  });

  it("requires an explicit confirmation, message, and scoped paths before committing", () => {
    expect(() => parsePublishArgs(["commit", "--message", "docs: update", "--", "README.md"])).toThrow("--confirm-commit");
    expect(() => parsePublishArgs(["commit", "--confirm-commit", "--message", "docs: update"])).toThrow("exact paths");
    expect(parsePublishArgs(["commit", "--confirm-commit", "--message", "docs: update", "--", "README.md", "docs/NOTE_TEMPLATE.md"])).toEqual({
      action: "commit",
      message: "docs: update",
      paths: ["README.md", "docs/NOTE_TEMPLATE.md"],
    });
  });

  it("rejects unsafe path scopes and requires a distinct push confirmation", () => {
    expect(() => validatePaths(["."])).toThrow("Unsafe or non-specific path");
    expect(() => validatePaths(["../outside"])).toThrow("Unsafe or non-specific path");
    expect(() => parsePublishArgs(["push"])).toThrow("--confirm-push");
    expect(() => parsePublishArgs(["push", "--confirm-push", "--force"])).toThrow("accepts only");
    expect(parsePublishArgs(["push", "--confirm-push"])).toEqual({ action: "push" });
  });
});
