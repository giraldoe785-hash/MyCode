import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Terminal, Shield, Zap, Radio, Heart } from 'lucide-react';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer style={{
      backgroundColor: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-subtle)',
      paddingTop: '3.5rem',
      paddingBottom: '2.5rem',
      marginTop: 'auto'
    }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {/* Top Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem'
        }}>
          {/* Brand Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF'
              }}>
                <Terminal size={18} />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>MyCode Pro</span>
            </Link>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {t('footer.description')}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <span className="token-pill" style={{ fontSize: '0.75rem' }}>
                <Zap size={12} fill="#F59E0B" /> {t('footer.token_economy')}
              </span>
              <span className="badge badge-live" style={{ fontSize: '0.7rem' }}>
                <Radio size={12} /> {t('footer.live_streams')}
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('footer.explore_title')}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <li><Link to="/courses" className="btn-ghost" style={{ padding: 0 }}>{t('footer.catalog_link')}</Link></li>
              <li><Link to="/live" className="btn-ghost" style={{ padding: 0 }}>{t('footer.live_link')}</Link></li>
              <li><Link to="/playground" className="btn-ghost" style={{ padding: 0 }}>{t('footer.sandbox_link')}</Link></li>
              <li><Link to="/pricing" className="btn-ghost" style={{ padding: 0 }}>{t('footer.pricing_link')}</Link></li>
              <li><Link to="/wallet" className="btn-ghost" style={{ padding: 0 }}>{t('footer.wallet_link')}</Link></li>
            </ul>
          </div>

          {/* Supported Technologies */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('footer.stacks_title')}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <li>Java 21 LTS & Spring Boot 3</li>
              <li>Python 3.12 & Machine Learning</li>
              <li>React 19 & Next.js 15</li>
              <li>C++20 & Estructuras de Datos</li>
              <li>PostgreSQL & Microservicios</li>
            </ul>
          </div>

          {/* Platform Trust */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('footer.support_title')}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Shield size={14} color="var(--color-success)" />
                <span>{t('footer.secure_tx')}</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Radio size={14} color="var(--accent-cyan)" />
                <span>{t('footer.auto_vod')}</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Zap size={14} color="#F59E0B" />
                <span>{t('footer.welcome_bonus')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            © {new Date().getFullYear()} {t('footer.copyright')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>{t('footer.built_with')}</span>
            <Heart size={13} color="var(--color-live)" fill="var(--color-live)" />
          </div>
        </div>
      </div>
    </footer>
  );
}