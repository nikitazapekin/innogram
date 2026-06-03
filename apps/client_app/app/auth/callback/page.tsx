'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from '@/app/shared/ui/loader';
import { setAccessToken } from '@/lib/auth';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('accessToken');

    if (accessToken) {
      setAccessToken(accessToken);
      router.replace('/profile');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return <Loader centered label="Обработка авторизации" />;
}
