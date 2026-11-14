import {
  websiteBriefSchema,
  type BriefField,
  type DraftBrief,
  type WizardStep,
} from '@sitenura/shared';
import { z } from 'zod';

export type StepErrors = Partial<Record<BriefField, string>>;

export type StepValidation =
  { success: true; data: DraftBrief } | { success: false; errors: StepErrors };

/** Fields that are optional for the user: an untouched answer counts as "none selected". */
const EMPTY_DEFAULTS: DraftBrief = { features: [] };

/**
 * Validates only the fields that belong to `step`, using the same schema the
 * API enforces, and returns the clean values to save.
 */
export function validateStep(step: WizardStep, draft: DraftBrief): StepValidation {
  if (step.fields.length === 0) return { success: true, data: {} };

  const mask = Object.fromEntries(step.fields.map((field) => [field, true])) as Partial<
    Record<BriefField, true>
  >;
  const candidate = Object.fromEntries(
    step.fields.map((field) => [field, draft[field] ?? EMPTY_DEFAULTS[field]]),
  );

  const result = websiteBriefSchema.pick(mask).safeParse(candidate);
  if (result.success) return { success: true, data: result.data as DraftBrief };

  const { fieldErrors } = z.flattenError(result.error);
  const errors: StepErrors = {};
  for (const field of step.fields) {
    const message = (fieldErrors as Record<string, string[] | undefined>)[field]?.[0];
    if (message) errors[field] = message;
  }
  return { success: false, errors };
}

/** True when the draft is a complete, valid brief. */
export function isBriefComplete(draft: DraftBrief): boolean {
  return websiteBriefSchema.safeParse({ ...EMPTY_DEFAULTS, ...draft }).success;
}
