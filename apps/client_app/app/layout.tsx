import type { Metadata } from 'next';
import './global.scss';
import { QueryProvider } from './providers/QueryProvider';
import { AppErrorBoundary } from './widgets/app-error-boundary';
import { Header } from './widgets/header';
import { Footer } from './widgets/footer';

export const metadata: Metadata = {
  title: 'Innogram',
  description: 'Innogram application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="layout">
        <QueryProvider>
          <AppErrorBoundary>
            <Header />
            <main className="layout__main">{children}</main>
            <Footer />
          </AppErrorBoundary>
        </QueryProvider>
      </body>
    </html>
  );
}
