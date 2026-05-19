import styles from './Loader.module.scss';

type LoaderProps = {
  centered?: boolean;
  fullscreen?: boolean;
  label?: string;
};

export function Loader({ centered = false, fullscreen = false, label }: LoaderProps) {
  const loaderClassNames = [styles.loader];

  if (centered) {
    loaderClassNames.push(styles.loader_center);
  }

  if (fullscreen) {
    loaderClassNames.push(styles.loader_fullscreen);
  }

  const loaderClassName = loaderClassNames.join(' ');

  return (
    <div className={loaderClassName} aria-live="polite" aria-busy="true" role="status">
      <span className={styles.spinner} aria-hidden="true" />
      {label ? <span className={styles.text}>{label}</span> : null}
    </div>
  );
}
