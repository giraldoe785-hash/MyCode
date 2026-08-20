import React, { useState } from 'react';
import { CodeEditor } from './CodeEditor';
import { Sparkles, Terminal, Cpu } from 'lucide-react';

const PYTHON_SAMPLE = `# Syntax Showdown: Python 3.13
def fibonacci(n: int) -> list[int]:
    """Genera serie Fibonacci optimizada."""
    seq = [0, 1]
    for _ in range(2, n):
        seq.append(seq[-1] + seq[-2])
    return seq[:n]

resultado = fibonacci(8)
print(f"⚡ Python Fibonacci (8 elementos): {resultado}")
print("🚀 Ejecución exitosa en sandbox MyCode Pro!")
`;

const JAVA_SAMPLE = `// Syntax Showdown: Java 21 LTS
package com.mycode.showdown;

import java.util.Arrays;

public class Main {
    public static int[] fibonacci(int n) {
        if (n <= 1) return new int[]{0};
        int[] seq = new int[n];
        seq[0] = 0;
        seq[1] = 1;
        for (int i = 2; i < n; i++) {
            seq[i] = seq[i - 1] + seq[i - 2];
        }
        return seq;
    }

    public static void main(String[] args) {
        int[] res = fibonacci(8);
        System.out.println("⚡ Java 21 Fibonacci: " + Arrays.toString(res));
        System.out.println("🚀 Algoritmo verificado con éxito.");
    }
}
`;

export function SyntaxShowdown() {
  const [selectedLang, setSelectedLang] = useState('python'); // 'python' | 'java' | 'split'

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-medium)',
      borderRadius: 'var(--radius-xl)',
      padding: '2rem',
      boxShadow: 'var(--shadow-xl)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(99, 102, 241, 0.12)',
            color: 'var(--accent-purple)',
            fontSize: '0.75rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
            border: '1px solid rgba(99, 102, 241, 0.3)'
          }}>
            <Sparkles size={14} /> SYNTAX SHOWDOWN INTERACTIVO
          </div>
          <h2 className="heading-md" style={{ margin: 0 }}>
            Python vs Java: Comparador de Código en Vivo
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Prueba cómo se estructura un mismo algoritmo en diferentes lenguajes y ejecútalo en la consola interactiva.
          </p>
        </div>

        {/* Language Tabs Selector */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--bg-surface-secondary)',
          padding: '0.3rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          gap: '0.3rem'
        }}>
          <button
            onClick={() => setSelectedLang('python')}
            className={`btn-sm ${selectedLang === 'python' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-sm)', fontWeight: 600 }}
          >
            Python (main.py)
          </button>
          <button
            onClick={() => setSelectedLang('java')}
            className={`btn-sm ${selectedLang === 'java' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-sm)', fontWeight: 600 }}
          >
            Java (Main.java)
          </button>
          <button
            onClick={() => setSelectedLang('split')}
            className={`btn-sm ${selectedLang === 'split' ? 'btn-neon' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-sm)', fontWeight: 600 }}
          >
            Pantalla Dividida
          </button>
        </div>
      </div>

      {/* Editor Area */}
      {selectedLang === 'split' ? (
        <div className="grid-2" style={{ gap: '1.25rem' }}>
          <div>
            <CodeEditor
              initialCode={PYTHON_SAMPLE}
              language="python"
              filename="main.py"
              tokenCost={2}
              height="260px"
            />
          </div>
          <div>
            <CodeEditor
              initialCode={JAVA_SAMPLE}
              language="java"
              filename="Main.java"
              tokenCost={2}
              height="260px"
            />
          </div>
        </div>
      ) : selectedLang === 'python' ? (
        <CodeEditor
          initialCode={PYTHON_SAMPLE}
          language="python"
          filename="main.py"
          tokenCost={2}
          height="280px"
        />
      ) : (
        <CodeEditor
          initialCode={JAVA_SAMPLE}
          language="java"
          filename="Main.java"
          tokenCost={2}
          height="280px"
        />
      )}
    </div>
  );
}