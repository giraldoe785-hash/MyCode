import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { useVideoProgress } from '../context/VideoProgressContext';
import { useLiveStream } from '../context/LiveStreamContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import {
  Flame,
  Award,
  BookOpen,
  Code2,
  Tv,
  Star,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
  FileCode,
  Activity,
  CheckCircle,
  MessageSquare,
  X,
  Play,
  TrendingUp,
  Filter,
  Search,
  ExternalLink,
  GraduationCap
} from 'lucide-react';
import { EJERCICIOS_DATA, COURSES_DATA } from '../services/mockData';

export function DashboardView() {
  const { user } = useAuth();
  const { balance, transactions } = useWallet();
  const { getContinueWatchingList, getCourseProgress, courses: contextCourses, favorites, getFavoriteCoursesList } = useVideoProgress();
  const { activeStream, upcomingStreams } = useLiveStream();
  const { t, isSpanish } = useLanguage();
  const navigate = useNavigate();

  // Active Tab: 'overview' | 'courses' | 'exercises' | 'progress'
  const [activeTab, setActiveTab] = useState('overview');

  const [courses, setCourses] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [activities, setActivities] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Exercise Filter: 'all' | 'pending' | 'submitted' | 'approved' | 'requires_correction'
  const [exerciseFilter, setExerciseFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Submission for Feedback Modal
  const [selectedFeedbackSub, setSelectedFeedbackSub] = useState(null);

  const userId = user?.id || 'usr_101';

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        setLoading(true);
        const [allCourses, allExercises, subs, anns, acts, achs] = await Promise.all([
          api.courses.getAll(),
          api.exercises.getAll(),
          api.submissions.getSubmissionsByStudent(userId),
          api.announcements.getAnnouncementsForStudent(userId),
          api.activity.getStudentActivity(userId),
          api.achievements.getAchievements(userId)
        ]);

        setCourses(allCourses || COURSES_DATA);
        setExercises(allExercises || EJERCICIOS_DATA);
        setSubmissions(subs || []);
        setAnnouncements(anns || []);
        setActivities(acts || []);
        setAchievements(achs || []);
      } catch (e) {
        console.error('Error loading Student Hub data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadStudentData();
  }, [userId]);

  const continueWatching = getContinueWatchingList();
  const favoriteCourses = getFavoriteCoursesList();

  // Calculate Academic Metrics
  const enrolledCourses = courses.filter(c => c.desbloqueado || continueWatching.some(cw => cw.course.id === c.id));
  
  // Total lessons in enrolled courses
  let totalEnrolledLessons = 0;
  let totalCompletedLessons = 0;
  enrolledCourses.forEach(c => {
    let courseLessons = 0;
    let courseCompleted = 0;
    c.secciones?.forEach(s => {
      s.lecciones?.forEach(l => {
        courseLessons++;
        if (l.completada) courseCompleted++;
      });
    });
    totalEnrolledLessons += (courseLessons || c.totalLecciones || 4);
    totalCompletedLessons += courseCompleted;
  });

  const overallProgressPct = totalEnrolledLessons > 0
    ? Math.round((totalCompletedLessons / totalEnrolledLessons) * 100)
    : 0;

  // Exercise states mapping
  const exerciseStatuses = exercises.map(ex => {
    const sub = submissions.find(s => s.exerciseId === ex.id);
    let status = 'pending';
    let score = null;
    let feedback = null;

    if (sub) {
      status = sub.status;
      score = sub.score;
      feedback = sub.feedback;
    }

    const parentCourse = courses.find(c => c.id === ex.courseId || c.id === ex.cursoId);

    return {
      ...ex,
      status,
      score,
      feedback,
      submission: sub,
      courseTitle: parentCourse ? (isSpanish ? parentCourse.titulo : (parentCourse.tituloEn || parentCourse.titulo)) : (isSpanish ? 'Curso MyCode' : 'MyCode Course')
    };
  });

  const completedExercisesCount = exerciseStatuses.filter(e => e.status === 'approved').length;
  const pendingExercisesCount = exerciseStatuses.filter(e => e.status === 'pending' || e.status === 'requires_correction').length;

  const gradedSubmissions = submissions.filter(s => typeof s.score === 'number');
  const averageGrade = gradedSubmissions.length > 0
    ? Math.round(gradedSubmissions.reduce((acc, curr) => acc + curr.score, 0) / gradedSubmissions.length)
    : 100;

  // Filtered exercises for Exercises Tab
  const filteredExercises = exerciseStatuses.filter(ex => {
    const matchesFilter =
      exerciseFilter === 'all' ||
      (exerciseFilter === 'pending' && (ex.status === 'pending' || ex.status === 'requires_correction')) ||
      (exerciseFilter === 'submitted' && (ex.status === 'submitted' || ex.status === 'under_review')) ||
      (exerciseFilter === 'approved' && ex.status === 'approved') ||
      (exerciseFilter === 'requires_correction' && ex.status === 'requires_correction');

    const matchesSearch =
      (ex.titulo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ex.courseTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ex.lenguaje || ex.language || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '4rem', minHeight: '85vh' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        {/* 1. Student Welcome Header Card */}
        <div
          className="welcome-card card"
          style={{
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
                <BookOpen size={16} /> {isSpanish ? 'Panel Instructor' : 'Instructor Panel'}
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

        {/* 2. Top Academic Summary Cards */}
        <div className="dashboard-metrics-grid">
          {/* Active Courses */}
          <div className="card dashboard-gold-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {t('student.stat_enrolled_courses')}
                </span>
                <BookOpen size={18} color="var(--accent-purple)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                {enrolledCourses.length}
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-full)', margin: '0.75rem 0 0.35rem', overflow: 'hidden' }}>
                <div style={{ width: `${overallProgressPct}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-purple), var(--accent-cyan))', borderRadius: 'var(--radius-full)' }} />
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {overallProgressPct}% {isSpanish ? 'de avance promedio' : 'average progress'}
            </div>
          </div>

          {/* Practical Exercises */}
          <div className="card dashboard-gold-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {t('student.stat_completed_exercises')}
                </span>
                <CheckCircle2 size={18} color="var(--color-success)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-success)', lineHeight: 1 }}>
                {completedExercisesCount} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ {exercises.length}</span>
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
              {pendingExercisesCount > 0 ? (
                <span style={{ color: '#F59E0B', fontWeight: 600 }}>{pendingExercisesCount} {isSpanish ? 'retos pendientes' : 'pending tasks'}</span>
              ) : (
                <span style={{ color: 'var(--color-success)' }}>{isSpanish ? 'Todos los retos completados' : 'All tasks completed'}</span>
              )}
            </div>
          </div>

          {/* GPA / Average Grade */}
          <div className="card dashboard-gold-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {t('student.stat_gpa')}
                </span>
                <GraduationCap size={18} color="#F59E0B" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F59E0B', lineHeight: 1 }}>
                {averageGrade} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 100</span>
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
              {gradedSubmissions.length} {isSpanish ? 'entregas evaluadas por instructores' : 'submissions graded by instructors'}
            </div>
          </div>

          {/* Tokens & Practice Balance */}
          <div className="card dashboard-gold-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {t('dashboard.card_tokens_title')}
                </span>
                <Link to="/wallet" style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', fontWeight: 600 }}>
                  {t('dashboard.details_link')} →
                </Link>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-purple)', lineHeight: 1 }}>
                {balance} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>tk</span>
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
              Plan {user?.plan || 'Bronce'} • {t('dashboard.monthly_recharge_in')}
            </div>
          </div>
        </div>

        {/* 3. Navigation Tabs (Student Experience) */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: 'var(--radius-full)' }}
          >
            <Sparkles size={14} />
            <span>{t('student.tab_overview')}</span>
          </button>

          <button
            onClick={() => setActiveTab('courses')}
            className={`btn btn-sm ${activeTab === 'courses' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: 'var(--radius-full)' }}
          >
            <BookOpen size={14} />
            <span>{t('student.tab_my_courses')}</span>
            <span className="badge badge-purple" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>{enrolledCourses.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('exercises')}
            className={`btn btn-sm ${activeTab === 'exercises' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: 'var(--radius-full)' }}
          >
            <Code2 size={14} />
            <span>{t('student.tab_exercises')}</span>
            {pendingExercisesCount > 0 && (
              <span className="badge badge-gold" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>{pendingExercisesCount}</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('progress')}
            className={`btn btn-sm ${activeTab === 'progress' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: 'var(--radius-full)' }}
          >
            <TrendingUp size={14} />
            <span>{t('student.tab_progress')}</span>
          </button>
        </div>

        {/* 4. Tab Content: OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* Continue Learning Section */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
                <div>
                  <h2 className="heading-md" style={{ margin: 0 }}>{t('student.continue_title')}</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {t('student.continue_subtitle')}
                  </p>
                </div>
                <button onClick={() => setActiveTab('courses')} className="btn-ghost" style={{ fontSize: '0.85rem', color: 'var(--accent-purple)', fontWeight: 600 }}>
                  {isSpanish ? 'Ver todos mis cursos' : 'View all my courses'} →
                </button>
              </div>

              {continueWatching.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
                  <Tv size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
                  <p style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>
                    {t('student.empty_enrolled_courses')}
                  </p>
                  <Link to="/courses" className="btn btn-primary btn-sm">
                    {t('student.explore_catalog_btn')}
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
                                {t('student.last_visited')} {lastLesson.titulo}
                              </span>
                            </div>
                          )}
                        </div>

                        <Link
                          to={`/courses/${course.id}/lesson/${lastLesson?.id || 'default'}`}
                          className="btn btn-primary btn-sm"
                          style={{ marginTop: '1rem', width: '100%' }}
                        >
                          <span>{t('student.resume_btn')}</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Split: Course Announcements & Academic Activity */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {/* Announcements Section */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MessageSquare size={18} color="var(--accent-purple)" />
                    <span>{t('student.announcements_title')}</span>
                  </h3>
                  <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>{announcements.length}</span>
                </div>

                {announcements.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>{t('student.no_announcements')}</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {announcements.map(ann => (
                      <div key={ann.id} style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                          <img src={ann.instructorAvatar} alt={ann.instructor} style={{ width: '22px', height: '22px', borderRadius: '50%' }} />
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{ann.instructor} • {ann.date}</span>
                        </div>
                        <h5 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 0.25rem', color: 'var(--text-primary)' }}>
                          {isSpanish ? ann.title : (ann.titleEn || ann.title)}
                        </h5>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                          {isSpanish ? ann.content : (ann.contentEn || ann.content)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Activity Timeline Section */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity size={18} color="var(--accent-cyan)" />
                    <span>{t('student.activity_title')}</span>
                  </h3>
                </div>

                {activities.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>{t('student.no_activity')}</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {activities.map(act => (
                      <div key={act.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: act.type === 'evaluation_received' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(147, 51, 234, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {act.type === 'evaluation_received' ? <CheckCircle size={14} color="var(--color-success)" /> : <Code2 size={14} color="var(--accent-purple)" />}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {isSpanish ? act.title : (act.titleEn || act.title)}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {isSpanish ? act.description : (act.descriptionEn || act.description)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 5. Tab Content: MY COURSES */}
        {activeTab === 'courses' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 className="heading-md" style={{ margin: 0 }}>{t('student.tab_my_courses')}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {isSpanish ? 'Cursos en los que estás matriculado con acceso a videos y ejercicios prácticos.' : 'Courses you are enrolled in with access to video lessons and practical coding exercises.'}
                </p>
              </div>
              <Link to="/courses" className="btn btn-secondary btn-sm">
                <Search size={14} /> {t('student.explore_catalog_btn')}
              </Link>
            </div>

            <div className="grid-2">
              {enrolledCourses.map(course => {
                let completedCount = 0;
                let totalCount = 0;
                course.secciones?.forEach(s => {
                  s.lecciones?.forEach(l => {
                    totalCount++;
                    if (l.completada) completedCount++;
                  });
                });
                totalCount = totalCount || course.totalLecciones || 4;
                const pct = Math.round((completedCount / totalCount) * 100);

                return (
                  <div key={course.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <img src={course.miniatura} alt={course.titulo} style={{ width: '100px', height: '70px', borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>{course.lenguaje}</span>
                          <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>{course.nivel}</span>
                        </div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.25rem' }}>
                          {isSpanish ? course.titulo : (course.tituloEn || course.titulo)}
                        </h4>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {t('student.course_teacher')} <strong>{course.instructor}</strong>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                        <span>{t('student.lessons_count_format', { completed: completedCount, total: totalCount, pct })}</span>
                        <span>{pct}%</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--accent-purple)' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                      <Link to={`/courses/${course.id}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                        {isSpanish ? 'Ver Temario' : 'View Syllabus'}
                      </Link>
                      <Link to={`/courses/${course.id}/lesson/${course.secciones?.[0]?.lecciones?.[0]?.id || 'les-1-1'}`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                        <Play size={14} /> {isSpanish ? 'Ir a Lecciones' : 'Go to Lessons'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. Tab Content: EXERCISES & SUBMISSIONS */}
        {activeTab === 'exercises' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 className="heading-md" style={{ margin: 0 }}>{t('student.tab_exercises')}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {isSpanish ? 'Resuelve problemas prácticos en el Sandbox y revisa la retroalimentación de tus instructores.' : 'Solve practical coding challenges in the Sandbox and review instructor feedback.'}
                </p>
              </div>

              {/* Status Filters */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setExerciseFilter('all')}
                  className={`btn btn-sm ${exerciseFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                >
                  {t('student.filter_all')}
                </button>
                <button
                  onClick={() => setExerciseFilter('pending')}
                  className={`btn btn-sm ${exerciseFilter === 'pending' ? 'btn-primary' : 'btn-ghost'}`}
                >
                  {t('student.filter_pending')}
                </button>
                <button
                  onClick={() => setExerciseFilter('submitted')}
                  className={`btn btn-sm ${exerciseFilter === 'submitted' ? 'btn-primary' : 'btn-ghost'}`}
                >
                  {t('student.filter_submitted')}
                </button>
                <button
                  onClick={() => setExerciseFilter('approved')}
                  className={`btn btn-sm ${exerciseFilter === 'approved' ? 'btn-primary' : 'btn-ghost'}`}
                >
                  {t('student.filter_approved')}
                </button>
                <button
                  onClick={() => setExerciseFilter('requires_correction')}
                  className={`btn btn-sm ${exerciseFilter === 'requires_correction' ? 'btn-primary' : 'btn-ghost'}`}
                >
                  {t('student.filter_requires_correction')}
                </button>
              </div>
            </div>

            {filteredExercises.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={36} color="var(--color-success)" style={{ margin: '0 auto 0.75rem' }} />
                <p style={{ fontSize: '0.95rem', margin: 0 }}>
                  {isSpanish ? 'No hay ejercicios en esta categoría.' : 'No exercises found in this category.'}
                </p>
              </div>
            ) : (
              <div className="grid-2">
                {filteredExercises.map(ex => {
                  const isApproved = ex.status === 'approved';
                  const isCorrection = ex.status === 'requires_correction';
                  const isSubmitted = ex.status === 'submitted' || ex.status === 'under_review';

                  return (
                    <div
                      key={ex.id}
                      className="card card-hover"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        borderLeft: isApproved
                          ? '4px solid var(--color-success)'
                          : isCorrection
                          ? '4px solid #F59E0B'
                          : isSubmitted
                          ? '4px solid var(--accent-cyan)'
                          : '4px solid var(--border-medium)'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>{ex.lenguaje || ex.language}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ex.courseTitle}</span>
                          </div>

                          {isApproved && (
                            <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
                              <CheckCircle size={12} /> {t('student.status_approved')} ({ex.score}/100)
                            </span>
                          )}
                          {isCorrection && (
                            <span className="badge badge-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
                              <AlertTriangle size={12} /> {t('student.status_requires_correction')}
                            </span>
                          )}
                          {isSubmitted && (
                            <span className="badge badge-cyan" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
                              <Clock size={12} /> {t('student.status_under_review')}
                            </span>
                          )}
                          {!isApproved && !isCorrection && !isSubmitted && (
                            <span className="badge" style={{ backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                              {t('student.status_pending')}
                            </span>
                          )}
                        </div>

                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.35rem' }}>
                          {isSpanish ? ex.titulo : (ex.tituloEn || ex.titulo)}
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                          {ex.enunciado || ex.content}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                        {(isApproved || isCorrection || ex.feedback) && (
                          <button
                            onClick={() => setSelectedFeedbackSub(ex.submission || ex)}
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <MessageSquare size={14} />
                            <span>{t('student.btn_view_feedback')}</span>
                          </button>
                        )}

                        {(!isApproved || isCorrection) && (
                          <Link
                            to={`/exercises/${ex.id}`}
                            className="btn btn-primary btn-sm"
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                          >
                            <Code2 size={14} />
                            <span>{isCorrection ? t('student.btn_resubmit') : t('student.btn_solve')}</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 7. Tab Content: PROGRESS & PERFORMANCE */}
        {activeTab === 'progress' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h2 className="heading-md" style={{ margin: '0 0 0.25rem' }}>{t('student.progress_breakdown_title')}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                {isSpanish ? 'Métricas de avance por curso, lecciones vistas y calificaciones obtenidas.' : 'Progress metrics by course, watched lessons, and acquired grades.'}
              </p>
            </div>

            {/* Course-by-course breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {enrolledCourses.map(course => {
                let comp = 0;
                let tot = 0;
                course.secciones?.forEach(s => {
                  s.lecciones?.forEach(l => {
                    tot++;
                    if (l.completada) comp++;
                  });
                });
                tot = tot || course.totalLecciones || 4;
                const pct = Math.round((comp / tot) * 100);

                return (
                  <div key={course.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.25rem' }}>
                          {isSpanish ? course.titulo : (course.tituloEn || course.titulo)}
                        </h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {t('student.course_teacher')} {course.instructor}
                        </span>
                      </div>
                      <span className="badge badge-purple" style={{ fontSize: '0.85rem' }}>{pct}% {isSpanish ? 'Completado' : 'Completed'}</span>
                    </div>

                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-purple), var(--accent-cyan))', borderRadius: 'var(--radius-full)' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span>{comp} / {tot} {isSpanish ? 'lecciones vistas' : 'lessons watched'}</span>
                      <Link to={`/courses/${course.id}`} style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>
                        {isSpanish ? 'Continuar Lecciones' : 'Continue Lessons'} →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Gamification: Achievements & Badges */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={18} color="#F59E0B" />
                  <span>{t('dashboard.achievements_title')}</span>
                </h3>
                <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
                  {achievements.filter(a => a.unlocked).length} / {achievements.length} {isSpanish ? 'Desbloqueados' : 'Unlocked'}
                </span>
              </div>

              {achievements.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                  <Award size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>
                    {isSpanish ? 'No hay logros disponibles por el momento.' : 'No achievements available at the moment.'}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  {achievements.map(ach => {
                    const isUnlocked = Boolean(ach.unlocked);
                    const titleText = isSpanish ? ach.title : (ach.titleEn || ach.title);
                    const descText = isSpanish ? ach.desc : (ach.descEn || ach.desc);
                    const achColor = ach.color || 'var(--accent-purple)';

                    const renderIcon = () => {
                      const iconProps = { size: 22, color: isUnlocked ? achColor : 'var(--text-muted)' };
                      switch (ach.icon) {
                        case 'Flame': return <Flame {...iconProps} fill={isUnlocked ? achColor : 'none'} />;
                        case 'BookOpen': return <BookOpen {...iconProps} />;
                        case 'CheckCircle2': return <CheckCircle2 {...iconProps} />;
                        case 'Sparkles': return <Sparkles {...iconProps} />;
                        case 'Award': return <Award {...iconProps} />;
                        case 'Code2':
                        default: return <Code2 {...iconProps} />;
                      }
                    };

                    return (
                      <div
                        key={ach.id}
                        style={{
                          padding: '1rem',
                          backgroundColor: 'var(--bg-surface-secondary)',
                          borderRadius: 'var(--radius-md)',
                          border: isUnlocked ? `1px solid ${achColor}55` : '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.85rem',
                          opacity: isUnlocked ? 1 : 0.65,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: isUnlocked ? `${achColor}18` : 'var(--bg-surface)',
                            border: `1px solid ${isUnlocked ? achColor : 'var(--border-subtle)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {renderIcon()}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                            <h5 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {titleText}
                            </h5>
                            {isUnlocked ? (
                              <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                                ✓
                              </span>
                            ) : (
                              <span className="badge" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', color: 'var(--text-muted)' }}>
                                {ach.requiredXP} XP
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.35 }}>
                            {descText}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 8. Evaluation Feedback Modal (HU-EST-12) */}
        {selectedFeedbackSub && (
          <div className="modal-backdrop" onClick={() => setSelectedFeedbackSub(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div
              className="modal-content card"
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MessageSquare size={20} color="var(--accent-purple)" />
                  <span>{t('student.feedback_modal_title')}</span>
                </h3>
                <button onClick={() => setSelectedFeedbackSub(null)} className="btn-ghost" style={{ padding: '0.25rem', color: 'var(--text-muted)' }}>
                  <X size={18} />
                </button>
              </div>

              {/* Score & Reviewer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-surface-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('student.feedback_score')}</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: selectedFeedbackSub.score >= 80 ? 'var(--color-success)' : '#F59E0B' }}>
                    {selectedFeedbackSub.score ?? 100} / 100
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('student.feedback_teacher')}</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {selectedFeedbackSub.reviewedBy || 'Carlos Mendoza'}
                  </div>
                </div>
              </div>

              {/* Instructor Remarks */}
              <div>
                <h5 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                  {t('student.feedback_comments')}
                </h5>
                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {selectedFeedbackSub.feedback || (isSpanish ? '¡Solución aprobada sin observaciones! Gran trabajo estructurando el algoritmo.' : 'Solution approved without remarks! Great work structuring the algorithm.')}
                </div>
              </div>

              {/* Submitted Code Preview */}
              {selectedFeedbackSub.code && (
                <div>
                  <h5 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
                    {t('student.feedback_submitted_code')}
                  </h5>
                  <pre style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', overflowX: 'auto', color: 'var(--accent-purple)', border: '1px solid var(--border-subtle)' }}>
                    {selectedFeedbackSub.code}
                  </pre>
                </div>
              )}

              {/* Footer Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                {selectedFeedbackSub.status === 'requires_correction' && (
                  <Link
                    to={`/exercises/${selectedFeedbackSub.exerciseId || selectedFeedbackSub.id}`}
                    onClick={() => setSelectedFeedbackSub(null)}
                    className="btn btn-primary btn-sm"
                  >
                    <Code2 size={14} /> {t('student.btn_resubmit')}
                  </Link>
                )}
                <button
                  onClick={() => setSelectedFeedbackSub(null)}
                  className="btn btn-secondary btn-sm"
                >
                  {t('student.feedback_close')}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default DashboardView;
