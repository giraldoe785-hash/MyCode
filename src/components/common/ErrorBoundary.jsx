import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { AlertTriangle, RefreshCw } from 'lucide-react';

function ErrorBoundaryFallback({ onReset }) {
  const { t } = useLanguage();

  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid var(--color-danger)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        maxWidth: '520px',
        width: '100%'
      }}>
        <AlertTriangle size={40} color="var(--color-danger)" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          {t('errorBoundary.title')}
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          {t('errorBoundary.description')}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={onReset}
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={14} />
            <span>{t('errorBoundary.reload')}</span>
          </button>
          <a href="/" className="btn btn-secondary btn-sm">
            {t('errorBoundary.home')}
          </a>
        </div>
      </div>
    </div>
  );
}

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return <ErrorBoundaryFallback onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}
