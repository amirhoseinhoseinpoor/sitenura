import { ModePicker } from '@/features/mode-selection/components/mode-picker';

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-10 px-4 py-16">
      <header className="flex flex-col gap-4">
        <span className="text-sm font-medium text-primary">PromptBridge</span>
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
          Build your website, even if you&apos;ve never written a line of code
        </h1>
        <p className="text-lg leading-8 text-muted-foreground">
          Tell us what you want. An AI of your choice (ChatGPT, Gemini, and more) turns it into
          precise instructions, and Claude builds it for you, step by step.
        </p>
      </header>

      <ModePicker />
    </main>
  );
}
