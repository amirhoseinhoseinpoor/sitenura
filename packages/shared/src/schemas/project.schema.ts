import { z } from 'zod';
import { InteractionMode, PlannerProvider, ProjectStatus } from '../enums.js';
import { draftBriefSchema } from '../wizard/brief.schema.js';
import { wizardStepIdSchema } from '../wizard/steps.js';

export const createProjectSchema = z.object({
  name: z.string().trim().min(2).max(120),
  mode: z.enum([InteractionMode.BASIC, InteractionMode.ADVANCED]),
  plannerProvider: z
    .enum([PlannerProvider.OPENAI, PlannerProvider.GEMINI, PlannerProvider.ANTHROPIC])
    .default(PlannerProvider.OPENAI),
});
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const projectSchema = createProjectSchema.extend({
  id: z.uuid(),
  status: z.enum([
    ProjectStatus.DRAFT,
    ProjectStatus.PLANNING,
    ProjectStatus.EXECUTING,
    ProjectStatus.COMPLETED,
    ProjectStatus.FAILED,
  ]),
  /** Wizard answers collected so far. */
  requirements: draftBriefSchema,
  /** Step the user should resume on, or null if the wizard was never opened. */
  wizardStep: wizardStepIdSchema.nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type Project = z.infer<typeof projectSchema>;

/** Saves one wizard step: the answers are merged into the existing draft. */
export const updateRequirementsSchema = z.object({
  requirements: draftBriefSchema,
  wizardStep: wizardStepIdSchema,
});
export type UpdateRequirementsInput = z.infer<typeof updateRequirementsSchema>;
