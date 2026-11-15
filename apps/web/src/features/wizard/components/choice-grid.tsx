'use client';

import type { CatalogOption } from '@sitenura/shared';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { OptionCard } from './option-card';

interface BaseProps<Id extends string> {
  label: string;
  options: readonly CatalogOption<Id>[];
  renderPreview?: (id: Id) => ReactNode;
  columns?: 2 | 3;
  error?: string;
}

const gridColumns = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 lg:grid-cols-3' } as const;

function Grid({
  label,
  role,
  columns = 3,
  error,
  children,
}: {
  label: string;
  role: 'radiogroup' | 'group';
  columns?: 2 | 3;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div role={role} aria-label={label} className={cn('grid gap-3', gridColumns[columns])}>
        {children}
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export function SingleChoiceGrid<Id extends string>({
  value,
  onChange,
  options,
  renderPreview,
  ...grid
}: BaseProps<Id> & { value: Id | undefined; onChange: (value: Id) => void }) {
  return (
    <Grid role="radiogroup" {...grid}>
      {options.map((option) => (
        <OptionCard
          key={option.id}
          role="radio"
          label={option.label}
          description={option.description}
          selected={value === option.id}
          onSelect={() => onChange(option.id)}
          preview={renderPreview?.(option.id)}
        />
      ))}
    </Grid>
  );
}

export function MultiChoiceGrid<Id extends string>({
  value = [],
  onChange,
  options,
  renderPreview,
  ...grid
}: BaseProps<Id> & { value: readonly Id[] | undefined; onChange: (value: Id[]) => void }) {
  function toggle(id: Id) {
    onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id]);
  }

  return (
    <Grid role="group" {...grid}>
      {options.map((option) => (
        <OptionCard
          key={option.id}
          role="checkbox"
          label={option.label}
          description={option.description}
          selected={value.includes(option.id)}
          onSelect={() => toggle(option.id)}
          preview={renderPreview?.(option.id)}
        />
      ))}
    </Grid>
  );
}
