import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { CodeEditor } from '../components/code/CodeEditor';
import {
  Code2,
  Terminal,
  Zap,
  Sparkles,
  Shield,
  Columns,
  Cpu
} from 'lucide-react';

const DEFAULT_PYTHON_CODE = `# Sandbox Python 3 (Pyodide WebAssembly)
def saludar(nombre):
    return f"¡Hola {nombre}, bienvenido a MyCode!"

print(saludar("Desarrollador"))

# Algoritmo de prueba
numeros = [1, 2, 3, 4, 5]
cuadrados = [x ** 2 for x in numeros]
print(f"Cuadrados: {cuadrados}")
`;

const PYTHON_REQUESTS_CODE = `# Petición HTTP Real en Python con Requests (Pyodide Wasm)
import requests

url = "https://jsonplaceholder.typicode.com/todos/1"
print(f"Consultando API pública: {url} ...")

try:
    response = requests.get(url)
    print(f"Status Code: {response.status_code}")
    print("Respuesta JSON recibida:")
    data = response.json()
    print(data)
    print(f"ID de Tarea: {data.get('id')} | Título: '{data.get('title')}'")
    print(f"Completada: {data.get('completed')}")
except Exception as e:
    print(f"Error al consultar endpoint: {e}")
`;

const DEFAULT_JAVA_CODE = `// Sandbox Educativo Java (Simulación Frontend)
public class Main {
    public static void main(String[] args) {
        String mensaje = "¡Hola desde Java en MyCode!";
        System.out.println(mensaje);
        
        int a = 15;
        int b = 25;
        int suma = a + b;
        System.out.println("Suma: " + suma);
    }
}
`;

const JAVA_JUNIT_CODE = `// Tests Unitarios en Java (Simulación Educativa JUnit 5)
public class CalculadoraTest {
    public static int sumar(int a, int b) {
        return a + b;
    }

    public static int restar(int a, int b) {
        return a - b;
    }

    public static int multiplicar(int a, int b) {
        return a * b;
    }

    @Test
    public void sumaDebeFuncionar() {
        assertEquals(10, sumar(4, 6));
    }

    @Test
    public void restaDebeFuncionar() {
        assertEquals(4, restar(10, 6));
    }

    @Test
    public void multiplicacionDebeFuncionar() {
        assertEquals(50, multiplicar(5, 10));
    }

    @Test
    public void validacionBooleana() {
        assertTrue(sumar(2, 2) == 4);
        assertFalse(sumar(2, 2) == 5);
    }
}
`;



