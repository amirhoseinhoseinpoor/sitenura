/**
 * Option catalogs for the BASIC wizard.
 *
 * These are plain data so that the web app can render them, the API can
 * validate against them, and the planner (Phase 3) can turn the chosen ids
 * into rich natural-language instructions.
 */

export interface CatalogOption<Id extends string = string> {
  id: Id;
  label: string;
  description: string;
}

export interface PaletteOption<Id extends string = string> extends CatalogOption<Id> {
  /** Hex colors: background, surface, primary, accent, text. */
  colors: readonly [string, string, string, string, string];
}

export const SITE_TYPES = [
  {
    id: 'business',
    label: 'Business',
    description: 'Present your company and services.',
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    description: 'Showcase your work and projects.',
  },
  {
    id: 'store',
    label: 'Online store',
    description: 'Sell products online.',
  },
  {
    id: 'blog',
    label: 'Blog',
    description: 'Publish articles and stories.',
  },
  {
    id: 'restaurant',
    label: 'Restaurant & cafe',
    description: 'Menu, opening hours and reservations.',
  },
  {
    id: 'landing',
    label: 'Landing page',
    description: 'One focused page for a product or campaign.',
  },
  {
    id: 'personal',
    label: 'Personal',
    description: 'A home for you, your CV and your links.',
  },
  {
    id: 'event',
    label: 'Event',
    description: 'Schedule, speakers and registration.',
  },
] as const satisfies readonly CatalogOption[];

export const PAGES = [
  { id: 'home', label: 'Home', description: 'The front door of your site.' },
  { id: 'about', label: 'About', description: 'Your story and mission.' },
  { id: 'services', label: 'Services', description: 'What you offer.' },
  { id: 'gallery', label: 'Gallery', description: 'Photos or past work.' },
  { id: 'blog', label: 'Blog', description: 'Articles and news.' },
  { id: 'pricing', label: 'Pricing', description: 'Plans and prices.' },
  { id: 'team', label: 'Team', description: 'The people behind it.' },
  { id: 'faq', label: 'FAQ', description: 'Answers to common questions.' },
  { id: 'contact', label: 'Contact', description: 'How people reach you.' },
] as const satisfies readonly CatalogOption[];

export const LAYOUT_STYLES = [
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Lots of white space, clean and calm.',
  },
  {
    id: 'modern',
    label: 'Modern',
    description: 'Cards, soft shadows and rounded corners.',
  },
  {
    id: 'bold',
    label: 'Bold',
    description: 'Big headlines and strong contrast.',
  },
  {
    id: 'elegant',
    label: 'Elegant',
    description: 'Refined spacing with a premium feel.',
  },
  {
    id: 'playful',
    label: 'Playful',
    description: 'Bright shapes and friendly details.',
  },
  {
    id: 'corporate',
    label: 'Corporate',
    description: 'Structured, trustworthy and professional.',
  },
] as const satisfies readonly CatalogOption[];

export const PALETTES = [
  {
    id: 'ocean',
    label: 'Ocean',
    description: 'Calm blues that build trust.',
    colors: ['#F8FAFC', '#E0F2FE', '#0369A1', '#06B6D4', '#0F172A'],
  },
  {
    id: 'forest',
    label: 'Forest',
    description: 'Natural greens, fresh and organic.',
    colors: ['#F7FAF5', '#E3EFD9', '#2F6B3A', '#A3B86C', '#1C2A1F'],
  },
  {
    id: 'sunset',
    label: 'Sunset',
    description: 'Warm oranges full of energy.',
    colors: ['#FFF8F1', '#FFE4CC', '#EA580C', '#F43F5E', '#2A1A12'],
  },
  {
    id: 'royal',
    label: 'Royal',
    description: 'Deep purple with a premium touch.',
    colors: ['#FAF7FF', '#EDE4FF', '#5B21B6', '#D4A017', '#1E1433'],
  },
  {
    id: 'monochrome',
    label: 'Monochrome',
    description: 'Black and white, timeless.',
    colors: ['#FFFFFF', '#F4F4F5', '#18181B', '#71717A', '#09090B'],
  },
  {
    id: 'blush',
    label: 'Blush',
    description: 'Soft pinks, gentle and warm.',
    colors: ['#FFF7F8', '#FCE7EC', '#BE185D', '#F9A8D4', '#2B1520'],
  },
  {
    id: 'midnight',
    label: 'Midnight',
    description: 'Dark mode with neon accents.',
    colors: ['#0B1020', '#151C33', '#6366F1', '#22D3EE', '#E2E8F0'],
  },
  {
    id: 'earth',
    label: 'Earth',
    description: 'Sand and terracotta, grounded.',
    colors: ['#FBF7F2', '#F0E6D8', '#9A4A2B', '#C9A27E', '#2B211A'],
  },
] as const satisfies readonly PaletteOption[];

