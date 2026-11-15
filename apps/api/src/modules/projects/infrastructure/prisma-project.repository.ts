import { Injectable } from '@nestjs/common';
import {
  draftBriefSchema,
  wizardStepIdSchema,
  type CreateProjectInput,
  type Project,
} from '@sitenura/shared';
import type { Project as ProjectRecord } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { ProjectRepository, type SaveRequirementsCommand } from '../domain/project.repository.js';

/**
 * Maps a database row to the domain contract. JSON columns are re-validated so
 * a stale or hand-edited row can never leak malformed data to clients.
 */
function toDomain(record: ProjectRecord): Project {
  const requirements = draftBriefSchema.safeParse(record.requirements);
  const wizardStep = wizardStepIdSchema.safeParse(record.wizardStep);

  return {
    id: record.id,
    name: record.name,
    mode: record.mode,
    plannerProvider: record.plannerProvider,
    status: record.status,
    requirements: requirements.success ? requirements.data : {},
    wizardStep: wizardStep.success ? wizardStep.data : null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

@Injectable()
export class PrismaProjectRepository extends ProjectRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(input: CreateProjectInput): Promise<Project> {
    const record = await this.prisma.project.create({ data: input });
    return toDomain(record);
  }

  async findById(id: string): Promise<Project | null> {
    const record = await this.prisma.project.findUnique({ where: { id } });
    return record ? toDomain(record) : null;
  }

  async findAll(): Promise<Project[]> {
    const records = await this.prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
    return records.map(toDomain);
  }

  async saveRequirements(id: string, command: SaveRequirementsCommand): Promise<Project> {
    const record = await this.prisma.project.update({
      where: { id },
      data: {
        requirements: command.requirements,
        wizardStep: command.wizardStep,
        ...(command.name ? { name: command.name } : {}),
      },
    });
    return toDomain(record);
  }
}
