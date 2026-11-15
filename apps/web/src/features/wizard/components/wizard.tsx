'use client';

import { WIZARD_STEPS, type DraftBrief, type Project, type WizardStepId } from '@sitenura/shared';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSaveRequirements } from '@/features/projects/hooks/use-save-requirements';
import { isBriefComplete, validateStep, type StepErrors } from '../lib/validate-step';
import { StepContent } from './step-content';
import { WizardProgress } from './wizard-progress';

const REVIEW_INDEX = WIZARD_STEPS.length - 1;

function indexOf(stepId: WizardStepId | null): number {
  const index = WIZARD_STEPS.findIndex((step) => step.id === stepId);
  return index === -1 ? 0 : index;
}

/**
 * Orchestrates the BASIC wizard: keeps the local draft, validates the current
 * step against the shared schema and saves it before moving on, so users can
 * leave at any time and resume where they stopped.
 */
export function Wizard({ project }: { project: Project }) {
  const [index, setIndex] = useState(() => indexOf(project.wizardStep));
  const [draft, setDraft] = useState<DraftBrief>(project.requirements);
  const [errors, setErrors] = useState<StepErrors>({});
  /** Set when the user jumps back from the review screen to change one answer. */
  const [returnToReview, setReturnToReview] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const save = useSaveRequirements(project.id);

  // Index is always in range; the fallback only satisfies noUncheckedIndexedAccess.
  const step = WIZARD_STEPS[index] ?? WIZARD_STEPS[0];
  const isReview = index === REVIEW_INDEX;
  const complete = isBriefComplete(draft);

  function goTo(nextIndex: number) {
    setErrors({});
    setIndex(nextIndex);
    // Move focus to the new question for keyboard and screen-reader users.
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  function handleChange(patch: DraftBrief) {
    setDraft((current) => ({ ...current, ...patch }));
    setErrors((current) => {
      const next = { ...current };
      for (const key of Object.keys(patch) as (keyof StepErrors)[]) delete next[key];
      return next;
    });
  }

  function handleNext() {
    const result = validateStep(step, draft);
    if (!result.success) {
      setErrors(result.errors);
      return;
    }

    const nextIndex = returnToReview ? REVIEW_INDEX : Math.min(index + 1, REVIEW_INDEX);
    const nextStep = WIZARD_STEPS[nextIndex] ?? step;
    save.mutate(
      { requirements: result.data, wizardStep: nextStep.id },
      {
        onSuccess: (saved) => {
          setDraft(saved.requirements);
          setReturnToReview(false);
          goTo(nextIndex);
        },
      },
    );
  }

  function handleEditStep(stepId: WizardStepId) {
    setReturnToReview(true);
    goTo(indexOf(stepId));
  }

  function handleBack() {
    setReturnToReview(false);
    goTo(index - 1);
  }

  const nextLabel = returnToReview
    ? 'Save and review'
    : index === REVIEW_INDEX - 1
      ? 'Review'
      : 'Next';

  return (
    <div className="flex flex-col gap-8">
      <WizardProgress current={index} total={WIZARD_STEPS.length} />

      <header className="flex flex-col gap-2">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-bold tracking-tight outline-none sm:text-3xl"
        >
          {step.title}
        </h1>
        <p className="text-muted-foreground">{step.subtitle}</p>
      </header>

      <StepContent
        stepId={step.id}
        draft={draft}
        errors={errors}
        onChange={handleChange}
        onEditStep={handleEditStep}
      />

      {save.isError && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          We couldn&apos;t save your answers. Please try again.
        </p>
      )}

      <footer className="flex items-center justify-between gap-3 border-t border-border pt-6">
        <Button variant="outline" onClick={handleBack} disabled={index === 0 || save.isPending}>
          <ArrowLeft className="size-4" aria-hidden />
          Back
        </Button>

        {isReview ? (
          <div className="flex flex-col items-end gap-1 text-end">
            <Button disabled title="Website generation arrives in the next release">
              <CheckCircle2 className="size-4" aria-hidden />
              Build my website
            </Button>
            <span className="text-xs text-muted-foreground">
              {complete
                ? 'Your brief is saved. Website generation is coming soon.'
                : 'Some answers are missing. Use Edit to complete them.'}
            </span>
          </div>
        ) : (
          <Button onClick={handleNext} disabled={save.isPending}>
            {save.isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {nextLabel}
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        )}
      </footer>
    </div>
  );
}
