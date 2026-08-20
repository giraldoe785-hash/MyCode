import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Terminal, Home, ArrowLeft, ShieldAlert } from 'lucide-react';

export function NotFoundView() {
  const { isSpanish } = useLanguage();

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        textAlign: 'center'
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '3rem 2rem',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem'
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '20px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#EF4444'
          }}
        >
          <ShieldAlert size={36} />
        </div>

        <div>
          <div
            style={{
              fontSize: '4rem',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              background: 'linear-gradient(135deg, #EF4444, #F59E0B)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: 'var(--font-mono)'
            }}
          >
            404
          </div>
          <h1 className="heading-md" style={{ margin: '0.5rem 0' }}>
            {isSpanish ? 'Página no encontrada' : 'Page Not Found'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
            {isSpanish
              ? 'La ruta a la que intentas acceder no existe, ha sido movida o no tienes permisos para visualizarla.'
              : 'The route you are trying to access does not exist, has been moved, or you lack permissions.'}
          </p>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-surface-secondary)',
            border: '1px solid var(--border-subtle)',
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: 'var(--accent-cyan)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Terminal size={14} />
          <span>Error 404: HTTP_NOT_FOUND (ERR_INVALID_ROUTE)</span>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Home size={16} />
            <span>{isSpanish ? 'Volver al Inicio' : 'Back to Home'}</span>
          </Link>
          <Link to="/courses" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={16} />
            <span>{isSpanish ? 'Ver Cursos' : 'Browse Courses'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}