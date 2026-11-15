import { z } from 'zod';
import type { BriefField } from './brief.schema.js';

export interface WizardStep {
  id: string;
  title: string;
  subtitle: string;
  /** Brief fields answered on this step. Empty for the review step. */
  fields: readonly BriefField[];
}

/** Ordered BASIC wizard. Adding a step = adding an entry here (and its UI). */
export const WIZARD_STEPS = [
  {
    id: 'details',
    title: 'Tell us about your website',
    subtitle: 'What is it called and what is it about?',
    fields: ['businessName', 'description'],
  },
  {
    id: 'siteType',
    title: 'What kind of website is it?',
    subtitle: 'This helps us choose the right structure.',
    fields: ['siteType'],
  },
  {
    id: 'pages',
    title: 'Which pages do you need?',
    subtitle: 'Pick as many as you like. You can change this later.',
    fields: ['pages'],
  },
  {
    id: 'layout',
    title: 'Choose a style',
    subtitle: 'The overall look and feel of your site.',
    fields: ['layoutStyle'],
  },
  {
    id: 'palette',
    title: 'Pick your colors',
    subtitle: 'A palette sets the mood of your brand.',
    fields: ['palette'],
  },
  {
    id: 'typography',
    title: 'Choose a font style',
    subtitle: 'Fonts change how your words feel.',
    fields: ['typography'],
  },
  {
    id: 'tone',
    title: 'How should your website sound?',
    subtitle: 'We will write your texts in this voice.',
    fields: ['tone'],
  },
  {
    id: 'features',
    title: 'Any extra features?',
    subtitle: 'Optional. Skip this if you are not sure.',
    fields: ['features'],
  },
  {
    id: 'review',
    title: 'Review your brief',
    subtitle: 'Check everything before we start building.',
    fields: [],
  },
] as const satisfies readonly WizardStep[];

export type WizardStepId = (typeof WIZARD_STEPS)[number]['id'];

export const wizardStepIdSchema = z.enum(
  WIZARD_STEPS.map((step) => step.id) as [WizardStepId, ...WizardStepId[]],
);
