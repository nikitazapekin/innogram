'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { RequestLoader } from '@/app/features/system-feedback';
import { InputField } from '@/app/shared/ui/input';
import styles from './AuthForm.module.scss';
import { authSchema, type AuthFormValues } from '../../model/authSchema';
import { loginUser, registerUser } from '@/app/shared/api/auth';
import { setAccessToken } from '@/lib/auth';

type AuthFormProps = {
  description: string;
  submitLabel: string;
  switchLabel: string;
  switchHref: string;
  withProvider?: boolean;
};

const initialValues: AuthFormValues = {
  email: '',
  password: '',
};

export function AuthForm({
  description,
  submitLabel,
  switchLabel,
  switchHref,
  withProvider = false,
}: AuthFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isLogin = pathname === '/login';

  const [values, setValues] = useState<AuthFormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof AuthFormValues, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (field: keyof AuthFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiError(null);

    const result = authSchema.safeParse(values);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });

      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      let response;

      if (isLogin) {
        response = await loginUser(values.email, values.password);
      } else {
        response = await registerUser(values.email, values.password);
      }

      setAccessToken(response.accessToken);
      router.push('/profile');
    } catch (error) {
      if (error instanceof Error) {
        setApiError(error.message);
      } else {
        setApiError('Произошла ошибка');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = () => {
    const redirectUri = `${window.location.origin}/auth/callback`;
    window.location.href = `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/auth/google?redirectUri=${encodeURIComponent(redirectUri)}`;
  };

  return (
    <section className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authIntro}>
          <h1 className={styles.title}>{description}</h1>
        </div>

        {apiError && <p className={styles.apiError}>{apiError}</p>}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <InputField
            error={errors.email}
            label="Почта"
            name="email"
            placeholder="you@example.com"
            type="email"
            value={values.email}
            onChange={(event) => handleFieldChange('email', event.target.value)}
          />

          <InputField
            error={errors.password}
            label="Пароль"
            name="password"
            placeholder="Минимум 6 символов"
            type="password"
            value={values.password}
            onChange={(event) => handleFieldChange('password', event.target.value)}
          />

          <button className={styles.submitButton} type="submit" disabled={isSubmitting}>
            {isSubmitting ? <RequestLoader inline label="Отправка" /> : submitLabel}
          </button>
        </form>

        {withProvider ? (
          <div className={styles.provider}>
            <p className={styles.providerTitle}>Продолжить с</p>
            <button
              className={styles.providerButton}
              type="button"
              aria-label="Продолжить с Google"
              onClick={handleGoogleAuth}
            >
              <Image
                alt="Google"
                className={styles.providerImage}
                height={72}
                priority
                src="/google_logo.webp"
                width={72}
              />
            </button>
          </div>
        ) : null}

        <p className={styles.switchText}>
          <Link className={styles.switchLink} href={switchHref}>
            {switchLabel}
          </Link>
        </p>
      </div>
    </section>
  );
}
