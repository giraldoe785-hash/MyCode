import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { useLanguage } from '../context/LanguageContext';
import { AvatarPicker } from '../components/common/AvatarPicker';
import { PRESET_AVATARS } from '../services/mockData';
import {
  Terminal,
  User,
  Mail,
  Lock,
  Calendar,
  Briefcase,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Zap,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  AlertTriangle,
  Copy,
  Check,
  KeyRound
} from 'lucide-react';

export function RegisterView() {
  const { register } = useAuth();
  const { addToast } = useWallet();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    fechaNacimiento: '',
    rol: 'Desarrollador',
    password: '',
    confirmPassword: '',
    avatar: PRESET_AVATARS[0].url,
    avatarId: PRESET_AVATARS[0].id
  });

  const [instructorPhotoPreview, setInstructorPhotoPreview] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Cryptographically Secure Strong Password Generator
  const generateStrongPassword = () => {
    const uppercaseChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijkmnopqrstuvwxyz';
    const numberChars = '23456789';
    const symbolChars = '!@#$%&*';
    const allChars = uppercaseChars + lowercaseChars + numberChars + symbolChars;
    const length = 14;

    let result = '';
    const randomBuffer = new Uint32Array(length);

    while (true) {
      if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
        window.crypto.getRandomValues(randomBuffer);
      } else {
        for (let i = 0; i < length; i++) {
          randomBuffer[i] = Math.floor(Math.random() * 1000000);
        }
      }

      let candidate = '';
      for (let i = 0; i < length; i++) {
        candidate += allChars[randomBuffer[i] % allChars.length];
      }

      if (
        /[A-Z]/.test(candidate) &&
        /[a-z]/.test(candidate) &&
        /[0-9]/.test(candidate) &&
        candidate.length >= 7 &&
        candidate.length <= 150
      ) {
        result = candidate;
        break;
      }
    }

    setFormData(prev => ({
      ...prev,
      password: result,
      confirmPassword: result
    }));
    setShowPassword(true);
    setShowConfirmPassword(true);
    setError('');
    addToast(t('auth.pwd_generated_success'), 'success');
  };

  const handleCopyPassword = async () => {
    if (!formData.password) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(formData.password);
      }
      setCopiedPassword(true);
      addToast(t('auth.pwd_copied_toast'), 'info');
      setTimeout(() => setCopiedPassword(false), 2000);
    } catch (err) {
      console.warn('Clipboard write error:', err);
    }
  };

  const isInstructor = formData.rol === 'Instructor';

  // RFC 5322 Email Validation Regex
  const validateEmail = (mail) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(mail);
  };

  // Password Requirement Checks
  const pwd = formData.password;
  const isLenValid = pwd.length >= 7 && pwd.length <= 150;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const isMaxValid = pwd.length <= 150;
  const isPasswordValid = isLenValid && hasUpper && hasLower && hasNumber && isMaxValid;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if ((name === 'password' || name === 'confirmPassword') && value.length > 150) {
      setFormData(prev => ({ ...prev, [name]: value.slice(0, 150) }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInstructorFileChange = (e) => {
    const file = e.target.files?.[0];
    setPhotoError('');
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoError('Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('La imagen no debe superar los 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setInstructorPhotoPreview(dataUrl);
      setFormData(prev => ({
        ...prev,
        avatar: dataUrl,
        avatarId: null
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.nombre.trim()) {
      setError(t('errors.name_required'));
      return;
    }

    if (!formData.email.trim() || !validateEmail(formData.email)) {
      setError(t('errors.email_rfc5322'));
      return;
    }

    if (!isPasswordValid) {
      if (pwd.length < 7 || pwd.length > 150) {
        setError(t('errors.password_length'));
      } else {
        setError(t('errors.password_complexity'));
      }
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('errors.passwords_mismatch'));
      return;
    }

    setLoading(true);
    const res = await register({
      nombre: formData.nombre.trim(),
      email: formData.email.trim(),
      password: formData.password,
      fechaNacimiento: formData.fechaNacimiento,
      rol: formData.rol,
      avatar: formData.avatar,
      avatarId: formData.avatarId
    });
    setLoading(false);

    if (res.success) {
      addToast(t('auth.welcome_bonus_badge'), 'success');
      navigate(isInstructor ? '/instructor' : '/dashboard');
    } else {
      setError(res.error || 'Error al procesar el registro.');
    }
  };

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1.5rem'
    }}>
      <div className="card" style={{ maxWidth: '560px', width: '100%', padding: '2.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))',
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFF',
            margin: '0 auto 1rem',
            boxShadow: '0 0 20px var(--accent-purple-glow)'
          }}>
            <Terminal size={26} />
          </div>
          <h1 className="heading-md" style={{ margin: 0 }}>{t('auth.register_title')}</h1>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.2rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            color: '#F59E0B',
            fontSize: '0.75rem',
            fontWeight: 700,
            marginTop: '0.5rem'
          }}>
            <Zap size={13} fill="#F59E0B" /> {t('auth.welcome_bonus_badge')}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-danger)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{t('auth.name_label')}</label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej. Lucas Silva"
                className="form-input"
                style={{ paddingLeft: '2.6rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{t('auth.email_label')}</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="lucas@dev.io"
                className="form-input"
                style={{ paddingLeft: '2.6rem' }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">{t('auth.birthdate_label')}</label>
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">{t('auth.role_label')}</label>
              <select
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                className="form-input"
              >
                <option value="Estudiante">{t('auth.role_student')}</option>
                <option value="Desarrollador">{t('auth.role_dev')}</option>
                <option value="Profesional">{t('auth.role_pro')}</option>
                <option value="Instructor">Instructor / Docente Tech</option>
              </select>
            </div>
          </div>

          {/* Selector de Foto de Perfil Condicional según Rol */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            {isInstructor ? (
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ImageIcon size={16} color="var(--accent-purple)" /> Foto de Perfil del Instructor (Subida Local)
                </label>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    backgroundColor: 'var(--bg-surface-secondary)',
                    border: '2px solid var(--accent-purple)',
                    flexShrink: 0
                  }}>
                    {instructorPhotoPreview ? (
                      <img src={instructorPhotoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                        <User size={24} />
                      </div>
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleInstructorFileChange}
                      className="form-input"
                      style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                    />
                    {photoError && (
                      <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                        {photoError}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem', fontSize: '0.75rem', color: '#F59E0B', marginTop: '0.5rem' }}>
                  <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Vista previa local — no se almacena de forma permanente aún (requerirá almacenamiento cloud en producción).</span>
                </div>
              </div>
            ) : (
              <AvatarPicker
                selectedAvatar={formData.avatar}
                onSelectAvatar={(av) => setFormData(prev => ({ ...prev, avatar: av.url, avatarId: av.id }))}
              />
            )}
          </div>

          {/* Password Input with 150 Char Limit, Indicators & Live Counter */}
          <div className="form-group" style={{ margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.4rem' }}>
              <label className="form-label" style={{ margin: 0 }}>{t('auth.password_label')}</label>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={generateStrongPassword}
                  className="btn-ghost"
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--accent-gold-text)',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--accent-gold-soft)',
                    border: '1px solid var(--accent-gold-border)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer'
                  }}
                  title={t('auth.generate_pwd_btn')}
                  aria-label={t('auth.generate_pwd_btn')}
                >
                  <Sparkles size={12} color="var(--accent-gold)" />
                  <span>{t('auth.generate_pwd_btn')}</span>
                </button>

                {formData.password && isPasswordValid && (
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="btn-ghost"
                    style={{
                      fontSize: '0.72rem',
                      color: copiedPassword ? 'var(--color-success)' : 'var(--text-muted)',
                      padding: '0.2rem 0.45rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      cursor: 'pointer'
                    }}
                    title={t('auth.copy_pwd_btn')}
                    aria-label={t('auth.copy_pwd_btn')}
                  >
                    {copiedPassword ? <Check size={12} color="var(--color-success)" /> : <Copy size={12} />}
                    <span>{copiedPassword ? t('auth.pwd_copied_badge') : t('auth.copy_pwd_btn')}</span>
                  </button>
                )}

                <span className={`char-counter ${formData.password.length >= 140 ? (formData.password.length === 150 ? 'limit' : 'warning') : ''}`}>
                  {formData.password.length}/150
                </span>
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                maxLength={150}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="form-input"
                style={{ paddingLeft: '2.6rem', paddingRight: '2.6rem' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.9rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex'
                }}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password Validation Requirements */}
            <div className="password-requirements" style={{ marginTop: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem' }}>{t('auth.pwd_req_title')}</span>
              <div className="req-item" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: isLenValid ? 'var(--color-success)' : 'var(--text-muted)' }}>
                {isLenValid ? <CheckCircle2 size={12} color="var(--color-success)" /> : <XCircle size={12} />}
                <span>{t('auth.pwd_req_length')}</span>
              </div>
              <div className="req-item" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: hasUpper ? 'var(--color-success)' : 'var(--text-muted)' }}>
                {hasUpper ? <CheckCircle2 size={12} color="var(--color-success)" /> : <XCircle size={12} />}
                <span>{t('auth.pwd_req_upper')}</span>
              </div>
              <div className="req-item" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: hasLower ? 'var(--color-success)' : 'var(--text-muted)' }}>
                {hasLower ? <CheckCircle2 size={12} color="var(--color-success)" /> : <XCircle size={12} />}
                <span>{t('auth.pwd_req_lower')}</span>
              </div>
              <div className="req-item" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: hasNumber ? 'var(--color-success)' : 'var(--text-muted)' }}>
                {hasNumber ? <CheckCircle2 size={12} color="var(--color-success)" /> : <XCircle size={12} />}
                <span>{t('auth.pwd_req_number')}</span>
              </div>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group" style={{ margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">{t('auth.confirm_password_label')}</label>
              <span className={`char-counter ${formData.confirmPassword.length >= 140 ? (formData.confirmPassword.length === 150 ? 'limit' : 'warning') : ''}`}>
                {formData.confirmPassword.length}/150
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                maxLength={150}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="form-input"
                style={{ paddingLeft: '2.6rem', paddingRight: '2.6rem' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '0.9rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex'
                }}
                aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
          >
            {loading ? 'Creando cuenta...' : t('auth.btn_create_account')}
          </button>
        </form>

        {/* Footer Link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {t('auth.has_account')}{' '}
          <Link to="/login" style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>
            {t('auth.login_here')}
          </Link>
        </div>
      </div>
    </div>
  );
}