import { Injectable } from '@nestjs/common';
import type { CreateProjectInput, Project } from '@sitenura/shared';
import type { Project as ProjectRecord } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { ProjectRepository } from '../domain/project.repository.js';

function toDomain(record: ProjectRecord): Project {
  return {
    id: record.id,
    name: record.name,
    mode: record.mode,
    plannerProvider: record.plannerProvider,
    status: record.status,
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
}
