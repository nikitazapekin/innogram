import Link from 'next/link';
import { Logo } from '@/app/shared/ui/logo';
import styles from './Header.module.scss';

const navItems = [
  { label: 'Профиль', href: '/profile' },
  { label: 'Уведомления', href: '/notifications' },
  { label: 'Посты', href: '/posts' },
  { label: 'Подписки', href: '/subscriptions' },
  { label: 'Чат', href: '/chat' },
];

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logoLink}>
          <Logo />
        </Link>
        <nav className={styles.nav}>
          {navItems.map(({ label, href }) => (
            <Link key={href} href={href} className={styles.link}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
