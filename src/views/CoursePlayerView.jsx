import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useVideoProgress } from '../context/VideoProgressContext';
import { useWallet } from '../context/WalletContext';
import { useLanguage } from '../context/LanguageContext';
import { VideoPlayer } from '../components/video/VideoPlayer';
import { LessonPlaylist } from '../components/video/LessonPlaylist';
import { Modal } from '../components/common/Modal';
import {
  ChevronLeft,
  BookOpen,
  FileText,
  MessageSquare,
  Download,
  Share2,
  CheckCircle2,
  Check,
  ChevronRight,
  Sparkles,
  Lock,
  Zap,
  Star,
  Bookmark,
  Code2
} from 'lucide-react';
import { EJERCICIOS_DATA } from '../services/mockData';

export function CoursePlayerView() {
  const { id: courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const {
    courses,
    progressMap,
    saveProgress,
    markLessonComplete,
    toggleLessonComplete,
    getCourseProgress,
    unlockLesson,
    toggleFavoriteCourse,
    isFavoriteCourse,
    toggleFavoriteLesson,
    isFavoriteLesson
  } = useVideoProgress();
  const { balance, deductTokens, addToast } = useWallet();
  const { t, isSpanish } = useLanguage();

  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'resources' | 'discussion'
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState([
    { id: 1, autor: 'Lucas Silva', avatar: '/avatars/cyber_fox.svg', tiempo: 'Hace 2 horas', texto: '¿La anotación @RestControllerAdvice intercepta excepciones lanzadas en filtros de Spring Security?' },
    { id: 2, autor: 'Carlos Mendoza (Instructor)', avatar: '/avatars/cyber_wolf.svg', tiempo: 'Hace 45 min', texto: '¡Excelente pregunta Lucas! Para interceptar excepciones de filtros debes redirigirlas al HandlerExceptionResolver usando un AuthenticationEntryPoint.' }
  ]);

  const [showUnlockLessonModal, setShowUnlockLessonModal] = useState(false);
  const [lessonToUnlock, setLessonToUnlock] = useState(null);

  const course = courses.find(c => c.id === courseId) || courses[0];

  // Find all lessons flattened
  const allLessons = course?.secciones?.flatMap(s => s.lecciones) || [];
  const currentLessonIndex = allLessons.findIndex(l => l.id === lessonId);
  const currentLesson = allLessons[currentLessonIndex >= 0 ? currentLessonIndex : 0] || allLessons[0];

  const nextLesson = allLessons[currentLessonIndex + 1] || null;
  const prevLesson = allLessons[currentLessonIndex - 1] || null;

  // Find attached exercise
  const relatedExercise = EJERCICIOS_DATA.find(e => e.courseId === course?.id || e.cursoId === course?.id) || EJERCICIOS_DATA[0];

  const isCurrentCompleted = progressMap[currentLesson?.id]?.completed || currentLesson?.completada;
  const isCourseFav = course ? isFavoriteCourse(course.id) : false;
  const isLessonFav = currentLesson ? isFavoriteLesson(currentLesson.id) : false;

  // Handle lesson selection from playlist
  const handleSelectLesson = (selectedId) => {
    const target = allLessons.find(l => l.id === selectedId);
    if (target?.bloqueada && !course.desbloqueado) {
      setLessonToUnlock(target);
      setShowUnlockLessonModal(true);
      return;
    }
    navigate(`/courses/${course.id}/lesson/${selectedId}`);
  };

  const handleConfirmUnlockLesson = () => {
    if (!lessonToUnlock) return;
    if (balance < 5) return;
    const success = deductTokens(5, `Desbloqueo de lección: ${lessonToUnlock.titulo}`);
    if (success) {
      unlockLesson(course.id, lessonToUnlock.id);
      setShowUnlockLessonModal(false);
      navigate(`/courses/${course.id}/lesson/${lessonToUnlock.id}`);
      setLessonToUnlock(null);
    }
  };

  const handleToggleComplete = async () => {
    if (!course || !currentLesson) return;
    const nowCompleted = await toggleLessonComplete(course.id, currentLesson.id);
    addToast(
      nowCompleted 
        ? (isSpanish ? '✓ ¡Lección marcada como completada!' : '✓ Lesson marked as complete!')
        : (isSpanish ? 'Lección desmarcada' : 'Lesson unmarked'),
      'success'
    );
  };

  const handleToggleFavCourse = async () => {
    if (!course) return;
    const fav = await toggleFavoriteCourse(course.id);
    addToast(
      fav 
        ? (isSpanish ? '⭐ Curso guardado en tus favoritos' : '⭐ Course saved to your favorites')
        : (isSpanish ? 'Curso removido de favoritos' : 'Course removed from favorites'),
      'info'
    );
  };

  const handleToggleFavLesson = async () => {
    if (!currentLesson) return;
    const fav = await toggleFavoriteLesson(currentLesson.id);
    addToast(
      fav 
        ? (isSpanish ? '🔖 Lección guardada en tus favoritos' : '🔖 Lesson saved to your favorites')
        : (isSpanish ? 'Lección removida de favoritos' : 'Lesson removed from favorites'),
      'info'
    );
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setComments(prev => [
      {
        id: Date.now(),
        autor: 'Tú',
        avatar: '/avatars/cyber_fox.svg',
        tiempo: 'Ahora mismo',
        texto: commentInput.trim()
      },
      ...prev
    ]);
    setCommentInput('');
  };

  if (!course || !currentLesson) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2>Cargando lección audiovisual...</h2>
      </div>
    );
  }

  const courseStats = getCourseProgress(course);
  const courseProgPercent = courseStats.percentage;

  return (
    <div style={{ paddingTop: '1rem', paddingBottom: '4rem' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Breadcrumb & Navigation Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <Link
            to={`/courses/${course.id}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}
          >
            <ChevronLeft size={16} />
            <span>{t('player.back_to_info')}: <strong>{isSpanish ? course.titulo : (course.tituloEn || course.titulo)}</strong></span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>{t('player.course_progress')}</span>
            <strong style={{ color: 'var(--accent-purple)' }}>{courseProgPercent}%</strong>
            <div style={{ width: '80px', height: '6px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{ width: `${courseProgPercent}%`, height: '100%', backgroundColor: 'var(--accent-purple)' }} />
            </div>
          </div>
        </div>

        {/* Cinema Layout: Video Player + Playlist Sidebar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: '1.5rem',
          alignItems: 'start'
        }} className="course-player-grid">
          {/* Main Column: Video Player & Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Custom Video Player with Auto-save & Auto-next */}
            <VideoPlayer
              key={currentLesson.id}
              src={currentLesson.videoUrl}
              title={`${course.titulo} - ${currentLesson.titulo}`}
              initialTime={currentLesson.progresoSegundos || 0}
              onProgress={(currentTime, duration) => {
                saveProgress(course.id, currentLesson.id, currentTime);
              }}
              onEnded={() => {
                markLessonComplete(course.id, currentLesson.id);
              }}
              nextLessonTitle={nextLesson ? nextLesson.titulo : null}
              onNextLesson={() => {
                if (nextLesson) {
                  handleSelectLesson(nextLesson.id);
                }
              }}
            />

            {/* Action Bar: Mark Complete, Favorites & Navigation */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)'
            }}>
              {/* Left Action: Toggle Complete & Favorites */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleToggleComplete}
                  className={`btn btn-sm ${isCurrentCompleted ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    backgroundColor: isCurrentCompleted ? 'var(--color-success)' : undefined,
                    borderColor: isCurrentCompleted ? 'var(--color-success)' : undefined
                  }}
                  title={isSpanish ? 'Marcar o desmarcar lección como completada' : 'Toggle lesson completion'}
                >
                  <CheckCircle2 size={16} />
                  <span>{isCurrentCompleted ? (isSpanish ? 'Completada ✓' : 'Completed ✓') : (isSpanish ? 'Marcar completado' : 'Mark as complete')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleFavCourse}
                  className="btn btn-ghost btn-sm"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    color: isCourseFav ? '#F59E0B' : 'var(--text-secondary)'
                  }}
                  title={isSpanish ? 'Guardar curso en favoritos' : 'Save course to favorites'}
                >
                  <Star size={15} fill={isCourseFav ? '#F59E0B' : 'transparent'} />
                  <span>{isCourseFav ? (isSpanish ? 'Curso Guardado' : 'Course Saved') : (isSpanish ? 'Guardar curso' : 'Save course')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleFavLesson}
                  className="btn btn-ghost btn-sm"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    color: isLessonFav ? 'var(--accent-cyan)' : 'var(--text-secondary)'
                  }}
                  title={isSpanish ? 'Guardar lección en favoritos' : 'Save lesson to favorites'}
                >
                  <Bookmark size={15} fill={isLessonFav ? 'var(--accent-cyan)' : 'transparent'} />
                  <span>{isLessonFav ? (isSpanish ? 'Lección Guardada' : 'Lesson Saved') : (isSpanish ? 'Guardar lección' : 'Save lesson')}</span>
                </button>

                {relatedExercise && (
                  <Link
                    to={`/exercises/${relatedExercise.id}`}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-purple)' }}
                    title={isSpanish ? 'Ir al reto práctico en código de este tema' : 'Open coding challenge'}
                  >
                    <Code2 size={15} />
                    <span>{isSpanish ? 'Reto Práctico' : 'Coding Challenge'}</span>
                  </Link>
                )}
              </div>

              {/* Right Action: Prev / Next Lesson Navigation */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  disabled={!prevLesson}
                  onClick={() => prevLesson && handleSelectLesson(prevLesson.id)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <ChevronLeft size={16} />
                  <span>{t('player.previous_btn')}</span>
                </button>

                <button
                  type="button"
                  disabled={!nextLesson}
                  onClick={() => nextLesson && handleSelectLesson(nextLesson.id)}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <span>{t('player.next_btn')}</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Content Tabs (Notes, Resources, Comments) */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('notes')}
                  className={`btn-sm ${activeTab === 'notes' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <BookOpen size={15} /> {t('player.notes_tab')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('resources')}
                  className={`btn-sm ${activeTab === 'resources' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <FileText size={15} /> {t('player.resources_tab')} ({currentLesson.recursos?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('discussion')}
                  className={`btn-sm ${activeTab === 'discussion' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <MessageSquare size={15} /> {t('player.comments_tab')} ({comments.length})
                </button>
              </div>

              {/* Tab 1: Lesson Notes & Code Snippet */}
              {activeTab === 'notes' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                      {t('player.notes_title')}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                      {currentLesson.resumen}
                    </p>
                  </div>

                  {currentLesson.codigoMuestra && (
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                        {t('player.code_snippet_title')}
                      </div>
                      <pre style={{
                        backgroundColor: 'var(--bg-main)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.85rem',
                        color: '#A5B4FC',
                        overflowX: 'auto',
                        lineHeight: 1.5
                      }}>
                        <code>{currentLesson.codigoMuestra}</code>
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Downloadable Resources */}
              {activeTab === 'resources' && (
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>
                    {t('player.resources_title')}
                  </h3>

                  {(!currentLesson.recursos || currentLesson.recursos.length === 0) ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      No hay archivos adjuntos para esta lección.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {currentLesson.recursos.map((rec, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.75rem 1rem',
                            backgroundColor: 'var(--bg-surface-secondary)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-subtle)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <FileText size={16} color="var(--accent-purple)" />
                            <div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{rec.nombre}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rec.tamano}</div>
                            </div>
                          </div>
                          <a
                            href={rec.url}
                            download
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <Download size={14} />
                            <span>Descargar</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Discussion & Q&A */}
              {activeTab === 'discussion' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <form onSubmit={handlePostComment} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <textarea
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder={t('player.comment_input_placeholder')}
                      className="form-input"
                      rows={3}
                      style={{ fontSize: '0.85rem' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button type="submit" className="btn btn-primary btn-sm">
                        {t('player.post_comment_btn')}
                      </button>
                    </div>
                  </form>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                    {comments.map((c) => (
                      <div key={c.id} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)' }}>
                        <img
                          src={c.avatar}
                          alt={c.autor}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--accent-purple)', flexShrink: 0 }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                            <strong style={{ fontSize: '0.85rem' }}>{c.autor}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.tiempo}</span>
                          </div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                            {c.texto}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Interactive Playlist */}
          <div style={{ position: 'sticky', top: '5.5rem' }}>
            <LessonPlaylist
              course={course}
              activeLessonId={currentLesson.id}
              onSelectLesson={handleSelectLesson}
              progressMap={progressMap}
              onUnlockLesson={(cId, lId) => {
                const target = allLessons.find(l => l.id === lId);
                if (target) {
                  setLessonToUnlock(target);
                  setShowUnlockLessonModal(true);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Unlock Lesson Modal */}
      {showUnlockLessonModal && (
        <Modal
          isOpen={showUnlockLessonModal}
          onClose={() => setShowUnlockLessonModal(false)}
          title="Desbloquear Lección Individual"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              ¿Deseas desbloquear la lección <strong>{lessonToUnlock?.titulo}</strong> por <strong>5 tokens</strong> de tu saldo?
            </p>

            <div style={{ backgroundColor: 'var(--bg-surface-secondary)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tu saldo actual:</span>
              <span className="token-pill">
                <Zap size={14} fill="#F59E0B" /> {balance} tk
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setShowUnlockLessonModal(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmUnlockLesson}
                disabled={balance < 5}
                className="btn btn-primary"
              >
                Confirmar (5 tokens)
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