export function PlaygroundView() {
  const { balance } = useWallet();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Mode: 'python' | 'java' | 'split'
  const [activeMode, setActiveMode] = useState('python');

  // Independent code states for persistence across tabs
  const [pythonCode, setPythonCode] = useState(DEFAULT_PYTHON_CODE);
  const [javaCode, setJavaCode] = useState(DEFAULT_JAVA_CODE);

  const tokenCost = user?.plan === 'Oro' ? 0 : 2;

  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '4rem', minHeight: '85vh' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Header with Title & Token Pill */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ color: 'var(--accent-purple)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('playground.badge')}
            </div>
            <h1 className="heading-lg" style={{ margin: '0.25rem 0' }}>
              {t('playground.title')}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              {t('playground.subtitle')}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="card" style={{ padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {t('playground.balance_label')}
              </div>
              <span className="token-pill">
                <Zap size={14} fill="#F59E0B" /> {balance} tk
              </span>
            </div>

            <div style={{ fontSize: '0.8rem', color: user?.plan === 'Oro' ? 'var(--color-success)' : 'var(--text-muted)' }}>
              {t('playground.cost_label')} <strong>{user?.plan === 'Oro' ? '0 tk (Plan Oro)' : '2 tk'}</strong>
            </div>
          </div>
        </div>

        {/* Simplified Mode Selector (Python | Java | Vista dividida) */}
        <div style={{
          display: 'inline-flex',
          backgroundColor: 'var(--bg-surface-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '4px',
          gap: '4px',
          width: 'fit-content',
          flexWrap: 'wrap'
        }}>
          <button
            type="button"
            onClick={() => setActiveMode('python')}
            className={`btn btn-sm ${activeMode === 'python' ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              padding: '0.5rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Code2 size={16} />
            <span>{t('playground.mode_python')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('java')}
            className={`btn btn-sm ${activeMode === 'java' ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              padding: '0.5rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Cpu size={16} />
            <span>{t('playground.mode_java')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('split')}
            className={`btn btn-sm ${activeMode === 'split' ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              padding: '0.5rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Columns size={16} />
            <span>{t('playground.mode_split')}</span>
          </button>
        </div>
        {/* 1. MODO INDIVIDUAL: PYTHON */}
        {activeMode === 'python' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>Python 3</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Motor Pyodide WebAssembly (Frontend)
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('sandboxUI.templates')}</span>
                <button
                  type="button"
                  onClick={() => setPythonCode(DEFAULT_PYTHON_CODE)}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                >
                  Básico
                </button>
                <button
                  type="button"
                  onClick={() => setPythonCode(PYTHON_REQUESTS_CODE)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', color: 'var(--accent-purple)', borderColor: 'rgba(168, 85, 247, 0.4)' }}
                >
                  HTTP Requests (Real)
                </button>
              </div>
            </div>

            <CodeEditor
              key="solo-python"
              initialCode={pythonCode}
              onChange={setPythonCode}
              language="python"
              filename="main.py"
              tokenCost={tokenCost}
              height="360px"
            />
          </div>
        )}

        {/* 2. MODO INDIVIDUAL: JAVA */}
        {activeMode === 'java' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>Java</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Simulador Educativo Frontend
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('sandboxUI.templates')}</span>
                <button
                  type="button"
                  onClick={() => setJavaCode(DEFAULT_JAVA_CODE)}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                >
                  Main
                </button>
                <button
                  type="button"
                  onClick={() => setJavaCode(JAVA_JUNIT_CODE)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', color: '#F59E0B', borderColor: 'rgba(245, 158, 11, 0.4)' }}
                >
                  Tests JUnit (@Test)
                </button>
              </div>
            </div>

            <CodeEditor
              key="solo-java"
              initialCode={javaCode}
              onChange={setJavaCode}
              language="java"
              filename="Main.java"
              tokenCost={tokenCost}
              height="360px"
            />
          </div>
        )}

        

        {/* 3. MODO VISTA DIVIDIDA (PYTHON + JAVA TOTALMENTE AISLADOS) */}
        {activeMode === 'split' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <Columns size={16} color="var(--accent-cyan)" />
              <span>{t('playground.split_hint')}</span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
              gap: '1.25rem',
              alignItems: 'start'
            }}>
              {/* Panel Izquierdo: Python */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.9rem' }}>
                    <Code2 size={16} color="var(--accent-purple)" />
                    <span>{t('playground.panel_python')}</span>
                  </div>
                  <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>main.py</span>
                </div>

                <CodeEditor
                  key="split-python"
                  initialCode={pythonCode}
                  onChange={setPythonCode}
                  language="python"
                  filename="main.py"
                  tokenCost={tokenCost}
                  height="300px"
                />
              </div>

              {/* Panel Derecho: Java */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.9rem' }}>
                    <Cpu size={16} color="var(--accent-cyan)" />
                    <span>{t('playground.panel_java')}</span>
                  </div>
                  <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>Main.java</span>
                </div>

                <CodeEditor
                  key="split-java"
                  initialCode={javaCode}
                  onChange={setJavaCode}
                  language="java"
                  filename="Main.java"
                  tokenCost={tokenCost}
                  height="300px"
                />
              </div>
            </div>
          </div>
        )}

        {/* Informational Cards */}
        <div className="grid-3" style={{ marginTop: '1rem' }}>
          <div className="card">
            <Shield size={20} color="var(--accent-purple)" style={{ marginBottom: '0.5rem' }} />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.25rem' }}>{t('playground.card_1_title')}</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {t('playground.card_1_desc')}
            </p>
          </div>

          <div className="card">
            <Terminal size={20} color="var(--accent-cyan)" style={{ marginBottom: '0.5rem' }} />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.25rem' }}>{t('playground.card_2_title')}</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {t('playground.card_2_desc')}
            </p>
          </div>

          <div className="card">
            <Sparkles size={20} color="#F59E0B" style={{ marginBottom: '0.5rem' }} />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.25rem' }}>{t('playground.card_3_title')}</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {t('playground.card_3_desc')}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
