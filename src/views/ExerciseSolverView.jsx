import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { ArrowLeft, Play, Send, CheckCircle, AlertTriangle, Loader2, Save, BookmarkCheck } from 'lucide-react';
import { CodeEditor } from '../components/code/CodeEditor';

export function ExerciseSolverView() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, consumeTokens } = useWallet();
  const { t, isSpanish } = useLanguage();

  const [exercise, setExercise] = useState(null);
  const [code, setCode] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftSavedMessage, setDraftSavedMessage] = useState('');
  const [previousSubmission, setPreviousSubmission] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null); // 'success', 'error'
  const [loading, setLoading] = useState(true);
  
  const isRunningRef = useRef(false);
  const codeEditorRef = useRef(null);

  useEffect(() => {
    const fetchExercise = async () => {
      setLoading(true);
      const [ex, latestAttempt, studentSubs] = await Promise.all([
        api.exercises.getExerciseById(exerciseId),
        api.attempts.getLatestAttempt(user?.id || 'usr_101', exerciseId),
        api.submissions.getSubmissionsByStudent(user?.id || 'usr_101')
      ]);

      if (ex) {
        setExercise(ex);
        const prevSub = studentSubs.find(s => s.exerciseId === exerciseId);
        if (prevSub) {
          setPreviousSubmission(prevSub);
        }
        
        // Prioritize: latest attempt code -> previous submission code -> starter code
        if (latestAttempt?.code) {
          setCode(latestAttempt.code);
        } else if (prevSub?.code) {
          setCode(prevSub.code);
        } else {
          setCode(ex.initialCode || '');
        }
      }
      setLoading(false);
    };
    fetchExercise();
  }, [exerciseId, user?.id]);

  // Manejador centralizado de ejecución y cobro de tokens con soporte de input interactivo
  const handleRun = async (currentCode, lang, callbacks = {}) => {
    if (isRunningRef.current) return null;
    isRunningRef.current = true;

    const codeToRun = (currentCode || code || '').trim();
    if (!codeToRun) {
      isRunningRef.current = false;
      return {
        success: false,
        isUserError: true,
        error: 'El editor está vacío. Escribe tu código antes de compilar.'
      };
    }

    if (balance < 2) {
      isRunningRef.current = false;
      return {
        success: false,
        isUserError: true,
        error: 'Saldo insuficiente: Requiere 2 tokens para ejecutar. Recarga tu billetera o mejora tu plan.'
      };
    }

    setIsExecuting(true);
    setStatusMessage('Inicializando...');

    try {
      const tokenResult = await consumeTokens(2, `Compilación Ejercicio: ${exercise?.titulo}`);
      if (!tokenResult) {
        return {
          success: false,
          isUserError: true,
          error: 'No se pudo procesar la deducción de tokens.'
        };
      }

      const res = await api.code.executeCode(codeToRun, lang || exercise?.language || 'python', {
        ...callbacks,
        onStatusUpdate: (status) => {
          setStatusMessage(status);
          if (callbacks.onStatusUpdate) callbacks.onStatusUpdate(status);
        }
      });

      return res;
    } catch (err) {
      return {
        success: false,
        isSystemError: true,
        error: 'Error inesperado del sistema al ejecutar: ' + (err.message || String(err))
      };
    } finally {
      setStatusMessage('');
      setIsExecuting(false);
      isRunningRef.current = false;
    }
  };

  const handleSaveAttempt = async () => {
    if (!code.trim() || isSavingDraft) return;
    setIsSavingDraft(true);
    try {
      await api.attempts.saveAttempt({
        studentId: user?.id || 'usr_101',
        exerciseId: exercise.id,
        code,
        language: exercise.language,
        passed: true
      });
      setDraftSavedMessage(t('student.attempt_saved_toast') || 'Borrador guardado');
      setTimeout(() => setDraftSavedMessage(''), 3000);
    } catch (e) {
      console.error('Error saving attempt:', e);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setSubmissionStatus(null);
    
    // El envío de soluciones es gratuito (no descuenta tokens)
    const res = await api.submissions.submitExercise({
      studentId: user?.id || 'usr_101',
      studentName: user?.nombre || 'Estudiante',
      instructorId: exercise.instructorId || "ins_1",
      courseId: exercise.courseId,
      exerciseId: exercise.id,
      code: code,
      language: exercise.language
    });

    if (res.success) {
      setSubmissionStatus('success');
      await api.activity.recordActivity({
        studentId: user?.id || 'usr_101',
        type: 'exercise_submitted',
        title: isSpanish ? 'Solución Enviada' : 'Solution Submitted',
        titleEn: 'Solution Submitted',
        description: exercise.titulo,
        descriptionEn: exercise.tituloEn || exercise.titulo,
        courseId: exercise.courseId
      });
    } else {
      setSubmissionStatus('error');
    }
    setIsSubmitting(false);
  };

  if (loading) return <div className="container" style={{ paddingTop: '4rem' }}>Cargando ejercicio...</div>;
  if (!exercise) return <div className="container" style={{ paddingTop: '4rem' }}>Ejercicio no encontrado.</div>;

  const isRequiresCorrection = previousSubmission?.status === 'requires_correction';

  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header */}
        <div>
          <button onClick={() => navigate(-1)} className="btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: 0 }}>
            <ArrowLeft size={16} /> {t('exercise.back')}
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className="heading-lg" style={{ marginBottom: '0.5rem' }}>{exercise.titulo}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge badge-cyan" style={{ fontSize: '0.8rem' }}>{t('exercise.practice_module')}</span>
                {exercise.language === 'python' ? (
                  <span className="badge badge-purple" style={{ fontSize: '0.8rem' }}>Python 3.12 Wasm</span>
                ) : (
                  <span className="badge" style={{ fontSize: '0.8rem', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                    Java 21 (Simulación)
                  </span>
                )}
                {isRequiresCorrection && (
                  <span className="badge badge-gold" style={{ fontSize: '0.8rem' }}>
                    <AlertTriangle size={12} /> {t('student.status_requires_correction')}
                  </span>
                )}
              </div>
            </div>
            {submissionStatus === 'success' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success)', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)' }}>
                <CheckCircle size={18} />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t('exercise.solution_sent')}</span>
              </div>
            )}
            {draftSavedMessage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', backgroundColor: 'rgba(6, 182, 212, 0.1)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)' }}>
                <BookmarkCheck size={18} />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{draftSavedMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Previous Feedback Alert if Requires Correction */}
        {isRequiresCorrection && previousSubmission?.feedback && (
          <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)', border: '1px solid #F59E0B', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', color: '#F59E0B' }}>
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <AlertTriangle size={18} />
              <span>{t('student.previous_feedback_alert')}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              "{previousSubmission.feedback}"
            </p>
          </div>
        )}

        {/* Layout Split: Instructions | Sandbox */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
          
          {/* Instructions Sidebar */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>{t('exercise.instructions')}</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{exercise.content}</p>
            
            <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
              <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                  <AlertTriangle size={16} color="#F59E0B" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t('exercise.cost_alert')}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('exercise.cost_desc')}</p>
              </div>
            </div>
          </div>

          {/* Sandbox Area */}
          <div className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '0' }}>
            
            {/* Toolbar Principal Único */}
            <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-surface-secondary)', borderBottom: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className="badge badge-purple" style={{ textTransform: 'uppercase' }}>{exercise.language}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Saldo: <strong>{balance} tokens</strong></span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  onClick={handleSaveAttempt}
                  disabled={isSavingDraft}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  type="button"
                >
                  <Save size={14} />
                  <span>{isSavingDraft ? 'Guardando...' : (t('student.save_attempt_btn') || 'Guardar Borrador')}</span>
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || submissionStatus === 'success'}
                  className="btn btn-primary btn-sm" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  type="button"
                >
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>{isSubmitting ? 'Enviando...' : (isRequiresCorrection ? (t('student.btn_resubmit') || 'Reentregar Solución') : 'Enviar Solución')}</span>
                </button>
              </div>
            </div>

            {/* CodeEditor con terminal interactivo e input integrado */}
            <CodeEditor 
              language={exercise.language === 'python' ? 'python' : 'java'}
              filename={`exercise_${exercise.id}.${exercise.language === 'python' ? 'py' : 'java'}`}
              initialCode={code || exercise.initialCode}
              height="350px"
              onChange={(val) => setCode(val)}
              tokenCost={2}
            />
          </div>
        </div>
      </div>
    </div>
  );
}