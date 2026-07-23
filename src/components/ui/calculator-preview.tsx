import React, { useEffect, useRef, useState } from 'react';
import { Label } from './label';
import { Input } from './input';
import { Button } from './button';

interface CalculatorPreviewProps {
  question: string;
  correctAnswer: string;
  questionImageUrl?: string;
  className?: string;
}

export const CalculatorPreview: React.FC<CalculatorPreviewProps> = ({
  question,
  correctAnswer,
  questionImageUrl,
  className = "",
}) => {
  const [latex, setLatex] = useState('');
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const prettyMathRef = useRef<HTMLDivElement>(null);
  const [showFractionEditor, setShowFractionEditor] = useState(false);
  const [fractionNumerator, setFractionNumerator] = useState('');
  const [fractionDenominator, setFractionDenominator] = useState('');
  const [editingFractionIndex, setEditingFractionIndex] = useState(-1);

  // Keypad layout with fractions
  const keys = [
    ['1', '2', '3', '4', '5'],
    ['6', '7', '8', '9', '0'],
    ['+', '−', '×', '÷', '='],
    ['x', 'y', 'z', '(', ')'],
    ['²', '³', '√', 'π', '∞'],
    ['\\frac{}{}', '\\frac{1}{2}', '\\frac{1}{3}', '\\frac{1}{4}', '\\frac{1}{5}']
  ];

  // Render ASCII preview
  const render = (str: string) => {
    return str
      ? str.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '[$1]/[$2]')
      : '[□]/[□]';
  };

  // Update pretty math rendering
  const updatePrettyMath = (latexStr: string) => {
    if (prettyMathRef.current && (window as any).katex) {
      try {
        (window as any).katex.render(latexStr || "\\frac{\\Box}{\\Box}", prettyMathRef.current, {
          throwOnError: false
        });
      } catch (err) {
        prettyMathRef.current.textContent = "Invalid math";
      }
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

  // Handle fraction click
  const handleFractionClick = (index: number) => {
    const fractions = findFractions(latex);
    if (fractions[index]) {
      const fraction = fractions[index];
      setFractionNumerator(fraction.numerator);
      setFractionDenominator(fraction.denominator);
      setEditingFractionIndex(index);
      setShowFractionEditor(true);
    }
  };

  // Save fraction edit
  const saveFractionEdit = () => {
    const fractions = findFractions(latex);
    if (editingFractionIndex >= 0 && fractions[editingFractionIndex]) {
      const fraction = fractions[editingFractionIndex];
      const newFraction = `\\frac{${fractionNumerator}}{${fractionDenominator}}`;
      const newLatex = latex.substring(0, fraction.start) + newFraction + latex.substring(fraction.end);
      setLatex(newLatex);
      addHistory(newLatex);
      updatePrettyMath(newLatex);
    }
    setShowFractionEditor(false);
    setEditingFractionIndex(-1);
  };

  // Input handler
  const input = (key: string) => {
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
    } else if (key === '\\frac{}{}') {
      newLatex += '\\frac{}{}';
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
    updatePrettyMath(newLatex);
  };

  // Undo
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const newLatex = history[newIndex];
      setHistoryIndex(newIndex);
      setLatex(newLatex);
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
      updatePrettyMath(newLatex);
    }
  };

  // Clear all
  const clearAll = () => {
    setLatex('');
    setHistory(['']);
    setHistoryIndex(0);
    updatePrettyMath('');
  };

  // Backspace
  const backspace = () => {
    if (latex.length > 0) {
      const newLatex = latex.slice(0, -1);
      setLatex(newLatex);
      addHistory(newLatex);
      updatePrettyMath(newLatex);
    }
  };

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
    <div className={`border rounded-lg p-4 bg-gray-50 ${className}`}>
      <Label className="text-lg font-semibold mb-3">Student View Preview</Label>
      
      {/* Question Section */}
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-2">Question:</div>
        <div className="p-3 bg-white border rounded-md">
          {question || 'Enter a question to see preview...'}
        </div>
      </div>

      {/* Question Image */}
      {questionImageUrl && (
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">Image:</div>
          <img 
            src={questionImageUrl} 
            alt="Question" 
            className="max-w-xs rounded border"
          />
        </div>
      )}

      {/* Calculator Interface */}
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-2">Calculator Interface:</div>
        <div className="bg-white border rounded-md p-3">
          {/* Display - Smaller */}
          <div className="w-full h-16 border-2 border-blue-500 rounded-lg bg-blue-50 flex items-center justify-center text-xl text-blue-800 mb-2">
            {render(latex)}
          </div>

          {/* Pretty Math - Smaller with clickable fractions */}
          <div 
            ref={prettyMathRef}
            className="min-h-8 mb-3 bg-gray-50 rounded-lg flex items-center justify-center text-lg p-2 cursor-pointer"
            onClick={() => {
              const fractions = findFractions(latex);
              if (fractions.length > 0) {
                handleFractionClick(0); // Edit first fraction
              }
            }}
            title="Click to edit fractions"
          />

          {/* Controls - Smaller */}
          <div className="flex justify-center gap-1 mb-3">
            <button 
              onClick={undo}
              disabled={historyIndex <= 0}
              className="w-8 h-8 border border-gray-300 rounded-full bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
              title="Undo"
            >
              ↶
            </button>
            <button 
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="w-8 h-8 border border-gray-300 rounded-full bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
              title="Redo"
            >
              ↷
            </button>
            <button 
              onClick={clearAll}
              className="w-8 h-8 border border-gray-300 rounded-full bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
              title="Clear All"
            >
              🗑️
            </button>
            <button 
              onClick={backspace}
              disabled={latex.length === 0}
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
                  className="h-8 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs font-semibold"
                  title={key}
                >
                  {key === '\\frac{}{}' ? 'frac' : 
                   key === '\\frac{1}{2}' ? '1/2' :
                   key === '\\frac{1}{3}' ? '1/3' :
                   key === '\\frac{1}{4}' ? '1/4' :
                   key === '\\frac{1}{5}' ? '1/5' : key}
                </button>
              ))
            ))}
          </div>

          <div className="mt-2 text-xs text-gray-500">
            Students can use the virtual keyboard or type mathematical expressions
          </div>
        </div>
      </div>

      {/* Expected Answer */}
      <div>
        <div className="text-sm text-gray-600 mb-2">Expected Answer:</div>
        <div className="p-3 bg-white border rounded-md font-mono text-sm">
          {correctAnswer || 'Enter correct answer to see preview...'}
        </div>
      </div>

      {/* Fraction Editor Modal */}
      {showFractionEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <h3 className="text-lg font-semibold mb-4">Edit Fraction</h3>
            <div className="space-y-4">
              <div>
                <Label>Numerator</Label>
                <Input
                  value={fractionNumerator}
                  onChange={(e) => setFractionNumerator(e.target.value)}
                  placeholder="Enter numerator"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Denominator</Label>
                <Input
                  value={fractionDenominator}
                  onChange={(e) => setFractionDenominator(e.target.value)}
                  placeholder="Enter denominator"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={saveFractionEdit} className="flex-1">
                  Save
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowFractionEditor(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};