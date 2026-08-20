import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Terminal, Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, ShieldAlert, Clock } from 'lucide-react';

export function LoginView() {
  const { login } = useAuth();
  const { t, isSpanish } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('shalom@mycode.pro');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [lockoutInfo, setLockoutInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check account lockout on mount & email change
  useEffect(() => {
    if (email.trim()) {
      const lockStatus = api.auth.checkAccountLock(email);
      if (lockStatus.locked) {
        setLockoutInfo(lockStatus);
      } else {
        setLockoutInfo(null);
      }
    }
  }, [email]);

  // RFC 5322 Email Validation Regex
  const validateEmail = (mail) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/.test(mail);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Check if account is locked
    const currentLock = api.auth.checkAccountLock(email);
    if (currentLock.locked) {
      setLockoutInfo(currentLock);
      setError(
        isSpanish
          ? `Cuenta bloqueada por seguridad. Intenta de nuevo en ${currentLock.timeFormatted}.`
          : `Account locked for security. Try again in ${currentLock.timeFormatted}.`
      );
      return;
    }

    if (!email.trim() || !validateEmail(email)) {
      setError(t('errors.email_rfc5322'));
      return;
    }

    if (!password || password.length < 6) {
      setError(t('errors.password_length'));
      return;
    }

    setLoading(true);
    const res = await login(email, password, rememberMe);
    setLoading(false);

    if (res.success) {
      // Reset failed attempts on success
      api.auth.resetFailedAttempts(email);
      setLockoutInfo(null);
      navigate('/dashboard');
    } else {
      // Record failed attempt
      const attemptRes = api.auth.recordFailedAttempt(email);
      
      if (attemptRes.locked) {
        setLockoutInfo(attemptRes);
        setError(
          isSpanish
            ? `Cuenta bloqueada por seguridad debido a 6 intentos fallidos. Intenta de nuevo en ${attemptRes.timeFormatted}. Se ha registrado un correo de alerta de seguridad.`
            : `Account locked for security due to 6 failed attempts. Try again in ${attemptRes.timeFormatted}. A security alert email was logged.`
        );
      } else {
        const remainingText = isSpanish
          ? `Credenciales incorrectas. Intentos restantes antes del bloqueo: ${attemptRes.remainingAttempts}.`
          : `Invalid credentials. Remaining attempts before lock: ${attemptRes.remainingAttempts}.`;
        setError(remainingText);
      }
    }
  };

  const isLocked = lockoutInfo && lockoutInfo.locked;

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem'
    }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            background: isLocked 
              ? 'linear-gradient(135deg, #EF4444, #F59E0B)' 
              : 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))',
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFF',
            margin: '0 auto 1rem',
            boxShadow: isLocked ? '0 0 20px rgba(239, 68, 68, 0.4)' : '0 0 20px var(--accent-purple-glow)'
          }}>
            {isLocked ? <ShieldAlert size={26} /> : <Terminal size={26} />}
          </div>
          <h1 className="heading-md" style={{ margin: 0 }}>{t('auth.login_title')}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            {t('auth.login_subtitle')}
          </p>
        </div>

        {/* Lockout Banner or Error Alert */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.6rem',
            padding: '0.85rem 1rem',
            backgroundColor: isLocked ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
            border: isLocked ? '1px solid #EF4444' : '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: isLocked ? '#EF4444' : 'var(--color-danger)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            lineHeight: 1.4
          }}>
            {isLocked ? (
              <Clock size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            ) : (
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            )}
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('auth.email_label')}</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@mycode.pro"
                className="form-input"
                style={{ paddingLeft: '2.6rem' }}
                disabled={isLocked}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('auth.password_label')}</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value.slice(0, 150))}
                maxLength={150}
                placeholder="••••••••"
                className="form-input"
                style={{ paddingLeft: '2.6rem', paddingRight: '2.6rem' }}
                disabled={isLocked}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                style={{
                  position: 'absolute',
                  right: '0.9rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
                className="btn-ghost"
                aria-label="Alternar visibilidad"
                disabled={isLocked}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            fontSize: '0.85rem'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--accent-purple)' }}
                disabled={isLocked}
              />
              <span style={{ color: 'var(--text-secondary)' }}>{t('auth.remember_me')}</span>
            </label>

            <Link
              to="/login"
              onClick={(e) => {
                e.preventDefault();
                alert(isSpanish 
                  ? 'En el prototipo frontend, tus credenciales son shalom@mycode.pro / password123' 
                  : 'In frontend prototype, your credentials are shalom@mycode.pro / password123'
                );
              }}
              style={{ color: 'var(--accent-purple)', fontWeight: 600 }}
            >
              {t('auth.forgot_password')}
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading || isLocked}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <span>{loading ? t('auth.logging_in') : isLocked ? (isSpanish ? 'Acceso Bloqueado' : 'Access Locked') : t('auth.login_btn')}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Footer Link */}
        <div style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)'
        }}>
          {t('auth.no_account')}{' '}
          <Link to="/register" style={{ color: 'var(--accent-purple)', fontWeight: 700 }}>
            {t('auth.register_link')}
          </Link>
        </div>
      </div>
    </div>
  );
}
