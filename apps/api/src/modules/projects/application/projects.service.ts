import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import {
  InteractionMode,
  draftBriefSchema,
  type CreateProjectInput,
  type Project,
  type UpdateRequirementsInput,
} from '@sitenura/shared';
import { ProjectRepository } from '../domain/project.repository.js';

/** Application layer: orchestrates use cases, knows nothing about HTTP or Prisma. */
@Injectable()
export class ProjectsService {
  constructor(private readonly projects: ProjectRepository) {}

  create(input: CreateProjectInput): Promise<Project> {
    return this.projects.create(input);
  }

  list(): Promise<Project[]> {
    return this.projects.findAll();
  }

  async getById(id: string): Promise<Project> {
    const project = await this.projects.findById(id);
    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }
    return project;
  }

  /**
   * Saves one wizard step. Answers are merged into the existing draft so each
   * step only sends what it changed, and the project name follows the brief.
   */
  async saveRequirements(id: string, input: UpdateRequirementsInput): Promise<Project> {
    const project = await this.getById(id);
    if (project.mode !== InteractionMode.BASIC) {
      throw new ConflictException('Only BASIC projects use the guided wizard');
    }

    const requirements = draftBriefSchema.parse({ ...project.requirements, ...input.requirements });

    return this.projects.saveRequirements(id, {
      requirements,
      wizardStep: input.wizardStep,
      name: input.requirements.businessName,
    });
  }
}
