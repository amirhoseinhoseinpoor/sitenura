'use client';

import {
  FEATURES,
  LAYOUT_STYLES,
  PAGES,
  PALETTES,
  SITE_TYPES,
  TONES,
  TYPOGRAPHY,
  type DraftBrief,
  type WizardStepId,
} from '@sitenura/shared';
import { Field, Input, Textarea } from '@/components/ui/field';
import type { StepErrors } from '../lib/validate-step';
import { MultiChoiceGrid, SingleChoiceGrid } from './choice-grid';
import {
  FEATURE_ICONS,
  LayoutPreview,
  OptionIcon,
  PAGE_ICONS,
  PaletteSwatches,
  SITE_TYPE_ICONS,
  ToneSample,
  TypographyPreview,
} from './previews';
import { ReviewStep } from './review-step';

export interface StepContentProps {
  stepId: WizardStepId;
  draft: DraftBrief;
  errors: StepErrors;
  onChange: (patch: DraftBrief) => void;
  onEditStep: (stepId: WizardStepId) => void;
}

/** Renders the answer controls for one wizard step. */
export function StepContent({ stepId, draft, errors, onChange, onEditStep }: StepContentProps) {
  switch (stepId) {
    case 'details':
      return (
        <div className="flex flex-col gap-6">
          <Field
            id="businessName"
            label="Website or business name"
            hint="For example: Blue Bean Cafe"
            error={errors.businessName}
          >
            <Input
              id="businessName"
              autoFocus
              autoComplete="organization"
              maxLength={80}
              value={draft.businessName ?? ''}
              aria-invalid={Boolean(errors.businessName)}
              aria-describedby={errors.businessName ? 'businessName-error' : 'businessName-hint'}
              onChange={(event) => onChange({ businessName: event.target.value })}
            />
          </Field>
          <Field
            id="description"
            label="What is it about?"
            hint="A few sentences about what you do and who it is for."
            error={errors.description}
          >
            <Textarea
              id="description"
              maxLength={1000}
              value={draft.description ?? ''}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? 'description-error' : 'description-hint'}
              onChange={(event) => onChange({ description: event.target.value })}
            />
          </Field>
        </div>
      );

    case 'siteType':
      return (
        <SingleChoiceGrid
          label="Kind of website"
          options={SITE_TYPES}
          value={draft.siteType}
          error={errors.siteType}
          onChange={(siteType) => onChange({ siteType })}
          renderPreview={(id) => <OptionIcon icon={SITE_TYPE_ICONS[id]} />}
        />
      );

    case 'pages':
      return (
        <MultiChoiceGrid
          label="Pages"
          options={PAGES}
          value={draft.pages}
          error={errors.pages}
          onChange={(pages) => onChange({ pages })}
          renderPreview={(id) => <OptionIcon icon={PAGE_ICONS[id]} />}
        />
      );

    case 'layout':
      return (
        <SingleChoiceGrid
          label="Style"
          options={LAYOUT_STYLES}
          value={draft.layoutStyle}
          error={errors.layoutStyle}
          onChange={(layoutStyle) => onChange({ layoutStyle })}
          renderPreview={(id) => <LayoutPreview id={id} />}
        />
      );

    case 'palette':
      return (
        <SingleChoiceGrid
          label="Color palette"
          columns={2}
          options={PALETTES}
          value={draft.palette}
          error={errors.palette}
          onChange={(palette) => onChange({ palette })}
          renderPreview={(id) => <PaletteSwatches id={id} />}
        />
      );

    case 'typography':
      return (
        <SingleChoiceGrid
          label="Font style"
          columns={2}
          options={TYPOGRAPHY}
          value={draft.typography}
          error={errors.typography}
          onChange={(typography) => onChange({ typography })}
          renderPreview={(id) => <TypographyPreview id={id} />}
        />
      );

    case 'tone':
      return (
        <SingleChoiceGrid
          label="Tone of voice"
          options={TONES}
          value={draft.tone}
          error={errors.tone}
          onChange={(tone) => onChange({ tone })}
          renderPreview={(id) => <ToneSample id={id} />}
        />
      );

    case 'features':
      return (
        <MultiChoiceGrid
          label="Extra features"
          options={FEATURES}
          value={draft.features}
          error={errors.features}
          onChange={(features) => onChange({ features })}
          renderPreview={(id) => <OptionIcon icon={FEATURE_ICONS[id]} />}
        />
      );

    case 'review':
      return <ReviewStep draft={draft} onEditStep={onEditStep} />;
  }
}
