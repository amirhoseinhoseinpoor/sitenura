import { z } from 'zod';
import { InteractionMode, PlannerProvider, ProjectStatus } from '../enums.js';

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
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type Project = z.infer<typeof projectSchema>;
