'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from '@/app/shared/ui/loader';
import { persistAccessToken } from '@/lib/auth';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('accessToken');

    if (!accessToken) {
      router.replace('/login');
      return;
    }

    void persistAccessToken(accessToken)
      .then(() => {
        window.location.assign('/profile');
      })
      .catch(() => {
        router.replace('/login');
      });
  }, [router]);

  return <Loader centered label="Обработка авторизации" />;
}
