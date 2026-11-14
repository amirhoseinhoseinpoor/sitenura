'use client';

import {
  FEATURES,
  LAYOUT_STYLES,
  PAGES,
  PALETTES,
  SITE_TYPES,
  TONES,
  TYPOGRAPHY,
  type CatalogOption,
  type DraftBrief,
  type WizardStepId,
} from '@sitenura/shared';
import { Pencil } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { PaletteSwatches } from './previews';

function labelOf(catalog: readonly CatalogOption[], id: string | undefined): string | undefined {
  return catalog.find((option) => option.id === id)?.label;
}

function labelsOf(catalog: readonly CatalogOption[], ids: readonly string[] | undefined): string {
  const labels = (ids ?? []).map((id) => labelOf(catalog, id)).filter(Boolean);
  return labels.length > 0 ? labels.join(', ') : '';
}

interface ReviewRow {
  stepId: WizardStepId;
  label: string;
  value: ReactNode;
}

export function ReviewStep({
  draft,
  onEditStep,
}: {
  draft: DraftBrief;
  onEditStep: (stepId: WizardStepId) => void;
}) {
  const rows: ReviewRow[] = [
    { stepId: 'details', label: 'Name', value: draft.businessName },
    { stepId: 'details', label: 'About', value: draft.description },
    { stepId: 'siteType', label: 'Website type', value: labelOf(SITE_TYPES, draft.siteType) },
    { stepId: 'pages', label: 'Pages', value: labelsOf(PAGES, draft.pages) },
    { stepId: 'layout', label: 'Style', value: labelOf(LAYOUT_STYLES, draft.layoutStyle) },
    {
      stepId: 'palette',
      label: 'Colors',
      value: draft.palette && (
        <span className="flex items-center gap-3">
          <PaletteSwatches id={draft.palette} size="sm" />
          {labelOf(PALETTES, draft.palette)}
        </span>
      ),
    },
    { stepId: 'typography', label: 'Fonts', value: labelOf(TYPOGRAPHY, draft.typography) },
    { stepId: 'tone', label: 'Tone', value: labelOf(TONES, draft.tone) },
    {
      stepId: 'features',
      label: 'Features',
      value: labelsOf(FEATURES, draft.features) || 'None',
    },
  ];

  return (
    <dl className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex flex-col gap-1 p-4 sm:grid sm:grid-cols-[10rem_1fr_auto] sm:items-center sm:gap-4"
        >
          <dt className="text-sm font-medium text-muted-foreground">{row.label}</dt>
          <dd className="min-w-0 break-words">
            {row.value || <span className="text-red-600 dark:text-red-400">Missing</span>}
          </dd>
          <dd>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(row.stepId)}
              aria-label={`Edit ${row.label.toLowerCase()}`}
            >
              <Pencil className="size-3.5" aria-hidden />
              Edit
            </Button>
          </dd>
        </div>
      ))}
    </dl>
  );
}
