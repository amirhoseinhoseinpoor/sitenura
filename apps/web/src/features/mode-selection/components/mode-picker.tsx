'use client';

import { InteractionMode } from '@prompt-bridge/shared';
import { Code2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MODES = [
  {
    value: InteractionMode.BASIC,
    title: 'حالت ساده',
    description:
      'برنامه‌نویسی بلد نیستی؟ قدم‌به‌قدم ازت رنگ، قالب و ظاهر سایت رو می‌پرسیم و بقیه‌اش با ما.',
    icon: Sparkles,
  },
  {
    value: InteractionMode.ADVANCED,
    title: 'حالت پیشرفته',
    description: 'خودت دقیق می‌دونی چی می‌خوای؟ درخواستت رو آزاد بنویس و مدل‌ها رو خودت انتخاب کن.',
    icon: Code2,
  },
] as const;

export function ModePicker() {
  const [selected, setSelected] = useState<InteractionMode | null>(null);

  return (
    <div className="flex w-full flex-col gap-6">
      <div role="radiogroup" aria-label="انتخاب حالت" className="grid gap-4 sm:grid-cols-2">
        {MODES.map(({ value, title, description, icon: Icon }) => {
          const active = selected === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setSelected(value)}
              className={cn(
                'flex flex-col gap-3 rounded-2xl border p-6 text-start transition-all',
                active
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                  : 'border-border hover:border-primary/50 hover:bg-muted',
              )}
            >
              <Icon className="size-7 text-primary" aria-hidden />
              <span className="text-lg font-semibold">{title}</span>
              <span className="text-sm leading-7 text-muted-foreground">{description}</span>
            </button>
          );
        })}
      </div>

      {/* Wizard / advanced editor are wired up in Phase 1 & 3 of the roadmap. */}
      <Button size="lg" disabled={!selected} className="self-start">
        ادامه
      </Button>
    </div>
  );
}
