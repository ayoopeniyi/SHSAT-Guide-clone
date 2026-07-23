import React, { useEffect, useRef, useState } from 'react';
import { Label } from './label';
import { Input } from './input';
import { Button } from './button';

interface MathEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  id?: string;
}

export const MathEditor: React.FC<MathEditorProps> = ({
  value,
  onChange,
  label,
  placeholder = "Enter mathematical expression...",
  readOnly = false,
  className = "",
  id,
}) => {
  const [latex, setLatex] = useState(value || '');
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const prettyMathRef = useRef<HTMLDivElement>(null);
  const [katexLoaded, setKatexLoaded] = useState(false);

  // Keypad layout with fractions
  const keys = [
    ['1', '2', '3', '4', '5'],
    ['6', '7', '8', '9', '0'],
    ['+', '−', '×', '÷', '='],
    ['x', 'y', 'z', '(', ')'],
    ['²', '³', '√', 'π', '∞'],
    ['frac', 'mixed', '\\frac{1}{2}', '\\frac{1}{3}', '\\frac{1}{4}']
  ];

  // Render ASCII preview with interactive placeholders
  const render = (str: string) => {
    if (!str) return '[□]/[□]';
    
    return str
      .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, (match, num, den) => {
        const numerator = num || '□';
        const denominator = den || '□';
        return `[${numerator}]/[${denominator}]`;
      })
      .replace(/\\mixed\{([^}]*)\}\{([^}]*)\}\{([^}]*)\}/g, (match, whole, num, den) => {
        const wholeNum = whole || '□';
        const numerator = num || '□';
        const denominator = den || '□';
        return `${wholeNum} [${numerator}]/[${denominator}]`;
      });
  };

  // Update pretty math rendering with clickable placeholders
  const updatePrettyMath = (latexStr: string) => {
    if (prettyMathRef.current && (window as any).katex) {
      try {
        let processedLatex = latexStr || "\\frac{\\Box}{\\Box}";
        
        // Replace empty fractions with placeholder symbols
        processedLatex = processedLatex
          .replace(/\\frac\{\}\{\}/g, '\\frac{\\Box}{\\Box}')
          .replace(/\\frac\{([^}]*)\}\{\}/g, '\\frac{$1}{\\Box}')
          .replace(/\\frac\{\}\{([^}]*)\}/g, '\\frac{\\Box}{$1}')
          .replace(/\\mixed\{\}\{\}\{\}/g, '\\mixed{\\Box}{\\Box}{\\Box}');
        
        (window as any).katex.render(processedLatex, prettyMathRef.current, {
          throwOnError: false
        });
        
        // Make placeholders clickable and editable
        const placeholderElements = prettyMathRef.current.querySelectorAll('.katex .mord');
        placeholderElements.forEach((element: any) => {
          if (element.textContent === '□') {
            element.style.cursor = 'pointer';
            element.style.backgroundColor = '#fef3c7';
            element.style.padding = '2px 4px';
            element.style.borderRadius = '4px';
            element.style.border = '1px dashed #f59e0b';
            element.style.minWidth = '20px';
            element.style.display = 'inline-block';
            element.contentEditable = true;
            element.title = 'Click to enter value';
            
            // Handle input events for direct editing
            element.addEventListener('input', (e: any) => {
              handleDirectEdit(e.target);
            });
            
            // Handle focus to clear placeholder
            element.addEventListener('focus', (e: any) => {
              if (e.target.textContent === '□') {
                e.target.textContent = '';
              }
            });
            
            // Handle blur to restore placeholder if empty
            element.addEventListener('blur', (e: any) => {
              if (!e.target.textContent.trim()) {
                e.target.textContent = '□';
              }
            });
          }
        });
      } catch (err) {
        prettyMathRef.current.textContent = "Invalid math";
      }
    }
  };

  // Handle direct editing of placeholders
  const handleDirectEdit = (element: any) => {
    const newValue = element.textContent.trim();
    const fractions = findFractions(latex);
    const mixedFractions = findMixedFractions(latex);
    
    // Find which fraction this placeholder belongs to
    // This is a simplified approach - you might need more sophisticated detection
    if (fractions.length > 0) {
      const fraction = fractions[0];
      const newFraction = `\\frac{${newValue || ''}}{${fraction.denominator || ''}}`;
      const newLatex = latex.substring(0, fraction.start) + newFraction + latex.substring(fraction.end);
      setLatex(newLatex);
      addHistory(newLatex);
      onChange(newLatex);
      updatePrettyMath(newLatex);
    } else if (mixedFractions.length > 0) {
      const fraction = mixedFractions[0];
      const newMixedFraction = `\\mixed{${fraction.whole || ''}}{${newValue || ''}}{${fraction.denominator || ''}}`;
      const newLatex = latex.substring(0, fraction.start) + newMixedFraction + latex.substring(fraction.end);
      setLatex(newLatex);
      addHistory(newLatex);
      onChange(newLatex);
      updatePrettyMath(newLatex);
    }
  };

  // Add to history
  const addHistory = (newLatex: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newLatex);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Find fractions in LaTeX and make them clickable
  const findFractions = (latexStr: string) => {
    const fractions: Array<{start: number, end: number, numerator: string, denominator: string}> = [];
    const regex = /\\frac\{([^}]*)\}\{([^}]*)\}/g;
    let match;
    while ((match = regex.exec(latexStr)) !== null) {
      fractions.push({
        start: match.index,
        end: match.index + match[0].length,
        numerator: match[1],
        denominator: match[2]
      });
    }
    return fractions;
  };

  // Find mixed fractions in LaTeX
  const findMixedFractions = (latexStr: string) => {
    const mixedFractions: Array<{start: number, end: number, whole: string, numerator: string, denominator: string}> = [];
    const regex = /\\mixed\{([^}]*)\}\{([^}]*)\}\{([^}]*)\}/g;
    let match;
    while ((match = regex.exec(latexStr)) !== null) {
      mixedFractions.push({
        start: match.index,
        end: match.index + match[0].length,
        whole: match[1],
        numerator: match[2],
        denominator: match[3]
      });
    }
    return mixedFractions;
  };

  // Input handler
  const input = (key: string) => {
    if (readOnly) return;

    let newLatex = latex;
    
    if (key === '²') {
      newLatex += '^2';
    } else if (key === '³') {
      newLatex += '^3';
    } else if (key === '√') {
      newLatex += '\\sqrt{}';
    } else if (key === 'π') {
      newLatex += '\\pi';
    } else if (key === '∞') {
      newLatex += '\\infty';
    } else if (key === '×') {
      newLatex += '\\times';
    } else if (key === '÷') {
      newLatex += '\\div';
    } else if (key === '−') {
      newLatex += '-';
    } else if (key === 'frac') {
      // Add empty fraction with placeholders
      newLatex += '\\frac{}{}';
    } else if (key === 'mixed') {
      // Add empty mixed fraction with placeholders
      newLatex += '\\mixed{}{}{}';
    } else if (key === '\\frac{1}{2}') {
      newLatex += '\\frac{1}{2}';
    } else if (key === '\\frac{1}{3}') {
      newLatex += '\\frac{1}{3}';
    } else if (key === '\\frac{1}{4}') {
      newLatex += '\\frac{1}{4}';
    } else if (key === '\\frac{1}{5}') {
      newLatex += '\\frac{1}{5}';
    } else {
      newLatex += key;
    }

    setLatex(newLatex);
    addHistory(newLatex);
    onChange(newLatex);
    updatePrettyMath(newLatex);
  };

  // Undo
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const newLatex = history[newIndex];
      setHistoryIndex(newIndex);
      setLatex(newLatex);
      onChange(newLatex);
      updatePrettyMath(newLatex);
    }
  };

  // Redo
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const newLatex = history[newIndex];
      setHistoryIndex(newIndex);
      setLatex(newLatex);
      onChange(newLatex);
      updatePrettyMath(newLatex);
    }
  };

  // Clear all
  const clearAll = () => {
    setLatex('');
    setHistory(['']);
    setHistoryIndex(0);
    onChange('');
    updatePrettyMath('');
  };

  // Backspace
  const backspace = () => {
    if (latex.length > 0) {
      const newLatex = latex.slice(0, -1);
      setLatex(newLatex);
      addHistory(newLatex);
      onChange(newLatex);
      updatePrettyMath(newLatex);
    }
  };

  // Update when value prop changes
  useEffect(() => {
    if (value !== latex) {
      setLatex(value || '');
      updatePrettyMath(value || '');
    }
  }, [value]);

  // Initialize KaTeX if not loaded
  useEffect(() => {
    if (!(window as any).katex) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
      script.onload = () => {
        updatePrettyMath(latex);
      };
      document.head.appendChild(script);

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
      document.head.appendChild(link);
    } else {
      updatePrettyMath(latex);
    }
  }, []);

  return (
    <div className={`space-y-3 ${className}`}>
      {label && <Label htmlFor={id}>{label}</Label>}
      
      {/* Display - Smaller */}
      <div className="w-full h-16 border-2 border-blue-500 rounded-lg bg-blue-50 flex items-center justify-center text-xl text-blue-800 mb-2">
        {render(latex)}
      </div>

      {/* Pretty Math - Smaller with clickable fractions */}
      <div 
        ref={prettyMathRef}
        className="min-h-8 mb-3 bg-gray-50 rounded-lg flex items-center justify-center text-lg p-2"
        title="Click on □ placeholders to edit fractions directly"
      />

      {/* Controls - Smaller */}
      <div className="flex justify-center gap-1 mb-3">
        <button 
          onClick={undo}
          disabled={readOnly || historyIndex <= 0}
          className="w-8 h-8 border border-gray-300 rounded-full bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
          title="Undo"
        >
          ↶
        </button>
        <button 
          onClick={redo}
          disabled={readOnly || historyIndex >= history.length - 1}
          className="w-8 h-8 border border-gray-300 rounded-full bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
          title="Redo"
        >
          ↷
        </button>
        <button 
          onClick={clearAll}
          disabled={readOnly}
          className="w-8 h-8 border border-gray-300 rounded-full bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
          title="Clear All"
        >
          🗑️
        </button>
        <button 
          onClick={backspace}
          disabled={readOnly || latex.length === 0}
          className="w-8 h-8 border border-gray-300 rounded-full bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
          title="Backspace"
        >
          ⌫
        </button>
      </div>

      {/* Keypad - Smaller */}
      <div className="grid grid-cols-5 gap-1 p-3 bg-blue-50 rounded-lg">
        {keys.map((row, rowIndex) => (
          row.map((key, keyIndex) => (
            <button
              key={`${rowIndex}-${keyIndex}`}
              onClick={() => input(key)}
              disabled={readOnly}
              className="h-8 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs font-semibold"
              title={key}
            >
              {key === 'frac' ? 'frac' : 
               key === 'mixed' ? 'mixed' :
               key === '\\frac{1}{2}' ? '1/2' :
               key === '\\frac{1}{3}' ? '1/3' :
               key === '\\frac{1}{4}' ? '1/4' :
               key === '\\frac{1}{5}' ? '1/5' : key}
            </button>
          ))
        ))}
      </div>

      {/* LaTeX Output - Smaller */}
      <div className="p-2 bg-gray-50 rounded-md font-mono text-xs">
        LaTeX: <span className="break-all">{latex || '\\frac{}{}'}</span>
      </div>

      {/* Fraction Editor Modal */}
      {/* Removed as per edit hint */}
    </div>
  );
};