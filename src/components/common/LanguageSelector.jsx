import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export function LanguageSelector({ compact = false, className = '' }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`lang-selector-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: 'var(--bg-surface-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-full)',
        padding: '2px',
        userSelect: 'none',
        flexShrink: 0
      }}
      role="group"
      aria-label="Selector de idioma / Language selector"
    >
      <button
        type="button"
        onClick={() => setLanguage('es')}
        className={`lang-btn ${language === 'es' ? 'active' : ''}`}
        style={{
          padding: compact ? '2px 8px' : '4px 12px'
        }}
        title="Cambiar a Español"
        aria-pressed={language === 'es'}
      >
        <span style={{ fontSize: '0.85rem', lineHeight: 1 }}>🇪🇸</span>
        <span>ES</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`lang-btn ${language === 'en' ? 'active' : ''}`}
        style={{
          padding: compact ? '2px 8px' : '4px 12px'
        }}
        title="Switch to English"
        aria-pressed={language === 'en'}
      >
        <span style={{ fontSize: '0.85rem', lineHeight: 1 }}>🇺🇸</span>
        <span>EN</span>
      </button>
    </div>
  );
}
