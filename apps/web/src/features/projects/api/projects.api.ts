import {
  projectSchema,
  type CreateProjectInput,
  type Project,
  type UpdateRequirementsInput,
} from '@sitenura/shared';
import { apiRequest } from '@/lib/api-client';

export const projectsKeys = {
  all: ['projects'] as const,
  detail: (id: string) => ['projects', id] as const,
};

export function createProject(input: CreateProjectInput): Promise<Project> {
  return apiRequest('/projects', { method: 'POST', body: input, schema: projectSchema });
}

export function listProjects(signal?: AbortSignal): Promise<Project[]> {
  return apiRequest('/projects', { schema: projectSchema.array(), signal });
}

export function getProject(id: string, signal?: AbortSignal): Promise<Project> {
  return apiRequest(`/projects/${id}`, { schema: projectSchema, signal });
}

export function saveRequirements(id: string, input: UpdateRequirementsInput): Promise<Project> {
  return apiRequest(`/projects/${id}/requirements`, {
    method: 'PATCH',
    body: input,
    schema: projectSchema,
  });
}
