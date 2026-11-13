import { ModePicker } from '@/features/mode-selection/components/mode-picker';

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-10 px-4 py-16">
      <header className="flex flex-col gap-4">
        <span className="text-sm font-medium text-primary">PromptBridge</span>
        <h1 className="text-3xl font-bold leading-[1.6] sm:text-4xl">
          سایتت رو بساز، حتی اگه یک خط کد هم بلد نیستی
        </h1>
        <p className="text-lg leading-8 text-muted-foreground">
          درخواستت رو می‌گیریم، یک هوش مصنوعی (ChatGPT، Gemini و…) آن را به دستورهای دقیق تبدیل
          می‌کند و Claude قدم‌به‌قدم اجرایش می‌کند.
        </p>
      </header>

      <ModePicker />
    </main>
  );
}
