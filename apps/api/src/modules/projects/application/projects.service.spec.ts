import { NotFoundException } from '@nestjs/common';
import type { CreateProjectInput, Project } from '@prompt-bridge/shared';
import { ProjectRepository } from '../domain/project.repository.js';
import { ProjectsService } from './projects.service.js';

class InMemoryProjectRepository extends ProjectRepository {
  private readonly items = new Map<string, Project>();

  async create(input: CreateProjectInput): Promise<Project> {
    const now = new Date().toISOString();
    const project: Project = {
      ...input,
      id: crypto.randomUUID(),
      status: 'DRAFT',
      createdAt: now,
      updatedAt: now,
    };
    this.items.set(project.id, project);
    return project;
  }

  async findById(id: string): Promise<Project | null> {
    return this.items.get(id) ?? null;
  }

  async findAll(): Promise<Project[]> {
    return [...this.items.values()];
  }
}

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(() => {
    service = new ProjectsService(new InMemoryProjectRepository());
  });

  it('creates a project in DRAFT status', async () => {
    const project = await service.create({
      name: 'My shop',
      mode: 'BASIC',
      plannerProvider: 'OPENAI',
    });

    expect(project.status).toBe('DRAFT');
    await expect(service.getById(project.id)).resolves.toEqual(project);
  });

  it('throws NotFound for unknown ids', async () => {
    await expect(service.getById(crypto.randomUUID())).rejects.toBeInstanceOf(NotFoundException);
  });
});
