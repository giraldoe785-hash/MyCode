import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Terminal,
  CheckCircle2,
  XCircle,
  FlaskConical,
  AlertCircle,
  AlertTriangle,
  Zap,
  Send,
  Square,
  Trash2,
  Copy,
  Check,
  Loader2,
  CornerDownLeft
} from 'lucide-react';

export function TerminalConsole({

  status = 'idle',
  testResults = null, // 'idle' | 'running' | 'waiting_for_input' | 'success' | 'error' | 'unsupported'
  statusMessage = '',
  output = '',
  error = null,
  activeTab = 'output',
  setActiveTab,
  tokenCost = 2,
  consumptionTransactions = [],
  inputPrompt = '',
  onSubmitInput,
  onCancel,
  onClear
}) {
  const { t } = useLanguage();
  const [inputValue, setInputValue] = useState('');
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);
  const terminalEndRef = useRef(null);

  // Auto-focus en el campo de entrada cuando el programa espera un input()
  useEffect(() => {
    if (status === 'waiting_for_input') {
      setActiveTab('output');
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    }
  }, [status, setActiveTab]);

  // Auto-scroll al final del terminal cuando se genera nueva salida
  useEffect(() => {
    if (terminalEndRef.current && activeTab === 'output') {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [output, status]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (status !== 'waiting_for_input') return;
    const valToSend = inputValue;
    setInputValue('');
    if (onSubmitInput) {
      onSubmitInput(valToSend);
    }
  };

  const handleCopy = () => {
    const textToCopy = activeTab === 'errors' ? (error || '') : (output || '');
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-terminal-output">
      {/* Barra Superior del Terminal con Pestañas y Acciones */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '0.5rem',
        marginBottom: '0.75rem'
      }}>
        {/* Pestañas Accesibles WAI-ARIA */}
        <div
          role="tablist"
          aria-label="Pestañas de terminal y consola"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', minWidth: 0, overflow: 'hidden' }}
        >
          <button
            id="tab-output"
            role="tab"
            aria-selected={activeTab === 'output'}
            aria-controls="panel-output"
            tabIndex={activeTab === 'output' ? 0 : -1}
            onClick={() => setActiveTab('output')}
            type="button"
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: activeTab === 'output' ? 'var(--color-success)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.2rem 0.4rem',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <Terminal size={14} /> {t('sandboxUI.output')}
          </button>

          
          {testResults && (
            <button
              id="tab-tests"
              role="tab"
              aria-selected={activeTab === 'tests'}
              aria-controls="panel-tests"
              tabIndex={activeTab === 'tests' ? 0 : -1}
              onClick={() => setActiveTab('tests')}
              type="button"
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: activeTab === 'tests' ? (testResults.success ? 'var(--color-success)' : '#EF4444') : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.2rem 0.4rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <FlaskConical size={14} /> {t('sandboxUI.tests')} ({testResults.passedTests}/{testResults.totalTests})
            </button>
          )}

          <button
            id="tab-errors"
            role="tab"
            aria-selected={activeTab === 'errors'}
            aria-controls="panel-errors"
            tabIndex={activeTab === 'errors' ? 0 : -1}
            onClick={() => setActiveTab('errors')}
            type="button"
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: activeTab === 'errors' ? (status === 'unsupported' ? '#F59E0B' : '#EF4444') : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.2rem 0.4rem',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            {status === 'unsupported' ? <AlertTriangle size={14} color="#F59E0B" /> : <AlertCircle size={14} />}
            {status === 'unsupported' ? t('sandboxUI.warning') : `${t('sandboxUI.errors')}${error ? ' (1)' : ''}`}
          </button>

          <button
            id="tab-tokens"
            role="tab"
            aria-selected={activeTab === 'tokens'}
            aria-controls="panel-tokens"
            tabIndex={activeTab === 'tokens' ? 0 : -1}
            onClick={() => setActiveTab('tokens')}
            type="button"
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: activeTab === 'tokens' ? '#F59E0B' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.2rem 0.4rem',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <Zap size={14} /> {t('sandboxUI.tokens')} ({consumptionTransactions.length})
          </button>
        </div>

        {/* Acciones de Consola y Badge de Estado */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Badge de Estado Activo */}
          {status === 'running' && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.75rem',
              color: 'var(--accent-cyan)',
              backgroundColor: 'rgba(6, 182, 212, 0.1)',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(6, 182, 212, 0.3)'
            }}>
              <Loader2 size={12} className="animate-spin" /> {statusMessage || t('sandboxUI.running')}
            </span>
          )}

          {status === 'waiting_for_input' && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.75rem',
              color: '#F59E0B',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              fontWeight: 600
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B', animation: 'pulse 1.5s infinite' }} />
              {t('sandboxUI.waiting_input')}
            </span>
          )}

          {status === 'unsupported' && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.75rem',
              color: '#F59E0B',
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              fontWeight: 600
            }}>
              <AlertTriangle size={12} color="#F59E0B" /> {t('sandboxUI.unsupported')}
            </span>
          )}

          {/* Botón Detener si está corriendo o esperando input */}
          {(status === 'running' || status === 'waiting_for_input') && onCancel && (
            <button
              onClick={onCancel}
              className="btn btn-secondary btn-sm"
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.6rem',
                color: '#EF4444',
                borderColor: 'rgba(239, 68, 68, 0.3)'
              }}
              title={t('sandboxUI.stop_tooltip')}
              type="button"
            >
              <Square size={12} fill="#EF4444" /> {t('sandboxUI.stop')}
            </button>
          )}

          {/* Botón Limpiar */}
          <button
            onClick={onClear}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: 'var(--text-muted)' }}
            title={t('sandboxUI.clear_tooltip')}
            type="button"
          >
            <Trash2 size={13} /> {t('sandboxUI.clear')}
          </button>

          {/* Botón Copiar */}
          <button
            onClick={handleCopy}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: 'var(--text-muted)' }}
            title={t('sandboxUI.copy_console_tooltip')}
            type="button"
          >
            {copied ? <Check size={13} color="var(--color-success)" /> : <Copy size={13} />}
          </button>
        </div>
      </div>

      {/* Contenido de Paneles */}
      
      {activeTab === 'tests' && testResults && (
        <div
          id="panel-tests"
          role="tabpanel"
          aria-labelledby="tab-tests"
          tabIndex={0}
          style={{ minHeight: '80px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          {/* Header Banner - Transparencia Obligatoria */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.5rem 0.75rem',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: 'var(--radius-md)',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <FlaskConical size={16} color="#F59E0B" />
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                {t('sandboxUI.test_banner_title')}
              </strong>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {t('sandboxUI.test_banner_subtitle')}
            </span>
          </div>

          {/* Test Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {(testResults.tests || []).map((testItem, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: testItem.passed ? 'rgba(16, 185, 129, 0.06)' : 'rgba(239, 68, 68, 0.06)',
                  borderLeft: `3px solid ${testItem.passed ? '#10B981' : '#EF4444'}`,
                  borderRadius: '0 var(--radius-sm) var(--radius-sm) 0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 600, fontSize: '0.85rem' }}>
                    {testItem.passed ? <CheckCircle2 size={15} color="#10B981" /> : <XCircle size={15} color="#EF4444" />}
                    <span style={{ color: testItem.passed ? '#10B981' : '#EF4444', fontFamily: 'var(--font-mono)' }}>
                      {testItem.name}()
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: testItem.passed ? '#10B981' : '#EF4444',
                    textTransform: 'uppercase'
                  }}>
                    {testItem.passed ? t('sandboxUI.test_passed') : t('sandboxUI.test_failed')}
                  </span>
                </div>

                {/* Assertion details for failed tests */}
                {!testItem.passed && testItem.failureReason && (
                  <div style={{
                    fontSize: '0.775rem',
                    color: '#EF4444',
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    padding: '0.35rem 0.5rem',
                    borderRadius: '4px',
                    marginTop: '0.25rem'
                  }}>
                    {testItem.failureReason}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Test Summary Line */}
          <div style={{
            fontSize: '0.8rem',
            color: testResults.success ? '#10B981' : '#F59E0B',
            fontWeight: 600,
            marginTop: '0.25rem'
          }}>
            {t('sandboxUI.test_summary', { passed: testResults.passedTests, total: testResults.totalTests, percent: Math.round((testResults.passedTests / testResults.totalTests) * 100), duration: testResults.duration || '0.05s' })}
          </div>
        </div>
      )}

      {activeTab === 'output' && (
        <div
          id="panel-output"
          role="tabpanel"
          aria-labelledby="tab-output"
          tabIndex={0}
          style={{ minHeight: '80px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
        >
          <pre style={{
            margin: 0,
            whiteSpace: 'pre-wrap',
            color: '#10B981',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            lineHeight: 1.6
          }}>
            {output || t('sandboxUI.empty_output')}
          </pre>

          {/* Formulario Interactivo de Entrada para input() */}
          {status === 'waiting_for_input' && (
            <form
              onSubmit={handleSubmit}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--bg-surface)',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #F59E0B',
                boxShadow: '0 0 12px rgba(245, 158, 11, 0.2)',
                marginTop: '0.5rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#F59E0B', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                <Terminal size={14} />
                <span>{inputPrompt ? inputPrompt.trim() : t('sandboxUI.input_label')}</span>
              </div>

              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t('sandboxUI.input_placeholder')}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem'
                }}
                autoFocus
              />

              <button
                type="submit"
                className="btn btn-primary btn-sm"
                style={{
                  padding: '0.3rem 0.75rem',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  backgroundColor: '#F59E0B',
                  borderColor: '#F59E0B',
                  color: '#000',
                  fontWeight: 700
                }}
              >
                <span>{t('sandboxUI.send')}</span>
                <CornerDownLeft size={13} />
              </button>
            </form>
          )}

          <div ref={terminalEndRef} />
        </div>
      )}

      {activeTab === 'errors' && (
        <div
          id="panel-errors"
          role="tabpanel"
          aria-labelledby="tab-errors"
          tabIndex={0}
          style={{
            color: status === 'unsupported' ? '#F59E0B' : '#EF4444',
            minHeight: '80px',
            whiteSpace: 'pre-wrap',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            lineHeight: 1.5
          }}
        >
          {error || t('sandboxUI.no_errors')}
        </div>
      )}

      {activeTab === 'tokens' && (
        <div
          id="panel-tokens"
          role="tabpanel"
          aria-labelledby="tab-tokens"
          tabIndex={0}
          style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', minHeight: '80px' }}
        >
          {consumptionTransactions.length === 0 ? (
            <p>{t('sandboxUI.no_tokens', { tokens: tokenCost })}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {consumptionTransactions.slice(0, 6).map((tx) => (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.2rem' }}>
                  <span>[{tx.fecha}] {tx.descripcion}</span>
                  <span style={{ color: '#F59E0B', fontWeight: 700 }}>{tx.cambio} tokens</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}