export const TYPOGRAPHY = [
  {
    id: 'clean',
    label: 'Clean sans',
    description: 'Neutral and very readable (e.g. Inter).',
  },
  {
    id: 'classic',
    label: 'Classic serif',
    description: 'Traditional and literary (e.g. Playfair Display).',
  },
  {
    id: 'geometric',
    label: 'Geometric',
    description: 'Modern and confident (e.g. Poppins).',
  },
  {
    id: 'rounded',
    label: 'Friendly rounded',
    description: 'Soft and approachable (e.g. Nunito).',
  },
] as const satisfies readonly CatalogOption[];

export const TONES = [
  {
    id: 'professional',
    label: 'Professional',
    description: 'Clear, confident and to the point.',
  },
  {
    id: 'friendly',
    label: 'Friendly',
    description: 'Warm and conversational.',
  },
  {
    id: 'playful',
    label: 'Playful',
    description: 'Fun, witty and energetic.',
  },
  {
    id: 'luxury',
    label: 'Luxury',
    description: 'Exclusive, refined and elegant.',
  },
  {
    id: 'inspiring',
    label: 'Inspiring',
    description: 'Bold and motivational.',
  },
] as const satisfies readonly CatalogOption[];

export const FEATURES = [
  {
    id: 'contactForm',
    label: 'Contact form',
    description: 'Visitors can message you.',
  },
  {
    id: 'newsletter',
    label: 'Newsletter signup',
    description: 'Collect email subscribers.',
  },
  {
    id: 'testimonials',
    label: 'Testimonials',
    description: 'Show what customers say.',
  },
  {
    id: 'booking',
    label: 'Booking',
    description: 'Let people book appointments.',
  },
  {
    id: 'map',
    label: 'Map & location',
    description: 'Show where to find you.',
  },
  {
    id: 'socialLinks',
    label: 'Social links',
    description: 'Link to your social profiles.',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp button',
    description: 'Chat with you in one tap.',
  },
  {
    id: 'multilingual',
    label: 'Multiple languages',
    description: 'Offer your site in more than one language.',
  },
] as const satisfies readonly CatalogOption[];

type Ids<T extends readonly { id: string }[]> = T[number]['id'];

export type SiteTypeId = Ids<typeof SITE_TYPES>;
export type PageId = Ids<typeof PAGES>;
export type LayoutStyleId = Ids<typeof LAYOUT_STYLES>;
export type PaletteId = Ids<typeof PALETTES>;
export type TypographyId = Ids<typeof TYPOGRAPHY>;
export type ToneId = Ids<typeof TONES>;
export type FeatureId = Ids<typeof FEATURES>;

/** Turns a catalog into a non-empty tuple of ids, as required by `z.enum`. */
export function catalogIds<T extends readonly { id: string }[]>(catalog: T): [Ids<T>, ...Ids<T>[]] {
  return catalog.map((option) => option.id) as [Ids<T>, ...Ids<T>[]];
}
