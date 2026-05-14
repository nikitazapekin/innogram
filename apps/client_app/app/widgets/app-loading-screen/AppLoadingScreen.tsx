import { RequestLoader } from '@/app/features/system-feedback';
import styles from './AppLoadingScreen.module.scss';

type AppLoadingScreenProps = {
  description?: string;
  label?: string;
};

export function AppLoadingScreen({
  description = 'Загружаем данные и подготавливаем интерфейс.',
  label = 'Загрузка',
}: AppLoadingScreenProps) {
  return (
    <section className={styles.screen}>
      <RequestLoader description={description} label={label} />
    </section>
  );
}
