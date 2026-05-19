import { InputHTMLAttributes } from 'react';
import styles from './InputField.module.scss';

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  label: string;
};

export function InputField({ error, label, ...inputProps }: InputFieldProps) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <input className={styles.input} {...inputProps} />
      {error ? <span className={styles.error}>{error}</span> : null}
    </label>
  );
}
