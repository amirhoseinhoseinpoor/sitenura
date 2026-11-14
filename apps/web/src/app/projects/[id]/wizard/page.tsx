import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { WizardScreen, WizardSkeleton } from '@/features/wizard/components/wizard-screen';

export const metadata: Metadata = {
  title: 'Website brief',
};

export default function WizardPage() {
  return (
    <div className="flex flex-1 flex-col">
      <nav className="border-b border-border">
        <div className="mx-auto flex h-14 w-full max-w-4xl items-center px-4">
          <Link href="/" className="font-semibold text-primary">
            Sitenura
          </Link>
        </div>
      </nav>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        <Suspense fallback={<WizardSkeleton />}>
          <WizardScreen />
        </Suspense>
      </main>
    </div>
  );
}
