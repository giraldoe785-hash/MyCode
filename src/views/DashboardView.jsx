import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { useVideoProgress } from '../context/VideoProgressContext';
import { useLiveStream } from '../context/LiveStreamContext';
import { useLanguage } from '../context/LanguageContext';
import { LiveBadge } from '../components/video/LiveBadge';
import { api } from '../services/api';
import {
  Zap,
  Play,
  Radio,
  Code2,
  Calendar,
  Flame,
  Award,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Tv,
  Star,
  Bookmark,
  Check,
  AlertCircle,
  FileCode,
  Activity,
  Trophy
} from 'lucide-react';
import { EJERCICIOS_DATA } from '../services/mockData';

export function DashboardView() {
  const { user } = useAuth();
  const { balance, transactions } = useWallet();
  const { getContinueWatchingList, getCourseProgress, courses, favorites, getFavoriteCoursesList } = useVideoProgress();
  const { activeStream, upcomingStreams } = useLiveStream();
  const { t, isSpanish } = useLanguage();

  const [achievements, setAchievements] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = user?.id || 'usr_101';

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [achs, subs] = await Promise.all([
          api.achievements.getAchievements(userId),
          api.submissions.getSubmissionsByStudent(userId)
        ]);
        setAchievements(achs || []);
        setSubmissions(subs || []);
      } catch (e) {
        console.error('Error loading dashboard data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [userId]);

  const continueWatching = getContinueWatchingList();

  const formatTxDescription = (desc) => {
    if (!desc) return '';
    if (desc.startsWith('Compilación de ')) {
      const filePart = desc.substring('Compilación de '.length);
      return isSpanish ? desc : `Compilation of ${filePart}`;
    }
    if (desc === 'Bono de bienvenida' || desc === 'Bono de Bienvenida') {
      return isSpanish ? desc : 'Welcome bonus';
    }
    if (desc.startsWith('Recarga mensual')) {
      return isSpanish ? desc : desc.replace('Recarga mensual', 'Monthly recharge');
    }
    return desc;
  };

  const formatTxType = (tipo) => {
    if (!tipo) return '';
    if (tipo.toLowerCase() === 'consumo' || tipo.toLowerCase() === 'consumo sandbox') {
      return isSpanish ? 'Consumo' : 'Usage';
    }
    if (tipo.toLowerCase() === 'recarga') {
      return isSpanish ? 'Recarga' : 'Recharge';
    }
    if (tipo.toLowerCase() === 'bono') {
      return isSpanish ? 'Bono' : 'Bonus';
    }
    return tipo;
  };

  const favoriteCourses = getFavoriteCoursesList();

  const maxTokens = user?.plan === 'Oro' ? 350 : user?.plan === 'Plata' ? 150 : 50;
  const tokenPercent = Math.min(100, Math.round((balance / maxTokens) * 100));
  const subscribedStreams = upcomingStreams.filter(s => s.recordatorioActivo);

  // Pending exercises: published exercises not yet submitted by student
  const submittedExerciseIds = submissions.map(s => s.exerciseId);
  const pendingExercises = EJERCICIOS_DATA.filter(e => !submittedExerciseIds.includes(e.id));

  // 7-day Streak Mock array
  const streakDays = [
    { label: 'L', name: 'Lun', completed: true },
    { label: 'M', name: 'Mar', completed: true },
    { label: 'X', name: 'Mié', completed: true },
    { label: 'J', name: 'Jue', completed: true },
    { label: 'V', name: 'Vie', completed: true },
    { label: 'S', name: 'Sáb', completed: true, isCurrent: true },
    { label: 'D', name: 'Dom', completed: false }
  ];

  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '4rem', minHeight: '85vh' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        {/* 1. Student Welcome Header Card */}
        <div
          className="welcome-card card"
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
            padding: '2rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <img
              src={user?.avatar || '/avatars/cyber_fox.svg'}
              alt={user?.nombre}
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--accent-purple)'
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                <span className="badge badge-purple">{user?.rol || 'Estudiante'}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {user?.nivel || 'Nivel 4'}
                </span>
              </div>
              <h1 className="heading-md" style={{ margin: 0 }}>
                {t('dashboard.greeting', { name: user?.nombre || 'Desarrollador' })}
              </h1>
              <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#F59E0B', fontWeight: 600 }}>
                  <Flame size={16} fill="#F59E0B" /> {user?.diasRacha || 6} {t('dashboard.streak_suffix')}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                  <Award size={16} /> {user?.experienciaXP || 1450} {t('dashboard.xp_suffix')}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {(user?.role === 'instructor' || user?.role === 'admin') && (
              <Link to="/instructor" className="btn btn-primary btn-sm" style={{ backgroundColor: 'var(--accent-purple)', borderColor: 'var(--accent-purple)' }}>
                <BookOpen size={16} /> Panel Instructor
              </Link>
            )}
            <Link to="/playground" className="btn btn-secondary btn-sm">
              <Code2 size={16} /> {t('dashboard.btn_sandbox')}
            </Link>
            <Link to="/courses" className="btn btn-primary btn-sm">
              <BookOpen size={16} /> {t('dashboard.btn_courses')}
            </Link>
          </div>
        </div>

        {/* 2. Key Metrics & Status Widgets */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* Token Balance Widget */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>{t('dashboard.card_tokens_title')}</span>
                <Link to="/wallet" style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', fontWeight: 600 }}>
                  {t('dashboard.details_link')} →
                </Link>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#F59E0B', lineHeight: 1 }}>
                  {balance}
                </span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ {maxTokens} tk</span>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-full)', margin: '0.85rem 0 0.4rem', overflow: 'hidden' }}>
                <div style={{ width: `${tokenPercent}%`, height: '100%', background: 'linear-gradient(90deg, #F59E0B, #10B981)', borderRadius: 'var(--radius-full)' }} />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {t('dashboard.tokens_available_desc', { pct: tokenPercent })}
              </div>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', marginTop: '1rem' }}>
              {t('dashboard.monthly_recharge_in')}
            </div>
          </div>

          {/* Active Streak Tracker Widget */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {isSpanish ? 'Racha de Actividad' : 'Activity Streak'}
                </span>
                <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  <Flame size={12} fill="#F59E0B" /> {user?.diasRacha || 6} {isSpanish ? 'días' : 'days'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.25rem', margin: '1rem 0 0.75rem' }}>
                {streakDays.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {d.label}
                    </span>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: d.completed ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-surface-secondary)',
                        border: d.isCurrent ? '2px solid #F59E0B' : d.completed ? '1.5px solid rgba(245, 158, 11, 0.5)' : '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: d.completed ? '#F59E0B' : 'var(--text-muted)',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}
                    >
                      {d.completed ? '✓' : '○'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#F59E0B', fontWeight: 600, borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={14} />
              <span>{isSpanish ? '¡Estudia hoy para mantener tu racha!' : 'Learn today to keep your streak!'}</span>
            </div>
          </div>

          {/* Active Plan Widget */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>{t('dashboard.card_plan_title')}</span>
                <span className="badge badge-cyan">{user?.plan || 'Bronce'}</span>
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.4rem' }}>
                {t('dashboard.plan_name_prefix')} {user?.plan || 'Bronce'}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {user?.plan === 'Oro' ? t('dashboard.plan_gold_desc') : t('dashboard.plan_upgrade_desc')}
              </p>
            </div>

            <Link to="/pricing" className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '1rem' }}>
              <Sparkles size={14} /> {t('dashboard.upgrade_sub_btn')}
            </Link>
          </div>
        </div>

        {/* 3. Continue Watching (Enrolled Courses & Progress) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
            <div>
              <h2 className="heading-md" style={{ margin: 0 }}>{t('dashboard.continue_title')}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {t('dashboard.continue_subtitle')}
              </p>
            </div>
            <Link to="/courses" style={{ fontSize: '0.85rem', color: 'var(--accent-purple)', fontWeight: 600 }}>
              {t('dashboard.see_all_link')} →
            </Link>
          </div>

          {continueWatching.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
              <Tv size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>
                {t('dashboard.no_continue_courses')}
              </p>
              <Link to="/courses" className="btn btn-primary btn-sm">
                {t('dashboard.explore_courses_btn')}
              </Link>
            </div>
          ) : (
            <div className="grid-3">
              {continueWatching.map(({ course, lastLesson, progressPercent }) => (
                <div key={course.id} className="card card-hover" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', width: '100%', height: '140px' }}>
                    <img
                      src={course.miniatura}
                      alt={isSpanish ? course.titulo : (course.tituloEn || course.titulo)}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
                      <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: 'var(--accent-purple)' }} />
                    </div>
                  </div>

                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                        {course.lenguaje} • {t('dashboard.progress_label')} {progressPercent}%
                      </div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.5rem', lineHeight: 1.3 }}>
                        {isSpanish ? course.titulo : (course.tituloEn || course.titulo)}
                      </h4>
                      {lastLesson && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Play size={12} fill="var(--text-muted)" />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {t('dashboard.lesson_prefix')} {lastLesson.titulo}
                          </span>
                        </div>
                      )}
                    </div>

                    <Link
                      to={`/courses/${course.id}/lesson/${lastLesson?.id || 'default'}`}
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: '1rem', width: '100%' }}
                    >
                      <span>{t('dashboard.resume_btn')}</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Pending Exercises & Coding Challenges */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
            <div>
              <h2 className="heading-md" style={{ margin: 0 }}>
                {isSpanish ? 'Ejercicios Pendientes' : 'Pending Coding Challenges'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {isSpanish ? 'Retos prácticos listos para programar y enviar al instructor.' : 'Practical challenges ready to solve and submit.'}
              </p>
            </div>
          </div>

          {pendingExercises.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={36} color="var(--color-success)" style={{ margin: '0 auto 0.75rem' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.25rem', color: 'var(--text-primary)' }}>
                {isSpanish ? '¡Todo al día!' : 'All caught up!'}
              </h4>
              <p style={{ fontSize: '0.85rem', margin: 0 }}>
                {isSpanish ? 'Has completado todos los ejercicios prácticos disponibles.' : 'You have completed all available practical exercises.'}
              </p>
            </div>
          ) : (
            <div className="grid-2">
              {pendingExercises.map(ex => (
                <div key={ex.id} className="card card-hover" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>{ex.lenguaje || 'Python'}</span>
                      <span className="badge" style={{ fontSize: '0.7rem', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
                        {isSpanish ? 'Pendiente' : 'Pending'}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.35rem' }}>
                      {isSpanish ? ex.titulo : (ex.tituloEn || ex.titulo)}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ex.enunciado}
                    </p>
                  </div>

                  <Link
                    to={`/exercises/${ex.id}`}
                    className="btn btn-primary btn-sm"
                    style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <Code2 size={14} />
                    <span>{isSpanish ? 'Resolver Reto' : 'Solve Challenge'}</span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5. My Favorites (Courses & Lessons) */}
        {favoriteCourses.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
              <div>
                <h2 className="heading-md" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Star size={20} fill="#F59E0B" color="#F59E0B" />
                  <span>{isSpanish ? 'Mis Favoritos' : 'My Favorites'}</span>
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {isSpanish ? 'Cursos que has guardado para consultar rápidamente.' : 'Courses you bookmarked for quick access.'}
                </p>
              </div>
            </div>

            <div className="grid-3">
              {favoriteCourses.map(course => (
                <div key={course.id} className="card card-hover" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <img
                    src={course.miniatura}
                    alt={course.titulo}
                    style={{ width: '100%', height: '130px', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                        {course.lenguaje} • {course.instructor}
                      </div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
                        {isSpanish ? course.titulo : (course.tituloEn || course.titulo)}
                      </h4>
                    </div>

                    <Link
                      to={`/courses/${course.id}`}
                      className="btn btn-secondary btn-sm"
                      style={{ marginTop: '0.75rem', width: '100%' }}
                    >
                      <span>{isSpanish ? 'Ver Curso' : 'View Course'}</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Achievements & Gamification Badges */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
            <div>
              <h2 className="heading-md" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy size={20} color="#F59E0B" />
                <span>{isSpanish ? 'Mis Logros y Medallas' : 'My Achievements & Badges'}</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {isSpanish ? 'Desbloquea recompensas completando retos, racha y lecciones.' : 'Unlock rewards by completing coding challenges, streaks and lessons.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className="card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  opacity: ach.unlocked ? 1 : 0.55,
                  border: ach.unlocked ? `1px solid ${ach.color || 'var(--accent-purple)'}` : '1px solid var(--border-subtle)',
                  background: ach.unlocked ? 'var(--bg-surface)' : 'var(--bg-surface-secondary)'
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    backgroundColor: ach.unlocked ? `${ach.color || '#8B5CF6'}20` : 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: ach.unlocked ? ach.color : 'var(--text-muted)',
                    flexShrink: 0
                  }}
                >
                  <Award size={22} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', marginBottom: '0.2rem' }}>
                    <strong style={{ fontSize: '0.9rem', color: ach.unlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {isSpanish ? ach.title : (ach.titleEn || ach.title)}
                    </strong>
                    {ach.unlocked && (
                      <span className="badge badge-purple" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                        {isSpanish ? 'Desbloqueado' : 'Unlocked'}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                    {isSpanish ? ach.desc : (ach.descEn || ach.desc)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Recent Activity Timeline */}
        <div>
          <h2 className="heading-md" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} color="var(--accent-cyan)" />
            <span>{isSpanish ? 'Actividad Reciente' : 'Recent Activity'}</span>
          </h2>

          <div className="card" style={{ padding: '0.5rem 1rem' }}>
            {(transactions && transactions.length > 0) ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {transactions.slice(0, 5).map((tx, idx) => (
                  <div
                    key={tx.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 0.5rem',
                      borderBottom: idx < 4 ? '1px solid var(--border-subtle)' : 'none',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: tx.cambio > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: tx.cambio > 0 ? 'var(--color-success)' : '#F59E0B',
                        flexShrink: 0
                      }}>
                        {tx.cambio > 0 ? <Zap size={16} /> : <Code2 size={16} />}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{formatTxDescription(tx.descripcion)}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.fecha} • {formatTxType(tx.tipo)}</div>
                      </div>
                    </div>

                    <span style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: tx.cambio > 0 ? 'var(--color-success)' : 'var(--text-primary)',
                      flexShrink: 0
                    }}>
                      {tx.cambio > 0 ? `+${tx.cambio}` : tx.cambio} tk
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {isSpanish ? 'No hay actividad registrada recientemente.' : 'No recent activity recorded.'}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
