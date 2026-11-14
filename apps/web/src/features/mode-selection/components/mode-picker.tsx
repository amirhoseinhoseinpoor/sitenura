'use client';

import { InteractionMode, PlannerProvider } from '@sitenura/shared';
import { Code2, Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCreateProject } from '@/features/projects/hooks/use-create-project';
import { cn } from '@/lib/utils';

const MODES = [
  {
    value: InteractionMode.BASIC,
    title: 'Basic',
    description:
      "Don't code? We'll guide you step by step through colors, templates and layout, and handle the rest.",
    icon: Sparkles,
    available: true,
  },
  {
    value: InteractionMode.ADVANCED,
    title: 'Advanced',
    description:
      'Know exactly what you want? Describe it in your own words and choose the AI models yourself.',
    icon: Code2,
    available: false,
  },
] as const;

export function ModePicker() {
  const router = useRouter();
  const [selected, setSelected] = useState<InteractionMode | null>(null);
  const createProject = useCreateProject();

  function handleContinue() {
    if (selected !== InteractionMode.BASIC) return;
    createProject.mutate(
      { name: 'Untitled website', mode: selected, plannerProvider: PlannerProvider.OPENAI },
      { onSuccess: (project) => router.push(`/projects/${project.id}/wizard`) },
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div role="radiogroup" aria-label="Choose a mode" className="grid gap-4 sm:grid-cols-2">
        {MODES.map(({ value, title, description, icon: Icon, available }) => {
          const active = selected === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={!available}
              onClick={() => setSelected(value)}
              className={cn(
                'flex flex-col gap-3 rounded-2xl border p-6 text-start transition-all',
                'disabled:cursor-not-allowed disabled:opacity-60',
                active
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                  : 'border-border enabled:hover:border-primary/50 enabled:hover:bg-muted',
              )}
            >
              <span className="flex items-center justify-between">
                <Icon className="size-7 text-primary" aria-hidden />
                {!available && (
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    Coming soon
                  </span>
                )}
              </span>
              <span className="text-lg font-semibold">{title}</span>
              <span className="text-sm leading-7 text-muted-foreground">{description}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col items-start gap-3">
        <Button size="lg" disabled={!selected || createProject.isPending} onClick={handleContinue}>
          {createProject.isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          Continue
        </Button>
        {createProject.isError && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            We couldn&apos;t start your project. Please check your connection and try again.
          </p>
        )}
      </div>
    </div>
  );
}
