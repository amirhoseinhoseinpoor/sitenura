'use client';

import { InteractionMode } from '@sitenura/shared';
import { Code2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MODES = [
  {
    value: InteractionMode.BASIC,
    title: 'Basic',
    description:
      "Don't code? We'll guide you step by step through colors, templates and layout, and handle the rest.",
    icon: Sparkles,
  },
  {
    value: InteractionMode.ADVANCED,
    title: 'Advanced',
    description:
      'Know exactly what you want? Describe it in your own words and choose the AI models yourself.',
    icon: Code2,
  },
] as const;

export function ModePicker() {
  const [selected, setSelected] = useState<InteractionMode | null>(null);

  return (
    <div className="flex w-full flex-col gap-6">
      <div role="radiogroup" aria-label="Choose a mode" className="grid gap-4 sm:grid-cols-2">
        {MODES.map(({ value, title, description, icon: Icon }) => {
          const active = selected === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setSelected(value)}
              className={cn(
                'flex flex-col gap-3 rounded-2xl border p-6 text-start transition-all',
                active
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                  : 'border-border hover:border-primary/50 hover:bg-muted',
              )}
            >
              <Icon className="size-7 text-primary" aria-hidden />
              <span className="text-lg font-semibold">{title}</span>
              <span className="text-sm leading-7 text-muted-foreground">{description}</span>
            </button>
          );
        })}
      </div>

      {/* Wizard / advanced editor are wired up in Phase 1 & 3 of the roadmap. */}
      <Button size="lg" disabled={!selected} className="self-start">
        Continue
      </Button>
    </div>
  );
}
