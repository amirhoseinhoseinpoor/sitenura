import { z } from 'zod';
import {
  FEATURES,
  LAYOUT_STYLES,
  PAGES,
  PALETTES,
  SITE_TYPES,
  TONES,
  TYPOGRAPHY,
  catalogIds,
} from './catalog.js';

/**
 * The complete "website brief" a BASIC user produces by finishing the wizard.
 * It is the input to the planner LLM in Phase 3.
 */
export const websiteBriefSchema = z.object({
  businessName: z.string().trim().min(1, 'Please enter a name').max(80),
  description: z
    .string()
    .trim()
    .min(10, 'Tell us a little more (at least 10 characters)')
    .max(1000),
  siteType: z.enum(catalogIds(SITE_TYPES), 'Pick the kind of website'),
  pages: z
    .array(z.enum(catalogIds(PAGES)))
    .min(1, 'Choose at least one page')
    .refine((pages) => new Set(pages).size === pages.length, 'Pages must be unique'),
  layoutStyle: z.enum(catalogIds(LAYOUT_STYLES), 'Pick a style'),
  palette: z.enum(catalogIds(PALETTES), 'Pick a color palette'),
  typography: z.enum(catalogIds(TYPOGRAPHY), 'Pick a font style'),
  tone: z.enum(catalogIds(TONES), 'Pick a tone of voice'),
  features: z
    .array(z.enum(catalogIds(FEATURES)))
    .refine((features) => new Set(features).size === features.length, 'Features must be unique'),
});
export type WebsiteBrief = z.infer<typeof websiteBriefSchema>;
export type BriefField = keyof WebsiteBrief;

/** A brief in progress: every answer is optional, but each given answer must be valid. */
export const draftBriefSchema = websiteBriefSchema.partial();
export type DraftBrief = z.infer<typeof draftBriefSchema>;
