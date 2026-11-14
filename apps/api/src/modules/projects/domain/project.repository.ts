import type { CreateProjectInput, Project } from '@sitenura/shared';

/**
 * Port (hexagonal architecture): the application layer depends on this
 * abstraction, never on Prisma directly. Swap the adapter freely in tests.
 */
export abstract class ProjectRepository {
  abstract create(input: CreateProjectInput): Promise<Project>;
  abstract findById(id: string): Promise<Project | null>;
  abstract findAll(): Promise<Project[]>;
}
