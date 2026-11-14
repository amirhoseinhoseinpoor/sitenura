'use client';

import { InteractionMode } from '@sitenura/shared';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useProject } from '@/features/projects/hooks/use-project';
import { ApiError } from '@/lib/api-client';
import { Wizard } from './wizard';

export function WizardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading your project" className="flex flex-col gap-8">
      <div className="h-2 animate-pulse rounded-full bg-muted" />
      <div className="h-9 w-2/3 animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  );
}

function Notice({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground">{message}</p>
      <Link href="/" className="font-medium text-primary underline-offset-4 hover:underline">
        Back to start
      </Link>
    </div>
  );
}

/** Loads the project from the URL and hands it to the wizard. */
export function WizardScreen() {
  const { id } = useParams<{ id: string }>();
  const { data: project, error, isPending } = useProject(id);

  if (isPending) return <WizardSkeleton />;

  if (error) {
    return error instanceof ApiError && (error.status === 404 || error.status === 400) ? (
      <Notice title="Project not found" message="This project doesn't exist or was removed." />
    ) : (
      <Notice
        title="Something went wrong"
        message="We couldn't load your project. Please refresh the page."
      />
    );
  }

  if (project.mode !== InteractionMode.BASIC) {
    return (
      <Notice
        title="Advanced mode is coming soon"
        message="The guided wizard is only for Basic projects."
      />
    );
  }

  return <Wizard key={project.id} project={project} />;
}
