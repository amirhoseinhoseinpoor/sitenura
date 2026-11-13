import { projectSchema, type CreateProjectInput, type Project } from '@prompt-bridge/shared';
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
