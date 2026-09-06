export type PublishCommand =
  | { action: "preflight" | "review" | "push" }
  | { action: "commit"; message: string; paths: string[] };

export const PUBLISH_USAGE: string;
export function validatePaths(paths: string[]): string[];
export function parsePublishArgs(args: string[]): PublishCommand;
export function main(args: string[]): void;
