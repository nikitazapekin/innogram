import styles from './RequestLoader.module.scss';

type RequestLoaderProps = {
  description?: string;
  inline?: boolean;
  label?: string;
};

export function RequestLoader({
  description = 'Подождите, данные обрабатываются.',
  inline = false,
  label = 'Загрузка',
}: RequestLoaderProps) {
  return (
    <div className={inline ? styles.surface_inline : styles.surface}>
      <div className={inline ? styles.spinner_inline : styles.spinner} aria-hidden="true" />
      <div>
        <p className={inline ? styles.title_inline : styles.title}>{label}</p>
        {!inline ? <p className={styles.description}>{description}</p> : null}
      </div>
    </div>
  );
}
