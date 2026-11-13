import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateProjectInput, Project } from '@prompt-bridge/shared';
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
}
