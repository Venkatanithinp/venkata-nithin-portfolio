import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Venkata Nithin — A Curious Mind',
  description: 'Exploring technology. Creating possibilities. The personal portfolio of Venkata Nithin, a Computer Science Engineering student and aspiring Software Developer.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
