import { AuthForm } from '../components/auth/AuthForm';

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
