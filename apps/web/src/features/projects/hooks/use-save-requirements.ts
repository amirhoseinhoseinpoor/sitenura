'use client';

import type { UpdateRequirementsInput } from '@sitenura/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsKeys, saveRequirements } from '../api/projects.api';

export function useSaveRequirements(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateRequirementsInput) => saveRequirements(projectId, input),
    onSuccess: (project) => {
      queryClient.setQueryData(projectsKeys.detail(project.id), project);
    },
  });
}
