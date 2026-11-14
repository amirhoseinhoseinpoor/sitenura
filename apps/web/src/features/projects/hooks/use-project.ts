'use client';

import { useQuery } from '@tanstack/react-query';
import { getProject, projectsKeys } from '../api/projects.api';

export function useProject(id: string) {
  return useQuery({
    queryKey: projectsKeys.detail(id),
    queryFn: ({ signal }) => getProject(id, signal),
  });
}
