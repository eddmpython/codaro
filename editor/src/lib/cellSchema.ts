export const blockTypes = ["code", "markdown", "automation"] as const;

export const cellRoles = [
  "title",
  "explanation",
  "learning",
  "snippet",
  "exercise",
  "check",
  "visual",
  "automation",
  "skill",
] as const;

export const executionKinds = [
  "python",
  "browser",
  "os",
  "mouse",
  "image",
  "task",
  "skill",
] as const;

export const cellDisplayKinds = [
  "title",
  "hero",
  "prose",
  "callout",
  "code",
  "cardGrid",
  "comparison",
  "table",
  "media",
  "resource",
  "practice",
  "quiz",
  "centerText",
] as const;
