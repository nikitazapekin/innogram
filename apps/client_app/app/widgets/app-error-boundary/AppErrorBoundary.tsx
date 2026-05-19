'use client';

import { Component, type ReactNode } from 'react';
import { ErrorDialog } from '@/app/features/system-feedback';
import styles from './AppErrorBoundary.module.scss';

type AppErrorBoundaryProps = {
  children?: ReactNode;
  error?: Error & { digest?: string };
  reset?: () => void;
};

type AppErrorBoundaryState = {
  error?: Error & { digest?: string };
  hasError: boolean;
};

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: Boolean(this.props.error),
    error: this.props.error,
  };

  handleClose = () => {
    this.setState({ hasError: false, error: undefined });
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  render() {
    const { children } = this.props;
    const { error, hasError } = this.state;

    if (!hasError) {
      return children ?? null;
    }

    return (
      <section className={styles.screen}>
        <ErrorDialog error={error} onClose={this.handleClose} />
      </section>
    );
  }
}
