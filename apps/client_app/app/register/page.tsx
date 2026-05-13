import { AuthForm } from '../features/auth';

export default function RegisterPage() {
  return (
    <AuthForm
      description="Регистрация"
      submitLabel="Зарегистрироваться"
      switchHref="/login"
      switchLabel="Войти"
    />
  );
}
