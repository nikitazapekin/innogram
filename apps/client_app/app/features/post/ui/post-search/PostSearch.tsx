import styles from './PostSearch.module.scss';

export function PostSearch() {
  return (
    <div className={styles.search}>
      <input className={styles.input} placeholder="Поиск постов..." type="text" />
    </div>
  );
}
