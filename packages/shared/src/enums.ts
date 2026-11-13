/**
 * How the user interacts with PromptBridge.
 * - BASIC: guided, step-by-step wizard for non-technical users.
 * - ADVANCED: free-form prompt for people who know what they want.
 */
export const InteractionMode = {
  BASIC: 'BASIC',
  ADVANCED: 'ADVANCED',
} as const;
export type InteractionMode = (typeof InteractionMode)[keyof typeof InteractionMode];

/** LLMs that can act as the "planner" (prompt engineer) before Claude executes. */
export const PlannerProvider = {
  OPENAI: 'OPENAI',
  GEMINI: 'GEMINI',
  ANTHROPIC: 'ANTHROPIC',
} as const;
export type PlannerProvider = (typeof PlannerProvider)[keyof typeof PlannerProvider];

/** Lifecycle of a project as it moves through the pipeline. */
export const ProjectStatus = {
  DRAFT: 'DRAFT',
  PLANNING: 'PLANNING',
  EXECUTING: 'EXECUTING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;
export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];
