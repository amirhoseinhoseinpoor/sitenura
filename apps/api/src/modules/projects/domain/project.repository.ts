import type { CreateProjectInput, DraftBrief, Project, WizardStepId } from '@sitenura/shared';

export interface SaveRequirementsCommand {
  requirements: DraftBrief;
  wizardStep: WizardStepId;
  /** Optional new display name (kept in sync with the brief's business name). */
  name?: string;
}

/**
 * Port (hexagonal architecture): the application layer depends on this
 * abstraction, never on Prisma directly. Swap the adapter freely in tests.
 */
export abstract class ProjectRepository {
  abstract create(input: CreateProjectInput): Promise<Project>;
  abstract findById(id: string): Promise<Project | null>;
  abstract findAll(): Promise<Project[]>;
  abstract saveRequirements(id: string, command: SaveRequirementsCommand): Promise<Project>;
}
