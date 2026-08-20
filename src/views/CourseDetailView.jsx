import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useVideoProgress } from '../context/VideoProgressContext';
import { EJERCICIOS_DATA } from '../services/mockData';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { VideoPlayer } from '../components/video/VideoPlayer';
import { Modal } from '../components/common/Modal';
import {
  Play,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  BookOpen,
  Users,
  Star,
  Award,
  Zap,
  ChevronDown,
  ChevronUp,
  FileText,
  ShieldCheck
} from 'lucide-react';

export function CourseDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { courses, unlockCourse, getCourseProgress, toggleFavoriteCourse, isFavoriteCourse } = useVideoProgress();
  const { balance, deductTokens } = useWallet();
  const { t, isSpanish } = useLanguage();

  const [confirmUnlockOpen, setConfirmUnlockOpen] = useState(false);
  const [openSections, setOpenSections] = useState({ 'sec-1': true, 'sec-p1': true, 'sec-r1': true, 'sec-c1': true });
  const [isProcessing, setIsProcessing] = useState(false);

  const course = courses.find(c => c.id === id) || courses[0];

  if (!course) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2>Curso no encontrado</h2>
        <Link to="/courses" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const toggleSection = (secId) => {
    setOpenSections(prev => ({ ...prev, [secId]: !prev[secId] }));
  };

  const handleConfirmUnlock = async () => {
    if (balance < course.costoTokens) return;
    setIsProcessing(true);
    const success = deductTokens(course.costoTokens, `Desbloqueo de curso completo: ${isSpanish ? course.titulo : (course.tituloEn || course.titulo)}`);
    if (success) {
      await unlockCourse(course.id);
      setIsProcessing(false);
      setConfirmUnlockOpen(false);
      navigate(`/courses/${course.id}/lesson/${course.secciones[0]?.lecciones[0]?.id || '1'}`);
    } else {
      setIsProcessing(false);
    }
  };

  const firstLessonId = course.secciones[0]?.lecciones[0]?.id || '1';

  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

        {course.estado === 'despublicado' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.85rem 1.25rem',
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: 'var(--radius-md)',
            color: '#F59E0B',
            fontSize: '0.875rem'
          }}>
            <ShieldCheck size={20} style={{ flexShrink: 0 }} />
            <span>
              <strong>Aviso de Disponibilidad:</strong> Este curso ha sido despublicado para nuevas inscripciones. Como estudiante inscrito, mantienes acceso permanente a tus lecciones y progreso.
            </span>
          </div>
        )}

        {/* Top Split: Trailer & Course Overview + Buy/Access Card */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: '2rem',
          alignItems: 'start'
        }} className="course-detail-layout">
          {/* Left Column: Trailer & Metadata */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header info */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-purple">{course.lenguaje}</span>
                <span className="badge badge-cyan">{course.nivel}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#F59E0B', fontSize: '0.85rem', fontWeight: 700 }}>
                  <Star size={14} fill="#F59E0B" /> {course.valoracion}
                </span>
              </div>

              <h1 className="heading-lg" style={{ margin: '0.25rem 0' }}>
                {isSpanish ? course.titulo : (course.tituloEn || course.titulo)}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.5 }}>
                {isSpanish ? course.subtitulo : (course.subtituloEn || course.subtitulo)}
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={async () => {
                    await toggleFavoriteCourse(course.id);
                  }}
                  className="btn btn-ghost btn-sm"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: isFavoriteCourse(course.id) ? '#F59E0B' : 'var(--text-secondary)'
                  }}
                >
                  <Star size={16} fill={isFavoriteCourse(course.id) ? '#F59E0B' : 'transparent'} />
                  <span>{isFavoriteCourse(course.id) ? (isSpanish ? 'Curso en Favoritos' : 'Saved in Favorites') : (isSpanish ? 'Guardar curso' : 'Save course')}</span>
                </button>
              </div>

            </div>

            {/* Trailer Video Player */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                {t('course_detail.trailer_title')}
              </div>
              <VideoPlayer
                src={course.trailerUrl}
                title={`Trailer: ${isSpanish ? course.titulo : (course.tituloEn || course.titulo)}`}
                autoPlay={false}
              />
            </div>
          </div>

          {/* Right Column: Sticky Token Purchase & Access Card */}
          <div className="card" style={{ position: 'sticky', top: '5.5rem', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('course_detail.cost_label')}</span>
              <span className="token-pill" style={{ fontSize: '1.1rem' }}>
                <Zap size={16} fill="#F59E0B" /> {course.costoTokens} tk
              </span>
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface-secondary)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>{t('course_detail.your_balance')}</span>
              <strong style={{ marginLeft: '0.35rem', color: '#F59E0B' }}>{balance} tokens</strong>
            </div>

            {course.desbloqueado ? (
              <Link
                to={`/courses/${course.id}/lesson/${firstLessonId}`}
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
              >
                <Play size={18} fill="#FFF" />
                <span>{t('course_detail.continue_watching')}</span>
              </Link>
            ) : (
              <button
                onClick={() => setConfirmUnlockOpen(true)}
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
              >
                <Unlock size={18} />
                <span>{t('course_detail.unlock_course_btn')} ({course.costoTokens} tk)</span>
              </button>
            )}

            {/* Course Features Quick List */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={14} /> {t('course_detail.total_duration')}
                </span>
                <strong>{course.duracionTotal}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <BookOpen size={14} /> {t('course_detail.lessons_label')}
                </span>
                <strong>{course.totalLecciones} videos</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Users size={14} /> {t('course_detail.students_enrolled')}
                </span>
                <strong>{course.estudiantes}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Award size={14} /> {t('course_detail.certificate')}
                </span>
                <strong style={{ color: 'var(--color-success)' }}>{t('course_detail.included')}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Syllabus / Modules Accordion */}
        <div style={{ maxWidth: '850px' }}>
          <h2 className="heading-md" style={{ marginBottom: '1.25rem' }}>
            {t('course_detail.modules_title')}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {course.secciones.map((sec) => (
              <div key={sec.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <button
                  onClick={() => toggleSection(sec.id)}
                  style={{
                    width: '100%',
                    padding: '1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'var(--bg-surface-secondary)',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{sec.titulo}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {sec.lecciones.length} {t('course_detail.videos_count')}
                    </span>
                    {openSections[sec.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                {openSections[sec.id] && (
                  <div style={{ padding: '0.5rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {sec.lecciones.map((les) => (
                      <div
                        key={les.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.75rem',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <Play size={16} color="var(--accent-purple)" />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{les.titulo}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{les.duracionFormato}</div>
                          </div>
                        </div>

                        {les.bloqueada && !course.desbloqueado ? (
                          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}>
                            <Lock size={14} /> 5 tk
                          </span>
                        ) : (
                          <Link
                            to={`/courses/${course.id}/lesson/${les.id}`}
                            className="btn btn-secondary btn-sm"
                          >
                            Ver Lección
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Prerequisites & Instructor Bio */}
        <div className="grid-2" style={{ maxWidth: '850px' }}>
          <div className="card">
            <h3 className="heading-sm" style={{ marginBottom: '0.75rem' }}>{t('course_detail.prerequisites_title')}</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {course.prerrequisitos.map((req, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={16} color="var(--accent-cyan)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h3 className="heading-sm" style={{ marginBottom: '0.75rem' }}>{t('course_detail.instructor_title')}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <img src={course.instructorAvatar} alt={course.instructor} style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
              <div>
                <div style={{ fontWeight: 700 }}>{course.instructor}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Staff Software Engineer</div>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {course.instructorBio}
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Unlock Modal */}
      {confirmUnlockOpen && (
        <Modal
          isOpen={true}
          onClose={() => setConfirmUnlockOpen(false)}
          title={t('course_detail.modal_title')}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              {t('course_detail.modal_desc', { title: isSpanish ? course.titulo : (course.tituloEn || course.titulo) })}
            </p>

            <div style={{
              backgroundColor: 'var(--bg-surface-secondary)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('course_detail.modal_cost')}</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F59E0B' }}>
                  {course.costoTokens} tokens
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('course_detail.modal_remaining')}</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  {balance - course.costoTokens} tokens
                </div>
              </div>
            </div>

            {balance < course.costoTokens && (
              <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem' }}>
                {t('course_detail.modal_insufficient')}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmUnlockOpen(false)} className="btn btn-secondary">
                {t('course_detail.cancel_btn')}
              </button>
              <button
                onClick={handleConfirmUnlock}
                disabled={balance < course.costoTokens || isProcessing}
                className="btn btn-primary"
              >
                {isProcessing ? t('course_detail.processing') : t('course_detail.confirm_btn')}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <style>{`
        @media (max-width: 900px) {
          .course-detail-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}