import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const vazirmatn = Vazirmatn({
  variable: '--font-vazirmatn',
  subsets: ['arabic', 'latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'PromptBridge', template: '%s | PromptBridge' },
  description: 'بدون دانش برنامه‌نویسی، قدم‌به‌قدم سایت خودت را با هوش مصنوعی بساز.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
