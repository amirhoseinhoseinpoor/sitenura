import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  createProjectSchema,
  updateRequirementsSchema,
  type CreateProjectInput,
  type Project,
  type UpdateRequirementsInput,
} from '@sitenura/shared';
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

  @Patch(':id/requirements')
  saveRequirements(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(updateRequirementsSchema)) body: UpdateRequirementsInput,
  ): Promise<Project> {
    return this.projects.saveRequirements(id, body);
  }
}
