import { AuthForm } from '../features/auth';

export default function LoginPage() {
  return (
    <AuthForm
      description="Авторизация"
      submitLabel="Войти"
      switchHref="/register"
      switchLabel="Зарегистрироваться"
      withProvider
    />
  );
}
