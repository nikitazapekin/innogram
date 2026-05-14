'use client';

import { useEffect } from 'react';
import { AppErrorBoundary } from '@/app/widgets/app-error-boundary';

type GlobalErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalErrorPage({ error, reset }: GlobalErrorPageProps) {
  return <AppErrorBoundary error={error} reset={reset} />;
}
