import { Check } from 'lucide-react';
import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface OptionCardProps {
  label: string;
  description: string;
  selected: boolean;
  /** `radio` for single choice, `checkbox` for multiple choice. */
  role: 'radio' | 'checkbox';
  onSelect: () => void;
  /** Optional visual shown above the label (icon, swatches, mini mockup...). */
  preview?: ReactNode;
}

export function OptionCard({
  label,
  description,
  selected,
  role,
  onSelect,
  preview,
}: OptionCardProps) {
  const id = useId();
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      aria-labelledby={`${id}-label`}
      aria-describedby={`${id}-description`}
      onClick={onSelect}
      className={cn(
        'group relative flex flex-col gap-3 rounded-2xl border p-4 text-start transition-all',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        selected
          ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
          : 'border-border hover:border-primary/50 hover:bg-muted',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute end-2 top-2 z-10 flex size-6 items-center justify-center rounded-full border-2 shadow-sm transition-colors',
          role === 'checkbox' && 'rounded-md',
          selected
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border bg-background',
        )}
      >
        {selected && <Check className="size-3.5" strokeWidth={3} />}
      </span>
      {preview}
      <span className="flex flex-col gap-1 pe-6">
        <span id={`${id}-label`} className="font-semibold">
          {label}
        </span>
        <span id={`${id}-description`} className="text-sm leading-6 text-muted-foreground">
          {description}
        </span>
      </span>
    </button>
  );
}
