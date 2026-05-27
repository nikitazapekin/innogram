import Image from 'next/image';
import styles from './Logo.module.scss';

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <Image
      className={`${styles.logo} ${className ?? ''}`}
      src="/Innowise.png"
      alt="Innogram"
      width={40}
      height={40}
    />
  );
}
