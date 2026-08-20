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
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: compact ? '2px 8px' : '4px 12px',
          fontSize: '0.75rem',
          fontWeight: 700,
          borderRadius: 'var(--radius-full)',
          border: 'none',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
          backgroundColor: language === 'es' ? 'var(--accent-purple)' : 'transparent',
          color: language === 'es' ? '#FFFFFF' : 'var(--text-secondary)',
          boxShadow: language === 'es' ? '0 2px 8px var(--accent-purple-glow)' : 'none'
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
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: compact ? '2px 8px' : '4px 12px',
          fontSize: '0.75rem',
          fontWeight: 700,
          borderRadius: 'var(--radius-full)',
          border: 'none',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
          backgroundColor: language === 'en' ? 'var(--accent-purple)' : 'transparent',
          color: language === 'en' ? '#FFFFFF' : 'var(--text-secondary)',
          boxShadow: language === 'en' ? '0 2px 8px var(--accent-purple-glow)' : 'none'
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
