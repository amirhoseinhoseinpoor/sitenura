import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { createProjectSchema, type CreateProjectInput, type Project } from '@sitenura/shared';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { ProjectsService } from '../application/projects.service.js';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(createProjectSchema)) body: CreateProjectInput,
  ): Promise<Project> {
    return this.projects.create(body);
  }

  @Get()
  list(): Promise<Project[]> {
    return this.projects.list();
  }

  @Get(':id')
  getById(@Param('id', new ParseUUIDPipe()) id: string): Promise<Project> {
    return this.projects.getById(id);
  }
}
