import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '../../context/WalletContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { TerminalConsole } from './TerminalConsole';
import { Modal } from '../common/Modal';
import {
  Play,
  Copy,
  Check,
  RotateCcw,
  Zap,
  Code2,
  Loader2,
  HelpCircle,
  MessageSquare
} from 'lucide-react';

export function CodeEditor({
  initialCode = '',
  language = 'python',
  filename = 'main.py',
  tokenCost = 2,
  height = '320px',
  onExecute,
  onChange,
  onRun,
  hideRunButton = false,
  hideToolbar = false
}) {
  const { balance, deductTokens, transactions } = useWallet();
  const { t } = useLanguage();
  const [code, setCode] = useState(initialCode);
  
  // Estados del Sandbox: 'idle' | 'running' | 'waiting_for_input' | 'success' | 'error' | 'unsupported'
  const [status, setStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [inputPrompt, setInputPrompt] = useState('');
  
  // Estado para modales de interacción (ej. JOptionPane de Java)
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    type: 'message', // 'message' | 'input'
    title: '',
    message: '',
    inputValue: '',
    resolve: null
  });

  const isRunningRef = useRef(false);
  const inputResolverRef = useRef(null);

  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('output');
  const [testResults, setTestResults] = useState(null);

  // Sincronizar código si initialCode cambia desde el padre
  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 8) }, (_, i) => i + 1);

  // Filtrar transacciones reales de consumo de tokens
  const consumptionTransactions = (transactions || []).filter(
    tx => tx.tipo === 'Consumo' || tx.tipo === 'Consumo Sandbox' || tx.cambio < 0
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    handleCancel();
    setCode(initialCode);
    if (onChange) onChange(initialCode);
    setOutput('');
    setError(null);
    setTestResults(null);
    setStatus('idle');
  };

  const handleClear = () => {
    setOutput('');
    setError(null);
    setTestResults(null);
    if (status !== 'running' && status !== 'waiting_for_input') {
      setStatus('idle');
    }
  };

  const handleCodeChange = (e) => {
    const val = e.target.value;
    setCode(val);
    if (onChange) onChange(val);
  };

  // Manejador cuando el usuario envía un valor en el input de la consola
  const handleSubmitInput = (val) => {
    if (inputResolverRef.current) {
      const resolver = inputResolverRef.current;
      inputResolverRef.current = null;
      setInputPrompt('');
      setStatus('running');
      resolver(val);
    }
  };

  // Manejadores para diálogos interactivos (JOptionPane)
  const handleDialogAccept = () => {
    if (dialogState.resolve) {
      dialogState.resolve(true);
    }
    setDialogState(prev => ({ ...prev, isOpen: false, resolve: null }));
  };

  const handleDialogSubmitInput = (e) => {
    if (e) e.preventDefault();
    if (dialogState.resolve) {
      dialogState.resolve(dialogState.inputValue);
    }
    setDialogState(prev => ({ ...prev, isOpen: false, resolve: null }));
  };

  const handleDialogSelectOption = (idx) => {
    if (dialogState.resolve) {
      dialogState.resolve(idx);
    }
    setDialogState(prev => ({ ...prev, isOpen: false, resolve: null }));
  };

  const handleDialogCancel = () => {
    if (dialogState.resolve) {
      if (dialogState.type === 'confirm' || dialogState.type === 'option') {
        dialogState.resolve(-1); // CLOSED_OPTION (-1)
      } else {
        dialogState.resolve(null); // null en Java al cancelar input
      }
    }
    setDialogState(prev => ({ ...prev, isOpen: false, resolve: null }));
  };

  // Manejador para cancelar/detener la ejecución activa
  const handleCancel = () => {
    if (inputResolverRef.current) {
      inputResolverRef.current = null;
    }
    if (dialogState.resolve) {
      dialogState.resolve(null);
      setDialogState(prev => ({ ...prev, isOpen: false, resolve: null }));
    }
    api.code.cancelExecution();
    setStatus('idle');
    setStatusMessage('');
    setInputPrompt('');
    isRunningRef.current = false;
  };

  const handleRunCode = async () => {
    // 1. Bloqueo síncrono contra doble clic
    if (isRunningRef.current) return;
    isRunningRef.current = true;

    // 2. Validación de código no vacío
    const trimmed = (code || '').trim();
    if (!trimmed) {
      setError('El editor está vacío. Ingrese código para compilar.');
      setActiveTab('errors');
      setStatus('error');
      isRunningRef.current = false;
      return;
    }

    // 3. Delegación al padre si se pasó onRun
    if (onRun) {
      try {
        setStatus('running');
        setError(null);
        setOutput('');
        setStatusMessage('Ejecutando...');
        
        const res = await onRun(code, language, {
          onOutput: (chunk) => {
            setOutput(prev => prev ? `${prev}\n${chunk}` : chunk);
          },
          onInputRequest: (promptText) => {
            return new Promise((resolve) => {
              setInputPrompt(promptText);
              setStatus('waiting_for_input');
              inputResolverRef.current = resolve;
            });
          },
          onDialogRequest: (dialogConfig) => {
            return new Promise((resolve) => {
              setDialogState({
                isOpen: true,
                type: dialogConfig.type || 'message',
                title: dialogConfig.title || (dialogConfig.type === 'input' ? 'JOptionPane — Input' : 'JOptionPane — Mensaje'),
                message: dialogConfig.message || '',
                messageType: dialogConfig.messageType,
                options: dialogConfig.options || [],
                inputValue: '',
                resolve
              });
            });
          },
          onStatusUpdate: (msg) => setStatusMessage(msg)
        });

        if (res) {
          if (res.isUnsupported || res.status === 'unsupported') {
            setError(res.error);
            setActiveTab('errors');
            setStatus('unsupported');
          } else if (res.success) {
            setOutput(res.output || 'Ejecución finalizada con éxito.');
            setActiveTab('output');
            setStatus('success');
          } else {
            setError(res.error || 'Error durante la ejecución.');
            setActiveTab('errors');
            setStatus(res.isCancelled ? 'idle' : 'error');
          }
          if (onExecute) onExecute(res);
        }
      } catch (err) {
        setError('Error al ejecutar: ' + (err.message || String(err)));
        setActiveTab('errors');
        setStatus('error');
      } finally {
        setStatusMessage('');
        setInputPrompt('');
        isRunningRef.current = false;
      }
      return;
    }

    // 4. Modo de ejecución autónoma (Playground / Sandbox directo)
    if (tokenCost > 0 && balance < tokenCost) {
      setError(`Saldo insuficiente: Requiere ${tokenCost} tokens para compilar. Recarga tu billetera.`);
      setActiveTab('errors');
      setStatus('error');
      isRunningRef.current = false;
      return;
    }

    setStatus('running');
    setError(null);
    setOutput('');
    setStatusMessage('Inicializando...');

    try {
      // Cobro de tokens al inicio de la ejecución
      if (tokenCost > 0) {
        const success = await deductTokens(tokenCost, `Compilación de ${filename} (${language})`);
        if (!success) {
          setError('No se pudo procesar el cobro en tokens.');
          setActiveTab('errors');
          setStatus('error');
          isRunningRef.current = false;
          return;
        }
      }

      const res = await api.code.executeCode(code, language, {
        onOutput: (chunk) => {
          setOutput(prev => prev ? `${prev}\n${chunk}` : chunk);
        },
        onInputRequest: (promptText) => {
          return new Promise((resolve) => {
            setInputPrompt(promptText);
            setStatus('waiting_for_input');
            inputResolverRef.current = resolve;
          });
        },
        onDialogRequest: (dialogConfig) => {
          return new Promise((resolve) => {
            setDialogState({
              isOpen: true,
              type: dialogConfig.type || 'message',
              title: dialogConfig.title || (dialogConfig.type === 'input' ? 'JOptionPane — Input' : 'JOptionPane — Mensaje'),
              message: dialogConfig.message || '',
              messageType: dialogConfig.messageType,
              options: dialogConfig.options || [],
              inputValue: '',
              resolve
            });
          });
        },
        onStatusUpdate: (status) => setStatusMessage(status)
      });

      if (res.isTestRun) {
        setTestResults(res);
        setOutput(res.output);
        setActiveTab('tests');
        if (res.success) {
          setStatus('success');
          setError(null);
        } else {
          setStatus('error');
          setError(res.error);
        }
      } else if (res.isCancelled) {
        setStatus('idle');
        setOutput(res.output || '');
      } else if (res.isUnsupported || res.status === 'unsupported') {
        setError(res.error);
        setActiveTab('errors');
        setStatus('unsupported');
      } else if (res.success) {
        setOutput(res.output);
        setActiveTab('output');
        setStatus('success');
      } else {
        setError(res.error);
        if (res.output) setOutput(res.output);
        setActiveTab('errors');
        setStatus('error');
      }

      if (onExecute) onExecute(res);
    } catch (e) {
      setError('Error inesperado durante la ejecución: ' + (e.message || String(e)));
      setActiveTab('errors');
      setStatus('error');
    } finally {
      setStatusMessage('');
      setInputPrompt('');
      isRunningRef.current = false;
    }
  };

  return (
    <div className="code-box-container">
      {/* Editor Header - Robust Flex Layout with Prioritized Actions */}
      {!hideToolbar && (
        <div className="code-box-header" style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.4rem 0.65rem',
          padding: '0.55rem 0.85rem',
          minWidth: 0
        }}>
          {/* Left: Metadata & Informational Badges (flexible & compressible) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            minWidth: 0,
            flex: '1 1 auto',
            overflow: 'hidden'
          }}>
            {/* Traffic Lights */}
            <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#10B981' }} />
            </div>

            {/* Filename */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.825rem',
              color: '#9CA3AF',
              marginLeft: '0.25rem',
              flexShrink: 0
            }}>
              <Code2 size={14} color="var(--accent-cyan)" />
              <strong style={{ whiteSpace: 'nowrap' }}>{filename}</strong>
            </div>

            {/* Runtime Indicator Badge (Gracefully compressible on narrow panels) */}
            {language === 'python' ? (
              <span
                className="badge badge-purple"
                style={{
                  fontSize: '0.68rem',
                  padding: '0.15rem 0.4rem',
                  whiteSpace: 'nowrap',
                  flexShrink: 1,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
                title="Python 3.12 (Pyodide Wasm)"
              >
                Python 3.12 (Pyodide)
              </span>
            ) : language === 'java' ? (
              <span
                className="badge"
                style={{
                  fontSize: '0.68rem',
                  padding: '0.15rem 0.4rem',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  color: '#F59E0B',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  whiteSpace: 'nowrap',
                  flexShrink: 1,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
                title="Simulador educativo frontend de Java"
              >
                Simulación Java
              </span>
            ) : null}
          </div>

          {/* Right: Actions & Primary Controls (Highest Priority: Execute never shrinks) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            flexShrink: 0,
            marginLeft: 'auto'
          }}>
            {tokenCost > 0 && !onRun && (
              <span
                className="token-pill"
                style={{
                  fontSize: '0.72rem',
                  padding: '0.2rem 0.45rem',
                  whiteSpace: 'nowrap',
                  flexShrink: 1
                }}
                title={`${tokenCost} tokens por ejecución`}
              >
                <Zap size={11} fill="#F59E0B" /> {tokenCost} tk
              </span>
            )}

            <button
              onClick={handleCopy}
              className="btn btn-secondary btn-sm"
              style={{
                padding: '0.32rem 0.55rem',
                fontSize: '0.75rem',
                flexShrink: 0,
                whiteSpace: 'nowrap'
              }}
              title={t('sandboxUI.copy_tooltip')}
              type="button"
            >
              {copied ? <Check size={13} color="var(--color-success)" /> : <Copy size={13} />}
              <span className="code-btn-label">{copied ? t('sandboxUI.copied') : t('sandboxUI.copy')}</span>
            </button>

            <button
              onClick={handleReset}
              className="btn btn-secondary btn-sm"
              style={{
                padding: '0.32rem 0.45rem',
                fontSize: '0.75rem',
                flexShrink: 0
              }}
              title={t('sandboxUI.reset_tooltip')}
              type="button"
            >
              <RotateCcw size={13} />
            </button>

            {!hideRunButton && (
              <button
                onClick={handleRunCode}
                disabled={status === 'running' || status === 'waiting_for_input'}
                className="btn btn-primary btn-sm"
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  minWidth: 'fit-content'
                }}
                type="button"
              >
                {status === 'running' || status === 'waiting_for_input' ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Play size={13} fill="#FFF" />
                )}
                <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {status === 'running' || status === 'waiting_for_input' ? (statusMessage || t('sandboxUI.running')) : t('sandboxUI.run')}
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Editor Main Text Area */}
      <div className="code-editor-layout" style={{ minHeight: height }}>
        <div className="code-line-numbers" aria-hidden="true">
          {lineNumbers.map(n => (
            <div key={n}>{n}</div>
          ))}
        </div>
        <textarea
          value={code}
          onChange={handleCodeChange}
          spellCheck={false}
          className="code-textarea"
          aria-label={`Editor de código ${language}`}
        />
      </div>

      {/* Consola y Terminal Interactivo */}
      <TerminalConsole
        status={status}
        statusMessage={statusMessage}
        output={output}
        error={error}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tokenCost={tokenCost}
        testResults={testResults}
        consumptionTransactions={consumptionTransactions}
        inputPrompt={inputPrompt}
        onSubmitInput={handleSubmitInput}
        onCancel={handleCancel}
        onClear={handleClear}
      />

      {/* Modal Interactivo para JOptionPane (Swing Simulado) */}
      <Modal
        isOpen={dialogState.isOpen}
        onClose={handleDialogCancel}
        title={dialogState.title}
        maxWidth="480px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{
              padding: '0.65rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: dialogState.type === 'input' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: dialogState.type === 'input' ? 'var(--accent-purple)' : 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {dialogState.type === 'input' ? <HelpCircle size={24} /> : <MessageSquare size={24} />}
            </div>
            <div style={{
              fontSize: '1rem',
              color: 'var(--text-primary)',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              flex: 1,
              marginTop: '0.15rem'
            }}>
              {dialogState.message}
            </div>
          </div>

          {dialogState.type === 'input' ? (
            <form onSubmit={handleDialogSubmitInput} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', minWidth: 0 }}>
              <input
                type="text"
                autoFocus
                value={dialogState.inputValue}
                onChange={(e) => setDialogState(prev => ({ ...prev, inputValue: e.target.value }))}
                style={{
                  minHeight: '44px',
                  height: '44px',
                  padding: '0.6rem 0.85rem',
                  fontSize: '0.95rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-surface-secondary)',
                  color: 'var(--text-primary)',
                  width: '100%',
                  minWidth: 0,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                placeholder="Escribe tu respuesta aquí..."
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handleDialogCancel}
                  className="btn btn-secondary btn-sm"
                  style={{ minWidth: '90px' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ minWidth: '90px' }}
                >
                  Aceptar
                </button>
              </div>
            </form>
          ) : dialogState.type === 'confirm' ? (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => handleDialogSelectOption(1)}
                className="btn btn-secondary btn-sm"
                style={{ minWidth: '90px' }}
              >
                No
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => handleDialogSelectOption(0)}
                className="btn btn-primary btn-sm"
                style={{ minWidth: '90px' }}
              >
                Sí
              </button>
            </div>
          ) : dialogState.type === 'option' ? (
            <div style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '0.75rem' }}>
              {(dialogState.options || []).map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  autoFocus={idx === 0}
                  onClick={() => handleDialogSelectOption(idx)}
                  className={"btn btn-sm " + (idx === 0 ? "btn-primary" : "btn-secondary")}
                  style={{ minWidth: '90px' }}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                autoFocus
                onClick={handleDialogAccept}
                className="btn btn-primary btn-sm"
                style={{ minWidth: '90px' }}
              >
                Aceptar
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}