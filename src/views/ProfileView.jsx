import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { useVideoProgress } from '../context/VideoProgressContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Modal } from '../components/common/Modal';
import { AvatarPicker } from '../components/common/AvatarPicker';
import { CourseFormModal } from '../components/instructor/CourseFormModal';
import { CourseContentManager } from '../components/instructor/CourseContentManager';
import { StartLiveModal } from '../components/instructor/StartLiveModal';
import { ExerciseFormModal } from '../components/instructor/ExerciseFormModal';
import {
  User, Mail, Lock, Calendar, Zap, Award, BookOpen, CheckCircle2,
  XCircle, Clock, Sparkles, Layers, Code2, Radio, FileText, CreditCard,
  Edit2, AlertTriangle, Check, ChevronRight, ExternalLink
} from 'lucide-react';

export function ProfileView() {
  const { user, updateProfile } = useAuth();
  const { balance, transactions, addToast } = useWallet();
  const { courses: allCourses, getCourseProgress, getContinueWatchingList } = useVideoProgress();
  const { t, isSpanish } = useLanguage();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState(user?.nombre || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [avatarId, setAvatarId] = useState(user?.avatarId || '');
  const [isUpdatingInfo, setIsUpdatingInfo] = useState(false);
  const [photoError, setPhotoError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  const [selectedCertificate, setSelectedCertificate] = useState(null);

  const [instructorCourses, setInstructorCourses] = useState([]);
  const [instructorSubmissions, setInstructorSubmissions] = useState([]);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isContentManagerOpen, setIsContentManagerOpen] = useState(false);
  const [selectedCourseForContent, setSelectedCourseForContent] = useState(null);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);

  const isInstructorOrAdmin = user?.role === 'instructor' || user?.role === 'admin';
  const fetchInstructorData = async () => {
    if (isInstructorOrAdmin) {
      const courses = await api.courses.getAll();
      const myCourses = courses.filter(c => c.instructorId === user?.id || c.instructor === user?.nombre || c.instructor === 'Carlos Mendoza' || user?.role === 'admin');
      setInstructorCourses(myCourses);

      const mySubs = await api.submissions.getSubmissionsForInstructor(user?.id);
      setInstructorSubmissions(user?.role === 'admin' ? (await import('../services/mockData.js')).ENTREGAS_DATA : mySubs);
    }
  };

  useEffect(() => {
    if (user) {
      setNombre(user.nombre || '');
      setEmail(user.email || '');
      setAvatar(user.avatar || '');
      setAvatarId(user.avatarId || '');
      fetchInstructorData();
    }
  }, [user]);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyConsumption = transactions
    .filter(tx => {
      const txDate = new Date(tx.fecha);
      return tx.cambio < 0 && txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    })
    .reduce((acc, tx) => acc + Math.abs(tx.cambio), 0);

  const nextRechargeDate = new Date(currentYear, currentMonth + 1, 1).toLocaleDateString(isSpanish ? 'es-ES' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const isLenValid = newPassword.length >= 7 && newPassword.length <= 150;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isPasswordValid = isLenValid && hasUpper && hasLower && hasNumber;

  const handleUpdatePersonalInfo = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim()) {
      addToast(isSpanish ? 'Por favor completa todos los campos requeridos.' : 'Please fill in all required fields.', 'warning');
      return;
    }
    setIsUpdatingInfo(true);
    const res = await updateProfile({
      nombre: nombre.trim(),
      email: email.trim(),
      avatar,
      avatarId
    });
    setIsUpdatingInfo(false);
    if (res.success) {
      addToast(isSpanish ? 'Datos personales actualizados correctamente.' : 'Personal details updated successfully.', 'success');
    } else {
      addToast(isSpanish ? 'Error al actualizar el perfil.' : 'Error updating profile.', 'danger');
    }
  };

  const handleInstructorPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    setPhotoError('');
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoError(isSpanish ? 'Por favor selecciona una imagen válida.' : 'Please select a valid image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError(isSpanish ? 'La imagen no puede exceder 5MB.' : 'Image cannot exceed 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result);
      setAvatarId(null);
    };
    reader.readAsDataURL(file);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError('');

    if (!currentPassword) {
      setPwdError(isSpanish ? 'Ingresa tu contraseña actual.' : 'Please enter your current password.');
      return;
    }
    if (!isPasswordValid) {
      setPwdError(isSpanish ? 'La nueva contraseña no cumple con los requisitos de seguridad.' : 'New password does not meet security requirements.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError(isSpanish ? 'Las contraseñas no coinciden.' : 'Passwords do not match.');
      return;
    }

    setIsChangingPwd(true);
    const res = await api.users.changePassword(currentPassword, newPassword);
    setIsChangingPwd(false);

    if (res.success) {
      addToast(isSpanish ? 'Contraseña actualizada con éxito.' : 'Password updated successfully.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPwdError(res.error || (isSpanish ? 'Error al cambiar contraseña.' : 'Error changing password.'));
    }
  };

  const continueWatching = getContinueWatchingList();
  
  const completedCourses = allCourses.filter(course => {
    const stats = getCourseProgress(course);
    return stats.percentage === 100;
  });
  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '4rem', minHeight: '85vh' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

        {/* 1. ENCABEZADO DE PERFIL COMÚN */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
            padding: '2rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid var(--accent-purple)',
              boxShadow: '0 0 20px var(--accent-purple-glow)',
              flexShrink: 0
            }}>
              <img
                src={user?.avatar || avatar}
                alt={user?.nombre}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                <h1 className="heading-md" style={{ margin: 0 }}>{user?.nombre}</h1>
                <span className={`badge ${user?.role === 'instructor' || user?.role === 'admin' ? 'badge-live' : 'badge-purple'}`}>
                  {user?.role === 'instructor' ? 'Instructor Tech' : user?.role === 'admin' ? 'Administrador' : 'Estudiante'}
                </span>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Mail size={15} color="var(--text-muted)" /> {user?.email}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={15} color="var(--text-muted)" /> {t('profile.member_since')} {user?.fechaRegistro || '2026-01-15'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{t('profile.current_plan')}</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: user?.plan === 'Oro' ? '#FFD700' : user?.plan === 'Plata' ? '#C0C0C0' : '#CD7F32' }}>
                {t('profile.plan_prefix')} {user?.plan || 'Bronce'}
              </div>
            </div>

            <Link to="/pricing" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CreditCard size={15} /> {t('profile.change_plan')}
            </Link>
          </div>
        </div>

        {/* 2. RESUMEN DE BILLETERA DE TOKENS (CONSUME WALLETCONTEXT) */}
        <div className="grid-3">
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={24} fill="#F59E0B" color="#F59E0B" />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('wallet.current_token_balance')}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F59E0B', lineHeight: 1.2 }}>{balance} tk</div>
              <Link to="/wallet" style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontWeight: 600 }}>{t('wallet.view_tx_history')}</Link>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={24} color="var(--accent-cyan)" />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('wallet.current_month_usage')}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-cyan)', lineHeight: 1.2 }}>{monthlyConsumption} tk</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('wallet.unlocks_and_playground')}</span>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={24} color="var(--color-success)" />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('wallet.next_token_recharge')}</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>{nextRechargeDate}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600 }}>{t('wallet.automatic_by_plan')}</span>
            </div>
          </div>
        </div>

        {/* 3. SECCIÓN EXCLUSIVA PARA INSTRUCTOR / ADMIN (HUB DE AUTORÍA Y CMS) */}
        {isInstructorOrAdmin && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 className="heading-md" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-purple)' }}>
                  <Sparkles size={20} /> {t('profile.instructor_hub_title')}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {t('profile.instructor_hub_desc')}
                </p>
              </div>

              <Link to="/instructor" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ExternalLink size={14} /> {t('profile.full_instructor_panel')}
              </Link>
            </div>

            {/* Métricas Rápidas del Instructor */}
            <div className="grid-3">
              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', marginBottom: '0.25rem' }}>
                  <BookOpen size={16} /> <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t('profile.published_courses')}</span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{instructorCourses.length}</div>
              </div>
              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#F59E0B', marginBottom: '0.25rem' }}>
                  <User size={16} /> <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t('profile.enrolled_students')}</span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                  {instructorCourses.reduce((acc, c) => acc + (c.estudiantes || 0), 0)}
                </div>
              </div>
              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success)', marginBottom: '0.25rem' }}>
                  <CheckCircle2 size={16} /> <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t('profile.submissions_to_grade')}</span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                  {instructorSubmissions.filter(s => s.status === 'submitted').length}
                </div>
              </div>
            </div>

            {/* Accesos Directos a los Modales de Autoría */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <button
                onClick={() => setIsCourseModalOpen(true)}
                className="card"
                style={{
                  textAlign: 'left',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  border: '1px solid rgba(99, 102, 241, 0.25)'
                }}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-purple)' }}>
                  <BookOpen size={20} />
                </div>
                <strong style={{ fontSize: '0.95rem' }}>{t('profile.new_course_btn')}</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('profile.new_course_desc')}</span>
              </button>

              <button
                onClick={() => {
                  if (instructorCourses.length > 0) {
                    setSelectedCourseForContent(instructorCourses[0]);
                    setIsContentManagerOpen(true);
                  } else {
                    addToast(isSpanish ? 'Crea primero un curso para gestionar módulos y lecciones.' : 'Create a course first to manage modules and lessons.', 'warning');
                  }
                }}
                className="card"
                style={{
                  textAlign: 'left',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  border: '1px solid rgba(6, 182, 212, 0.25)'
                }}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
                  <Layers size={20} />
                </div>
                <strong style={{ fontSize: '0.95rem' }}>{t('profile.manage_modules_videos')}</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('profile.manage_modules_desc')}</span>
              </button>

              <button
                onClick={() => setIsExerciseModalOpen(true)}
                className="card"
                style={{
                  textAlign: 'left',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  border: '1px solid rgba(245, 158, 11, 0.25)'
                }}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>
                  <Code2 size={20} />
                </div>
                <strong style={{ fontSize: '0.95rem' }}>{t('profile.new_exercise_btn')}</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('profile.new_exercise_desc')}</span>
              </button>

              <button
                onClick={() => setIsLiveModalOpen(true)}
                className="card"
                style={{
                  textAlign: 'left',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  border: '1px solid rgba(239, 68, 68, 0.25)'
                }}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}>
                  <Radio size={20} className="animate-pulse" />
                </div>
                <strong style={{ fontSize: '0.95rem' }}>{t('profile.start_live_btn')}</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('profile.start_live_desc')}</span>
              </button>

              <button
                onClick={() => navigate('/instructor')}
                className="card"
                style={{
                  textAlign: 'left',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  border: '1px solid rgba(16, 185, 129, 0.25)'
                }}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success)' }}>
                  <FileText size={20} />
                </div>
                <strong style={{ fontSize: '0.95rem' }}>{t('profile.view_submissions_btn')}</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('profile.view_submissions_desc')}</span>
              </button>
            </div>
          </div>
        )}
        {/* 4. SECCIÓN EXCLUSIVA PARA ESTUDIANTES (PROGRESO Y CERTIFICADOS) */}
        {!isInstructorOrAdmin && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Progreso de Aprendizaje */}
            <div>
              <h2 className="heading-md" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={20} color="var(--accent-cyan)" /> {t('profile.courses_in_progress')}
              </h2>

              {continueWatching.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                  <BookOpen size={32} color="var(--accent-purple)" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
                  <p style={{ margin: 0 }}>{t('profile.no_started_lessons')}</p>
                  <Link to="/courses" className="btn btn-primary btn-sm" style={{ marginTop: '1rem', display: 'inline-flex' }}>
                    {t('profile.explore_catalog')}
                  </Link>
                </div>
              ) : (
                <div className="grid-2">
                  {continueWatching.map(({ course, lastLesson, progressPercent }) => (
                    <div key={course.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>{course.lenguaje}</span>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{t('profile.percent_completed', { pct: progressPercent })}</span>
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{course.titulo}</h3>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('profile.last_lesson_prefix')} {lastLesson.titulo}</div>
                      </div>

                      <div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                          <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: 'var(--accent-cyan)', transition: 'width 0.3s' }} />
                        </div>
                        <Link to={`/courses/${course.id}/lesson/${lastLesson.id}`} className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                          {t('profile.continue_watching')}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Certificados Obtenidos */}
            <div>
              <h2 className="heading-md" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={20} color="#F59E0B" /> {t('profile.certificates_earned')}
              </h2>

              {completedCourses.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                  <Award size={32} color="#F59E0B" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
                  <p style={{ margin: 0 }}>{t('profile.complete_to_unlock_cert')}</p>
                </div>
              ) : (
                <div className="grid-3">
                  {completedCourses.map(course => (
                    <div key={course.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success)', marginBottom: '0.5rem' }}>
                          <CheckCircle2 size={16} /> <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{t('profile.course_completed_badge')}</span>
                        </div>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{course.titulo}</h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('profile.instructor_prefix')}: {course.instructor}</span>
                      </div>

                      <button
                        onClick={() => setSelectedCertificate(course)}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                      >
                        <Award size={14} /> {t('profile.view_certificate')}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. FORMULARIOS DE EDICIÓN DE PERFIL Y SEGURIDAD */}
        <div className="grid-2" style={{ gap: '2rem' }}>
          {/* Formulario de Edición de Datos Personales */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 className="heading-sm" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} color="var(--accent-purple)" /> {t('profile.edit_personal_info')}
            </h2>

            <form onSubmit={handleUpdatePersonalInfo} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">{t('profile.full_name')}</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">{t('profile.email')}</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Selector de Foto Diferenciado por Rol */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                {isInstructorOrAdmin ? (
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>{t('profile.photo_upload_title')}</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--accent-purple)', flexShrink: 0 }}>
                        <img src={avatar} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleInstructorPhotoUpload}
                        className="form-input"
                        style={{ fontSize: '0.8rem' }}
                      />
                    </div>
                    {photoError && <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{photoError}</span>}
                    <span style={{ fontSize: '0.75rem', color: '#F59E0B', display: 'block', marginTop: '0.4rem' }}>
                      {t('profile.photo_preview_warning')}
                    </span>
                  </div>
                ) : (
                  <AvatarPicker
                    selectedAvatar={avatar}
                    onSelectAvatar={(av) => {
                      setAvatar(av.url);
                      setAvatarId(av.id);
                    }}
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={isUpdatingInfo}
                className="btn btn-primary"
                style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                <Check size={16} /> {isUpdatingInfo ? t('profile.saving') : t('profile.save_changes')}
              </button>
            </form>
          </div>

          {/* Formulario de Cambio de Contraseña */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 className="heading-sm" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={18} color="var(--accent-cyan)" /> {t('profile.security_title')}
            </h2>

            {pwdError && (
              <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid #EF4444', borderRadius: 'var(--radius-md)', color: '#EF4444', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {pwdError}
              </div>
            )}

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">{t('profile.current_password')}</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">{t('profile.new_password')}</label>
                  <span className="char-counter">{newPassword.length}/150</span>
                </div>
                <input
                  type="password"
                  required
                  maxLength={150}
                  className="form-input"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />

                {/* Checklist de Requisitos */}
                <div className="password-requirements" style={{ marginTop: '0.5rem' }}>
                  <div className="req-item" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: isLenValid ? 'var(--color-success)' : 'var(--text-muted)' }}>
                    {isLenValid ? <CheckCircle2 size={12} color="var(--color-success)" /> : <XCircle size={12} />}
                    <span>{t('profile.req_min_chars')}</span>
                  </div>
                  <div className="req-item" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: hasUpper ? 'var(--color-success)' : 'var(--text-muted)' }}>
                    {hasUpper ? <CheckCircle2 size={12} color="var(--color-success)" /> : <XCircle size={12} />}
                    <span>{t('profile.req_uppercase')}</span>
                  </div>
                  <div className="req-item" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: hasNumber ? 'var(--color-success)' : 'var(--text-muted)' }}>
                    {hasNumber ? <CheckCircle2 size={12} color="var(--color-success)" /> : <XCircle size={12} />}
                    <span>{t('profile.req_number')}</span>
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">{t('profile.confirm_new_password')}</label>
                <input
                  type="password"
                  required
                  maxLength={150}
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isChangingPwd}
                className="btn btn-secondary"
                style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                <Lock size={15} /> {isChangingPwd ? t('profile.updating_password') : t('profile.update_password_btn')}
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* MODAL DE CERTIFICADO DIGITAL */}
      {selectedCertificate && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedCertificate(null)}
          title={isSpanish ? 'Certificado Oficial de Finalización' : 'Official Certificate of Completion'}
          maxWidth="600px"
        >
          <div style={{
            textAlign: 'center',
            padding: '2rem 1.5rem',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
            border: '2px solid var(--accent-purple)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            alignItems: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F59E0B'
            }}>
              <Award size={36} />
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                {isSpanish ? 'CERTIFICADO DE ACREDITACIÓN PROFESIONAL' : 'PROFESSIONAL ACCREDITATION CERTIFICATE'}
              </div>
              <h2 className="heading-md" style={{ margin: '0.5rem 0' }}>{selectedCertificate.titulo}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto' }}>
                {isSpanish ? <>Se certifica que <strong>{user?.nombre}</strong> ha completado exitosamente la totalidad de módulos prácticos y lecciones técnicas en la plataforma <strong>MyCode Pro</strong>.</> : <>This certifies that <strong>{user?.nombre}</strong> has successfully completed all practical modules and technical lessons on the <strong>MyCode Pro</strong> platform.</>}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <div><strong>Instructor:</strong> {selectedCertificate.instructor}</div>
              <div><strong>{isSpanish ? 'Fecha' : 'Date'}:</strong> {new Date().toLocaleDateString(isSpanish ? 'es-ES' : 'en-US')}</div>
              <div><strong>ID:</strong> MC-{selectedCertificate.id}-{Date.now().toString().slice(-4)}</div>
            </div>

            <button onClick={() => setSelectedCertificate(null)} className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }}>
              {isSpanish ? 'Cerrar Certificado' : 'Close Certificate'}
            </button>
          </div>
        </Modal>
      )}

      {/* MODAL DE CREAR CURSO (REUTILIZADO) */}
      <CourseFormModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        user={user}
        onSaved={fetchInstructorData}
      />

      {/* MODAL DE GESTIÓN DE CONTENIDO (REUTILIZADO) */}
      {isContentManagerOpen && (
        <CourseContentManager
          isOpen={true}
          onClose={() => {
            setIsContentManagerOpen(false);
            setSelectedCourseForContent(null);
          }}
          course={selectedCourseForContent}
          onCourseUpdated={fetchInstructorData}
        />
      )}

      {/* MODAL DE INICIAR DIRECTO (REUTILIZADO) */}
      <StartLiveModal
        isOpen={isLiveModalOpen}
        onClose={() => setIsLiveModalOpen(false)}
        courses={instructorCourses}
        user={user}
        onStreamStarted={fetchInstructorData}
      />

      {/* MODAL DE CREAR EJERCICIO (REUTILIZADO) */}
      <ExerciseFormModal
        isOpen={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
        courses={instructorCourses}
        user={user}
        onSaved={fetchInstructorData}
      />
    </div>
  );
}
