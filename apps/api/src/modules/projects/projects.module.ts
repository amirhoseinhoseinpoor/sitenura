import { Module } from '@nestjs/common';
import { ProjectsService } from './application/projects.service.js';
import { ProjectRepository } from './domain/project.repository.js';
import { PrismaProjectRepository } from './infrastructure/prisma-project.repository.js';
import { ProjectsController } from './presentation/projects.controller.js';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, { provide: ProjectRepository, useClass: PrismaProjectRepository }],
  exports: [ProjectsService],
})
export class ProjectsModule {}
