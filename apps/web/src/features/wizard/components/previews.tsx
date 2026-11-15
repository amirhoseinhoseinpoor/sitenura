import {
  PALETTES,
  type FeatureId,
  type LayoutStyleId,
  type PageId,
  type PaletteId,
  type SiteTypeId,
  type ToneId,
  type TypographyId,
} from '@sitenura/shared';
import {
  BookOpen,
  Briefcase,
  CalendarCheck,
  CalendarDays,
  CircleHelp,
  CreditCard,
  FileText,
  Home,
  Image as ImageIcon,
  Info,
  Languages,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquareQuote,
  Newspaper,
  Palette,
  Rocket,
  Share2,
  ShoppingBag,
  User,
  Users,
  UtensilsCrossed,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* Icons ------------------------------------------------------------------ */

export const SITE_TYPE_ICONS: Record<SiteTypeId, LucideIcon> = {
  business: Briefcase,
  portfolio: Palette,
  store: ShoppingBag,
  blog: BookOpen,
  restaurant: UtensilsCrossed,
  landing: Rocket,
  personal: User,
  event: CalendarDays,
};

export const PAGE_ICONS: Record<PageId, LucideIcon> = {
  home: Home,
  about: Info,
  services: Wrench,
  gallery: ImageIcon,
  blog: Newspaper,
  pricing: CreditCard,
  team: Users,
  faq: CircleHelp,
  contact: Mail,
};

export const FEATURE_ICONS: Record<FeatureId, LucideIcon> = {
  contactForm: FileText,
  newsletter: Mail,
  testimonials: MessageSquareQuote,
  booking: CalendarCheck,
  map: MapPin,
  socialLinks: Share2,
  whatsapp: MessageCircle,
  multilingual: Languages,
};

export function OptionIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
      <Icon className="size-5" aria-hidden />
    </span>
  );
}

/* Layout mini-mockups ---------------------------------------------------- */

const layoutFrame: Record<LayoutStyleId, string> = {
  minimal: 'bg-white gap-3 p-4',
  modern: 'bg-slate-50 gap-2 p-3',
  bold: 'bg-zinc-900 gap-2 p-3',
  elegant: 'bg-stone-50 gap-3 p-4',
  playful: 'bg-amber-50 gap-2 p-3',
  corporate: 'bg-white gap-2 p-3',
};

/** A tiny, purely decorative wireframe that hints at each layout style. */
export function LayoutPreview({ id }: { id: LayoutStyleId }) {
  const bar = 'rounded-full';
  return (
    <div
      aria-hidden
      className={cn(
        'flex h-28 flex-col overflow-hidden rounded-xl border border-border',
        layoutFrame[id],
      )}
    >
      {id === 'minimal' && (
        <>
          <div className={cn(bar, 'h-1.5 w-10 bg-zinc-300')} />
          <div className={cn(bar, 'mt-2 h-2.5 w-3/4 bg-zinc-800')} />
          <div className={cn(bar, 'h-1.5 w-1/2 bg-zinc-300')} />
        </>
      )}
      {id === 'modern' && (
        <>
          <div className={cn(bar, 'h-2 w-2/3 bg-indigo-500')} />
          <div className="grid flex-1 grid-cols-3 gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-lg bg-white shadow-sm" />
            ))}
          </div>
        </>
      )}
      {id === 'bold' && (
        <>
          <div className="h-5 w-full rounded bg-yellow-400" />
          <div className="h-3 w-2/3 rounded bg-white" />
          <div className="mt-auto h-3 w-12 rounded bg-yellow-400" />
        </>
      )}
      {id === 'elegant' && (
        <>
          <div className="mx-auto h-px w-12 bg-stone-400" />
          <div className={cn(bar, 'mx-auto h-2 w-1/2 bg-stone-700')} />
          <div className={cn(bar, 'mx-auto h-1 w-1/3 bg-stone-400')} />
          <div className="mx-auto mt-auto h-px w-12 bg-stone-400" />
        </>
      )}
      {id === 'playful' && (
        <div className="relative flex-1">
          <div className="absolute start-1 top-1 size-8 rounded-full bg-pink-400" />
          <div className="absolute end-3 top-4 size-6 rotate-12 rounded-md bg-sky-400" />
          <div className="absolute bottom-1 start-10 h-4 w-16 rounded-full bg-lime-400" />
        </div>
      )}
      {id === 'corporate' && (
        <>
          <div className="h-3 w-full rounded-sm bg-blue-900" />
          <div className="grid flex-1 grid-cols-2 gap-1.5">
            <div className="rounded-sm bg-slate-200" />
            <div className="flex flex-col gap-1">
              <div className="h-1.5 rounded-sm bg-slate-300" />
              <div className="h-1.5 w-2/3 rounded-sm bg-slate-300" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* Palettes ---------------------------------------------------------------- */

const paletteById = new Map(PALETTES.map((palette) => [palette.id, palette]));

export function PaletteSwatches({ id, size = 'md' }: { id: PaletteId; size?: 'sm' | 'md' }) {
  const palette = paletteById.get(id);
  if (!palette) return null;
  return (
    <div
      aria-hidden
      className={cn(
        'flex overflow-hidden rounded-xl border border-border',
        size === 'md' ? 'h-16' : 'h-6 w-24',
      )}
    >
      {palette.colors.map((color) => (
        <span key={color} className="flex-1" style={{ backgroundColor: color }} />
      ))}
    </div>
  );
}

/* Typography -------------------------------------------------------------- */

/** System font stacks that approximate each style without loading web fonts. */
export const TYPOGRAPHY_STACKS: Record<TypographyId, string> = {
  clean: 'ui-sans-serif, system-ui, "Segoe UI", Arial, sans-serif',
  classic: 'Georgia, "Times New Roman", serif',
  geometric: '"Century Gothic", Futura, "Trebuchet MS", sans-serif',
  rounded: 'ui-rounded, "Arial Rounded MT Bold", "Segoe UI", sans-serif',
};

export function TypographyPreview({ id }: { id: TypographyId }) {
  return (
    <span
      aria-hidden
      className="flex h-16 items-center rounded-xl bg-muted px-4 text-3xl"
      style={{ fontFamily: TYPOGRAPHY_STACKS[id] }}
    >
      Aa Bb
    </span>
  );
}

/* Tones ------------------------------------------------------------------- */

export const TONE_SAMPLES: Record<ToneId, string> = {
  professional: '“Reliable solutions, delivered on time.”',
  friendly: '“Hey there! We’re so glad you stopped by.”',
  playful: '“Warning: our coffee may cause happiness.”',
  luxury: '“Crafted for those who expect the exceptional.”',
  inspiring: '“Your next big idea starts here.”',
};

export function ToneSample({ id }: { id: ToneId }) {
  return (
    <span className="rounded-xl bg-muted px-3 py-2 text-sm italic leading-6">
      {TONE_SAMPLES[id]}
    </span>
  );
}
