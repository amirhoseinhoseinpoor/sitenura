import { ConflictException, NotFoundException } from '@nestjs/common';
import type { CreateProjectInput, Project } from '@sitenura/shared';
import { ProjectRepository, type SaveRequirementsCommand } from '../domain/project.repository.js';
import { ProjectsService } from './projects.service.js';

class InMemoryProjectRepository extends ProjectRepository {
  private readonly items = new Map<string, Project>();

  async create(input: CreateProjectInput): Promise<Project> {
    const now = new Date().toISOString();
    const project: Project = {
      ...input,
      id: crypto.randomUUID(),
      status: 'DRAFT',
      requirements: {},
      wizardStep: null,
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

  async saveRequirements(id: string, command: SaveRequirementsCommand): Promise<Project> {
    const current = this.items.get(id);
    if (!current) throw new Error(`Project ${id} missing`);
    const updated: Project = {
      ...current,
      requirements: command.requirements,
      wizardStep: command.wizardStep,
      name: command.name ?? current.name,
    };
    this.items.set(id, updated);
    return updated;
  }
}

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(() => {
    service = new ProjectsService(new InMemoryProjectRepository());
  });

  const createBasic = () =>
    service.create({ name: 'Untitled website', mode: 'BASIC', plannerProvider: 'OPENAI' });

  it('creates a project in DRAFT status with an empty brief', async () => {
    const project = await createBasic();

    expect(project.status).toBe('DRAFT');
    expect(project.requirements).toEqual({});
    await expect(service.getById(project.id)).resolves.toEqual(project);
  });

  it('throws NotFound for unknown ids', async () => {
    await expect(service.getById(crypto.randomUUID())).rejects.toBeInstanceOf(NotFoundException);
  });

  describe('saveRequirements', () => {
    it('merges answers step by step and tracks the resume step', async () => {
      const project = await createBasic();

      await service.saveRequirements(project.id, {
        requirements: { businessName: 'Blue Bean Cafe', description: 'A cozy coffee shop.' },
        wizardStep: 'siteType',
      });
      const updated = await service.saveRequirements(project.id, {
        requirements: { siteType: 'restaurant' },
        wizardStep: 'pages',
      });

      expect(updated.requirements).toEqual({
        businessName: 'Blue Bean Cafe',
        description: 'A cozy coffee shop.',
        siteType: 'restaurant',
      });
      expect(updated.wizardStep).toBe('pages');
    });

    it('keeps the project name in sync with the business name', async () => {
      const project = await createBasic();

      const updated = await service.saveRequirements(project.id, {
        requirements: { businessName: 'Blue Bean Cafe', description: 'A cozy coffee shop.' },
        wizardStep: 'siteType',
      });

      expect(updated.name).toBe('Blue Bean Cafe');
    });

    it('rejects ADVANCED projects', async () => {
      const project = await service.create({
        name: 'Pro site',
        mode: 'ADVANCED',
        plannerProvider: 'OPENAI',
      });

      await expect(
        service.saveRequirements(project.id, { requirements: {}, wizardStep: 'details' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });
});
