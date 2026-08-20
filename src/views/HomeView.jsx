import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { useLanguage } from '../context/LanguageContext';
import { LiveBadge } from '../components/video/LiveBadge';
import { SyntaxShowdown } from '../components/code/SyntaxShowdown';
import {
  Play,
  Radio,
  Code2,
  Sparkles,
  Zap,
  CheckCircle2,
  TrendingUp,
  Award,
  Users,
  Clock,
  ArrowRight,
  ShieldCheck,
  Star
} from 'lucide-react';
import { COURSES_DATA, LIVE_STREAMS, PLANS_DATA } from '../services/mockData';

export function HomeView() {
  const { isAuthenticated } = useAuth();
  const { balance } = useWallet();
  const { t, isSpanish } = useLanguage();

  const featuredCourses = COURSES_DATA.slice(0, 3);
  const activeStream = LIVE_STREAMS.active;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', paddingBottom: '4rem' }}>
      {/* 1. Hero Section */}
      <section style={{
        position: 'relative',
        paddingTop: '3.5rem',
        paddingBottom: '2.5rem',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '880px' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.9rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: 'var(--accent-purple)',
            fontSize: '0.8125rem',
            fontWeight: 700,
            marginBottom: '1.25rem'
          }}>
            <Sparkles size={14} />
            <span>{t('hero.badge')}</span>
          </div>

          {/* Main Title */}
          <h1 className="heading-xl" style={{ marginBottom: '1.25rem' }}>
            {t('hero.title_1')}{' '}
            <span className="text-gradient">{t('hero.title_gradient')}</span>{' '}
            {t('hero.title_2')}{' '}
            <span className="text-gradient-cyan">{t('hero.title_live')}</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '1.125rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '2rem',
            maxWidth: '740px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            {t('hero.subtitle')}
          </p>

          {/* Call to Actions */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/courses" className="btn btn-primary btn-lg">
              <Play size={18} fill="#FFFFFF" />
              <span>{t('hero.cta_courses')}</span>
            </Link>
            <Link to="/live" className="btn btn-live btn-lg">
              <Radio size={18} />
              <span>{t('hero.cta_live')}</span>
            </Link>
            <Link to="/playground" className="btn btn-secondary btn-lg">
              <Code2 size={18} />
              <span>{t('hero.cta_sandbox')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Active Live Stream Banner Highlight */}
      {activeStream && (
        <section className="container">
          <div style={{
            background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)',
            border: '1px solid rgba(220, 38, 38, 0.35)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
            boxShadow: '0 0 25px rgba(220, 38, 38, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1, minWidth: '280px' }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={activeStream.instructorAvatar}
                  alt={activeStream.instructor}
                  style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-live)' }}
                />
                <span style={{ position: 'absolute', bottom: -2, right: -2 }}>
                  <LiveBadge isMini />
                </span>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                  <LiveBadge text={t('live_banner.badge')} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    • {activeStream.espectadoresSimulados} {t('live_banner.viewers_suffix')}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  {isSpanish ? activeStream.titulo : (activeStream.tituloEn || activeStream.titulo)}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
                  {t('live_banner.instructor_prefix')} {activeStream.instructor}
                </p>
              </div>
            </div>

            <Link to="/live" className="btn btn-live">
              <Radio size={16} />
              <span>{t('live_banner.cta')}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* 3. Syntax Showdown Python vs Java Interactive Section */}
      <section className="container">
        <SyntaxShowdown />
      </section>

      {/* 4. Featured Courses Grid */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ color: 'var(--accent-purple)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('home.featured_badge')}
            </div>
            <h2 className="heading-lg" style={{ margin: '0.25rem 0' }}>{t('home.featured_title')}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              {t('home.featured_subtitle')}
            </p>
          </div>

          <Link to="/courses" className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-purple)', fontWeight: 600 }}>
            <span>{t('home.see_all_courses')}</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid-3">
          {featuredCourses.map((course) => (
            <div key={course.id} className="card card-hover" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* Thumbnail & Badges */}
              <div style={{ position: 'relative', width: '100%', height: '170px', overflow: 'hidden' }}>
                <img
                  src={course.miniatura}
                  alt={isSpanish ? course.titulo : (course.tituloEn || course.titulo)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span style={{
                  position: 'absolute',
                  top: '0.75rem',
                  left: '0.75rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  backdropFilter: 'blur(4px)',
                  color: '#FFFFFF',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px'
                }}>
                  {course.lenguaje}
                </span>
                <span className="token-pill" style={{ position: 'absolute', bottom: '0.75rem', right: '0.75rem', fontSize: '0.75rem' }}>
                  <Zap size={12} fill="#F59E0B" /> {course.costoTokens} tk
                </span>
              </div>

              {/* Body */}
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>{course.nivel}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#F59E0B', fontWeight: 700 }}>
                      <Star size={13} fill="#F59E0B" /> {course.valoracion}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '0.5rem' }}>
                    {isSpanish ? course.titulo : (course.tituloEn || course.titulo)}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '1rem' }}>
                    {isSpanish ? course.subtitulo : (course.subtituloEn || course.subtitulo)}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img src={course.instructorAvatar} alt={course.instructor} style={{ width: '26px', height: '26px', borderRadius: '50%' }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{course.instructor}</span>
                  </div>

                  <Link to={`/courses/${course.id}`} className="btn btn-primary btn-sm">
                    <span>Ver Curso</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Metrics & Community Proof */}
      <section style={{ backgroundColor: 'var(--bg-surface-secondary)', padding: '3.5rem 0' }}>
        <div className="container">
          <div className="grid-4" style={{ textAlign: 'center' }}>
            <div className="card" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-purple)', lineHeight: 1 }}>
                250+
              </div>
              <div style={{ fontWeight: 600, marginTop: '0.5rem' }}>{t('home.stats_hours')}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('home.stats_hours_sub')}</div>
            </div>

            <div className="card" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-live)', lineHeight: 1 }}>
                120+
              </div>
              <div style={{ fontWeight: 600, marginTop: '0.5rem' }}>{t('home.stats_streams')}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('home.stats_streams_sub')}</div>
            </div>

            <div className="card" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-cyan)', lineHeight: 1 }}>
                14,500+
              </div>
              <div style={{ fontWeight: 600, marginTop: '0.5rem' }}>{t('home.stats_students')}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('home.stats_students_sub')}</div>
            </div>

            <div className="card" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#F59E0B', lineHeight: 1 }}>
                4.92 / 5
              </div>
              <div style={{ fontWeight: 600, marginTop: '0.5rem' }}>{t('home.stats_rating')}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('home.stats_rating_sub')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Pricing Preview Section with New Metallic Cards */}
      <section className="container">
        <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 2.5rem' }}>
          <div style={{ color: 'var(--accent-purple)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('home.pricing_badge')}
          </div>
          <h2 className="heading-lg" style={{ margin: '0.25rem 0' }}>{t('home.pricing_title')}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {t('home.pricing_subtitle')}
          </p>
        </div>

        <div className="grid-3">
          {PLANS_DATA.map((plan) => {
            const cardClass = plan.themeClass || (
              plan.id === 'bronce' ? 'plan-card-bronze' :
              plan.id === 'plata' ? 'plan-card-silver' : 'plan-card-gold'
            );
            const features = isSpanish ? plan.caracteristicas : (plan.caracteristicasEn || plan.caracteristicas);

            return (
              <div
                key={plan.id}
                className={`card ${cardClass}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '2rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: plan.colorAccent }}>
                      {plan.nombre}
                    </h3>
                    <span className="token-pill" style={{ fontSize: '0.75rem' }}>
                      <Zap size={12} fill="#F59E0B" /> {plan.tokensMensuales} tk/mes
                    </span>
                  </div>

                  <div style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                    ${plan.precioMensual.toFixed(2)}{' '}
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>USD/mes</span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                    {isSpanish ? plan.descripcion : (plan.descripcionEn || plan.descripcion)}
                  </p>

                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {features.slice(0, 3).map((feat, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <CheckCircle2 size={14} color="var(--color-success)" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link to="/pricing" className={`btn ${plan.destacado ? 'btn-primary' : 'btn-secondary'}`} style={{ width: '100%' }}>
                  <span>{t('pricing.choose_plan_btn', { name: plan.nombre })}</span>
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}