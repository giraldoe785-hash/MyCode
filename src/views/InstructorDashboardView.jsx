import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { CourseFormModal } from '../components/instructor/CourseFormModal';
import { CourseContentManager } from '../components/instructor/CourseContentManager';
import { StartLiveModal } from '../components/instructor/StartLiveModal';
import { ExerciseFormModal } from '../components/instructor/ExerciseFormModal';
import {
  BookOpen,
  CheckCircle,
  Code2,
  Users,
  FileText,
  Plus,
  Search,
  Filter,
  Radio,
  Edit2,
  Trash2,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Tv,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  EyeOff,
  Eye,
  Award
} from 'lucide-react';

export function InstructorDashboardView() {
  const { user } = useAuth();
  const { t, isSpanish } = useLanguage();
  
  // Tabs: 'courses' | 'exercises' | 'submissions'
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedAnalyticsCourseId, setSelectedAnalyticsCourseId] = useState('');
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  
  const [isContentManagerOpen, setIsContentManagerOpen] = useState(false);
  const [selectedCourseForContent, setSelectedCourseForContent] = useState(null);

  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);

  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);

  // Filter Submissions by Exercise
  const [submissionFilterExercise, setSubmissionFilterExercise] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Review Modal State
  const [selectedSub, setSelectedSub] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState('');
  const [status, setStatus] = useState('approved');

  const fetchData = async () => {
    setLoading(true);
    const allCourses = await api.courses.getAll();
    const myCourses = allCourses.filter(c => c.instructorId === user?.id || c.instructor === user?.nombre || c.instructor === "Carlos Mendoza" || user?.role === 'admin');
    setCourses(myCourses);

    if (user) {
      const myEx = await api.exercises.getExercisesForInstructor(user.id);
      setExercises(myEx);

      const mySubs = await api.submissions.getSubmissionsForInstructor(user.id);
      setSubmissions(user.role === 'admin' ? (await import('../services/mockData')).ENTREGAS_DATA : mySubs);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchAnalytics = async (courseId) => {
    if (!courseId) return;
    setLoadingAnalytics(true);
    const res = await api.analytics.getCourseAnalytics(courseId, user);
    if (res.success) {
      setAnalyticsData(res);
    }
    setLoadingAnalytics(false);
  };

  useEffect(() => {
    if (activeTab === 'analytics' && courses.length > 0) {
      const targetId = selectedAnalyticsCourseId || courses[0].id;
      if (!selectedAnalyticsCourseId) setSelectedAnalyticsCourseId(targetId);
      fetchAnalytics(targetId);
    }
  }, [activeTab, selectedAnalyticsCourseId, courses]);

  const handleToggleCourseStatus = async (course) => {
    const nextStatus = course.estado === 'despublicado' ? 'publicado' : 'despublicado';
    const actionText = nextStatus === 'despublicado' ? 'despublicar' : 'publicar';
    const studentWarning = (course.estudiantes || 0) > 0 && nextStatus === 'despublicado'
      ? ` Este curso tiene ${course.estudiantes} alumnos inscritos; conservarán su acceso pero el curso no aparecerá en el catálogo para nuevos alumnos.`
      : '';

    if (!window.confirm(`¿Deseas ${actionText} el curso '${course.titulo}'?${studentWarning}`)) return;

    const res = await api.courses.updateStatus(course.id, nextStatus, user);
    if (res.success) {
      setCourses(prev => prev.map(c => c.id === course.id ? { ...c, estado: nextStatus } : c));
    }
  };


  const handleReviewSubmission = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;

    const res = await api.submissions.reviewSubmission(selectedSub.id, parseInt(score, 10), feedback, status);
    if (res.success) {
      setSubmissions(prev => prev.map(s => s.id === selectedSub.id ? res.submission : s));
      setSelectedSub(null);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('¿Seguro que deseas eliminar este curso? Esta acción no se puede deshacer.')) return;
    const res = await api.courses.deleteCourse(courseId);
    if (res.success) {
      setCourses(prev => prev.filter(c => c.id !== courseId));
    }
  };

  const handleDeleteExercise = async (exId) => {
    if (!window.confirm('¿Seguro que deseas eliminar este ejercicio práctico?')) return;
    const res = await api.exercises.deleteExercise(exId);
    if (res.success) {
      setExercises(prev => prev.filter(e => e.id !== exId));
    }
  };

  // Filtrado de entregas
  const filteredSubmissions = submissions.filter(sub => {
    const matchesExercise = submissionFilterExercise === 'all' || sub.exerciseId === submissionFilterExercise;
    const matchesSearch = !searchTerm || 
      (sub.studentId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.exerciseId || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesExercise && matchesSearch;
  });

  if (user?.role !== 'instructor' && user?.role !== 'admin') {
    return (
      <div className="container" style={{ paddingTop: '4rem', textAlign: 'center', minHeight: '60vh' }}>
        <h2 className="heading-md" style={{ color: 'var(--color-danger)' }}>Acceso Denegado</h2>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Esta vista es exclusiva para Profesionales e Instructores Tech.</p>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '4rem', minHeight: '80vh' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Header y Acción Rápida de Emisión en Directo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="heading-lg" style={{ marginBottom: '0.25rem' }}>{t('instructor.hub_title')}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>{t('instructor.hub_desc')}</p>
          </div>

          <button
            onClick={() => setIsLiveModalOpen(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#EF4444', borderColor: '#EF4444', boxShadow: '0 0 15px rgba(239,68,68,0.3)' }}
          >
            <Radio size={16} className="animate-pulse" />
            <span>{t('instructor.start_live_btn')}</span>
          </button>
        </div>

        {/* Métricas y Estadísticas */}
        <div className="grid-4">
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <BookOpen size={20} color="var(--accent-cyan)" />
              <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{t('instructor.published_courses')}</span>
            </div>
            <div className="heading-lg">{courses.length}</div>
          </div>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Code2 size={20} color="var(--accent-purple)" />
              <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{t('instructor.created_exercises')}</span>
            </div>
            <div className="heading-lg">{exercises.length}</div>
          </div>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <CheckCircle size={20} color="var(--color-success)" />
              <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{t('instructor.pending_review')}</span>
            </div>
            <div className="heading-lg">{submissions.filter(s => s.status === 'submitted').length}</div>
          </div>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Users size={20} color="#F59E0B" />
              <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{t('instructor.total_students')}</span>
            </div>
            <div className="heading-lg">
              {courses.reduce((acc, c) => acc + (c.estudiantes || 0), 0)}
            </div>
          </div>
        </div>

        {/* Pestañas de Navegación del Panel */}
        <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('courses')}
            className={`btn-sm ${activeTab === 'courses' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <BookOpen size={16} /> {t('instructor.my_courses')} ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab('exercises')}
            className={`btn-sm ${activeTab === 'exercises' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Code2 size={16} /> {t('instructor.practice_exercises')} ({exercises.length})
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`btn-sm ${activeTab === 'submissions' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FileText size={16} /> {t('instructor.student_answers')} ({submissions.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`btn-sm ${activeTab === 'analytics' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <BarChart3 size={16} /> {t('instructor.analytics_tab')}
          </button>
        </div>

        {/* Contenido de Pestañas */}
        {loading ? (
          <p>{t('instructor.loading_panel')}</p>
        ) : (
          <div>
            {/* PESTAÑA 1: GESTIÓN DE CURSOS Y LECCIONES */}
            {activeTab === 'courses' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {t('instructor.courses_subtitle')}
                  </span>
                  <button
                    onClick={() => {
                      setEditingCourse(null);
                      setIsCourseModalOpen(true);
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Plus size={16} /> {t('instructor.new_course_btn')}
                  </button>
                </div>

                {courses.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <BookOpen size={36} color="var(--accent-cyan)" style={{ margin: '0 auto 1rem', display: 'block' }} />
                    <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{t('instructor.no_courses_title')}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                      {t('instructor.no_courses_desc')}
                    </p>
                    <button onClick={() => { setEditingCourse(null); setIsCourseModalOpen(true); }} className="btn btn-primary btn-sm">
                      <Plus size={16} /> {t('instructor.create_first_course')}
                    </button>
                  </div>
                ) : (
                  <div className="grid-3">
                    {courses.map(course => (
                      <div key={course.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ position: 'relative', width: '100%', height: '140px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '0.5rem' }}>
                            <img src={course.miniatura} alt={course.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            
                          </div>

                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                              {course.lenguaje}
                            </span>
                            <span className={`badge ${course.estado === 'despublicado' ? 'badge-yellow' : course.estado === 'borrador' ? '' : 'badge-cyan'}`} style={{ fontSize: '0.7rem', textTransform: 'capitalize' }}>
                              {course.estado || 'publicado'}
                            </span>
                          </div>
<h3 style={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.3, marginBottom: '0.35rem' }}>
                            {course.titulo}
                          </h3>

                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '0.75rem' }}>
                            {course.subtitulo || course.descripcionCorta || t('instructor.no_description')}
                          </p>

                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                            <span>{(course.secciones || []).length} {t('instructor.modules_label')} • {course.totalLecciones || (course.secciones || []).reduce((a, s) => a + (s.lecciones?.length || 0), 0)} {t('instructor.lessons_label')}</span>
                            <span>{course.estudiantes || 0} {t('instructor.students_label')}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <button
                            onClick={() => {
                              setSelectedCourseForContent(course);
                              setIsContentManagerOpen(true);
                            }}
                            className="btn btn-primary btn-sm"
                            style={{ flex: 1, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                          >
                            <Layers size={14} /> {t('instructor.manage_content')}
                          </button>
                          
                          <button
                            onClick={() => {
                              setEditingCourse(course);
                              setIsCourseModalOpen(true);
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.35rem 0.55rem' }}
                            title={t('instructor.edit_course_title')}
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.35rem 0.55rem', color: '#EF4444' }}
                            title={t('instructor.delete_course_title')}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PESTAÑA 2: CREADOR Y GESTOR DE EJERCICIOS */}
            {activeTab === 'exercises' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {t('instructor.exercises_subtitle')}
                  </span>
                  <button
                    onClick={() => {
                      setEditingExercise(null);
                      setIsExerciseModalOpen(true);
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Plus size={16} /> {t('instructor.new_exercise_btn')}
                  </button>
                </div>

                {exercises.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Code2 size={36} color="var(--accent-purple)" style={{ margin: '0 auto 1rem', display: 'block' }} />
                    <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{t('instructor.no_exercises_title')}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                      {t('instructor.no_exercises_desc')}
                    </p>
                    <button onClick={() => { setEditingExercise(null); setIsExerciseModalOpen(true); }} className="btn btn-primary btn-sm">
                      <Plus size={16} /> {t('instructor.create_first_exercise')}
                    </button>
                  </div>
                ) : (
                  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-subtle)' }}>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>{t('instructor.th_exercise_title')}</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>{t('instructor.th_course_module')}</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>{t('instructor.th_language')}</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>{t('instructor.th_submissions')}</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'right' }}>{t('instructor.th_actions')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {exercises.map(ex => {
                            const courseName = courses.find(c => c.id === (ex.cursoId || ex.courseId))?.titulo || 'Curso General';
                            const subCount = submissions.filter(s => s.exerciseId === ex.id).length;
                            return (
                              <tr key={ex.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                <td style={{ padding: '1rem', fontWeight: 600 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Code2 size={15} color="var(--accent-cyan)" />
                                    <span>{ex.titulo || ex.title}</span>
                                  </div>
                                </td>
                                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                                  {courseName}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                  <span className={`badge ${ex.language === 'java' || ex.lenguaje === 'Java' ? 'badge-live' : 'badge-purple'}`} style={{ textTransform: 'capitalize' }}>
                                    {ex.language || ex.lenguaje || 'python'}
                                  </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                  <span style={{ fontWeight: 600, color: subCount > 0 ? 'var(--color-success)' : 'var(--text-muted)' }}>
                                    {t('instructor.submissions_count', { count: subCount })}
                                  </span>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                                    <button
                                      onClick={() => {
                                        setSubmissionFilterExercise(ex.id);
                                        setActiveTab('submissions');
                                      }}
                                      className="btn btn-secondary btn-sm"
                                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                                      title="Ver respuestas enviadas por los alumnos"
                                    >
                                      {t('instructor.view_submissions_btn', { count: subCount })}
                                    </button>

                                    <button
                                      onClick={() => {
                                        setEditingExercise(ex);
                                        setIsExerciseModalOpen(true);
                                      }}
                                      className="btn-ghost"
                                      style={{ padding: '0.25rem 0.4rem', color: 'var(--text-secondary)' }}
                                      title={t('instructor.edit_exercise_title')}
                                    >
                                      <Edit2 size={14} />
                                    </button>

                                    <button
                                      onClick={() => handleDeleteExercise(ex.id)}
                                      className="btn-ghost"
                                      style={{ padding: '0.25rem 0.4rem', color: '#EF4444' }}
                                      title={t('instructor.delete_exercise_title')}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PESTAÑA 3: RESPUESTAS Y ENTREGAS DE ALUMNOS */}
            {activeTab === 'submissions' && (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1rem', display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-secondary)', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                    <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder={t('instructor.search_placeholder')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ paddingLeft: '2rem', height: '36px', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Filter size={14} color="var(--text-muted)" />
                    <select
                      className="form-input"
                      value={submissionFilterExercise}
                      onChange={(e) => setSubmissionFilterExercise(e.target.value)}
                      style={{ height: '36px', fontSize: '0.85rem' }}
                    >
                      <option value="all">{t('instructor.all_exercises_option', { count: submissions.length })}</option>
                      {exercises.map(ex => (
                        <option key={ex.id} value={ex.id}>{ex.titulo || ex.title}</option>
                      ))}
                    </select>
                    {submissionFilterExercise !== 'all' && (
                      <button onClick={() => setSubmissionFilterExercise('all')} className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem' }}>
                        {t('instructor.remove_filter')}
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-subtle)' }}>
                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>{t('instructor.table_student')}</th>
                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>{t('instructor.table_exercise')}</th>
                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>{t('instructor.table_date')}</th>
                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>{t('instructor.table_attempts')}</th>
                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>{t('instructor.table_status')}</th>
                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>{t('instructor.th_grade')}</th>
                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>{t('instructor.table_action')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubmissions.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            {t('instructor.no_submissions_filtered')}
                          </td>
                        </tr>
                      ) : (
                        filteredSubmissions.map(sub => (
                          <tr key={sub.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '1rem', fontWeight: 600 }}>{sub.studentId}</td>
                            <td style={{ padding: '1rem' }}>{sub.exerciseId}</td>
                            <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{new Date(sub.submittedAt).toLocaleDateString()}</td>
                            <td style={{ padding: '1rem' }}>{sub.attemptNumber}</td>
                            <td style={{ padding: '1rem' }}>
                              <span className={`badge ${sub.status === 'approved' ? 'badge-cyan' : sub.status === 'needs_correction' ? 'badge-live' : 'badge-purple'}`}>
                                {sub.status === 'approved' ? t('instructor.status_approved') : sub.status === 'needs_correction' ? t('instructor.status_needs_correction') : t('instructor.status_submitted')}
                              </span>
                            </td>
                            <td style={{ padding: '1rem', fontWeight: 700, color: sub.score !== null ? '#10B981' : 'var(--text-muted)' }}>
                              {sub.score !== null ? `${sub.score}/100` : t('instructor.no_score')}
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <button onClick={() => {
                                setSelectedSub(sub);
                                setScore(sub.score || '');
                                setFeedback(sub.feedback || '');
                                setStatus(sub.status !== 'submitted' ? sub.status : 'approved');
                              }} className="btn btn-primary btn-sm">{t('instructor.review_btn')}</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Crear / Editar Curso */}
      <CourseFormModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        course={editingCourse}
        user={user}
        onSaved={fetchData}
      />

      {/* Administrador de Contenido y Lecciones de Curso */}
      {isContentManagerOpen && (
        <CourseContentManager
          isOpen={true}
          onClose={() => {
            setIsContentManagerOpen(false);
            setSelectedCourseForContent(null);
          }}
          course={selectedCourseForContent}
          onCourseUpdated={fetchData}
        />
      )}

      {/* Modal de Iniciar Emisión en Directo */}
      <StartLiveModal
        isOpen={isLiveModalOpen}
        onClose={() => setIsLiveModalOpen(false)}
        courses={courses}
        user={user}
        onStreamStarted={fetchData}
      />

      {/* Modal de Crear / Editar Ejercicio */}
      <ExerciseFormModal
        isOpen={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
        exercise={editingExercise}
        courses={courses}
        user={user}
        onSaved={fetchData}
      />

      {/* Modal de Revisión y Calificación de Entregas */}
      {selectedSub && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: 'var(--bg-main)' }}>
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>{t('instructor.review_modal_title')}: {selectedSub.studentId}</h3>
            <form onSubmit={handleReviewSubmission} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ backgroundColor: 'var(--bg-surface-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#A5B4FC', whiteSpace: 'pre-wrap', overflowX: 'auto', border: '1px solid var(--border-medium)' }}>
                {selectedSub.code}
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">{t('instructor.score_label')}</label>
                  <input type="number" required min="0" max="100" value={score} onChange={e => setScore(e.target.value)} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('instructor.status_label')}</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="form-input">
                    <option value="approved">{t('instructor.status_approved')}</option>
                    <option value="needs_correction">{t('instructor.status_needs_correction')}</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('instructor.feedback_label')}</label>
                <textarea rows={4} required value={feedback} onChange={e => setFeedback(e.target.value)} className="form-input" placeholder="{t('instructor.feedback_placeholder')}" style={{ resize: 'vertical' }}></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setSelectedSub(null)} className="btn btn-secondary">{t('instructor.cancel')}</button>
                <button type="submit" className="btn btn-primary">{t('instructor.save_review')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}