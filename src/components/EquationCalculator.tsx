import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Delete, Redo, Trash2, Undo } from 'lucide-react';
import { TestPackQuestion } from '../types/testPack';
import { CalculatorButton, FractionValues, EditingFraction, HistoryState, AnswerData } from '../types/equationCalculator';
import { BUTTONS, MAX_HISTORY } from '../utils/constants/equationCalculator';
import { getDisplayClass, renderFractionBoxes, latexToHtml } from '../utils/functions/equationCalculator';
import './EquationCalculator.css';

interface EquationCalculatorProps {
  onAnswerChange: (answer: string) => void;
  question: TestPackQuestion;
  showAnswer?: boolean;
  disabled?: boolean;
  userAnswer?: string;
  isAnswerCorrect?: boolean;
  correctAnswer?: string;
  difficulty?: number;
}

export const EquationCalculator: React.FC<EquationCalculatorProps> = ({
  onAnswerChange,
  question,
  showAnswer = false,
  disabled = false,
  userAnswer,
  isAnswerCorrect = false,
  correctAnswer,
  difficulty
}) => {
  const [display, setDisplay] = useState<string>('');
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [fractionCursorPosition, setFractionCursorPosition] = useState<number>(0);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [fractionValues, setFractionValues] = useState<FractionValues>({});
  const [editingFraction, setEditingFraction] = useState<EditingFraction | null>(null);
  const [displayWithFractionBoxes, setDisplayWithFractionBoxes] = useState<string>('');
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [history, setHistory] = useState<HistoryState[]>([]);

  const displayContainerRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Initialize from user answer
  useEffect(() => {
    if (userAnswer) {
      try {
        const answerData: AnswerData = JSON.parse(userAnswer);
        if (typeof answerData === 'object' && answerData.display !== undefined) {
          setDisplay(answerData.display);
          setFractionValues(answerData.fractions || {});
          addToHistory(answerData.display, 0);
        } else {
          setDisplay(userAnswer);
          addToHistory(userAnswer, 0);
        }
      } catch {
        setDisplay(userAnswer);
        addToHistory(userAnswer, 0);
      }
    } else {
      addToHistory('', 0);
    }
  }, [userAnswer]);

  // Update display with fractions
  useEffect(() => {
    setDisplayWithFractionBoxes(renderFractionBoxes(display, fractionValues, editingFraction));
  }, [display, fractionValues, editingFraction]);

  const addToHistory = useCallback((displayValue: string, cursor: number) => {
    if (history[historyIndex]?.display === displayValue) return;

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ display: displayValue, cursor });

    if (newHistory.length > MAX_HISTORY) {
      newHistory.splice(0, newHistory.length - MAX_HISTORY);
    }

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const saveAnswer = useCallback(() => {
    const answerData: AnswerData = {
      display,
      fractions: fractionValues
    };
    onAnswerChange(JSON.stringify(answerData));
  }, [display, fractionValues, onAnswerChange]);

  const focusDisplay = useCallback(() => {
    if (!disabled) {
      if (!editingFraction) {
        setIsEditing(true);
      }
      setTimeout(() => {
        hiddenInputRef.current?.focus();
      }, 0);
    }
  }, [disabled, editingFraction]);

  const getCurrentFractionValue = useCallback((): string => {
    if (!editingFraction) return '';
    const fraction = fractionValues[editingFraction.id];
    if (!fraction) return '';
    return fraction[editingFraction.part] || '';
  }, [editingFraction, fractionValues]);

  const updateEditingFractionCursor = useCallback((position: number) => {
    if (editingFraction) {
      setEditingFraction(prev => prev ? { ...prev, cursorPosition: position } : null);
      saveAnswer();
    }
  }, [editingFraction, saveAnswer]);

  const moveCursorLeft = useCallback(() => {
    if (disabled) return;

    if (editingFraction) {
      if (fractionCursorPosition > 0) {
        setFractionCursorPosition(prev => prev - 1);
        updateEditingFractionCursor(fractionCursorPosition - 1);
      }
    } else {
      if (cursorPosition > 0) {
        setCursorPosition(prev => prev - 1);
        focusDisplay();
      }
    }
  }, [disabled, editingFraction, fractionCursorPosition, cursorPosition, updateEditingFractionCursor, focusDisplay]);

  const moveCursorRight = useCallback(() => {
    if (disabled) return;

    if (editingFraction) {
      const currentValue = getCurrentFractionValue();
      if (fractionCursorPosition < currentValue.length) {
        setFractionCursorPosition(prev => prev + 1);
        updateEditingFractionCursor(fractionCursorPosition + 1);
      }
    } else {
      if (cursorPosition < display.length) {
        setCursorPosition(prev => prev + 1);
        focusDisplay();
      }
    }
  }, [disabled, editingFraction, fractionCursorPosition, cursorPosition, display.length, getCurrentFractionValue, updateEditingFractionCursor, focusDisplay]);

  const undo = useCallback(() => {
    if (disabled || historyIndex <= 0) return;

    const newIndex = historyIndex - 1;
    const state = history[newIndex];
    setDisplay(state.display);
    setCursorPosition(state.cursor);
    setHistoryIndex(newIndex);
    saveAnswer();
    focusDisplay();
  }, [disabled, historyIndex, history, saveAnswer, focusDisplay]);

  const redo = useCallback(() => {
    if (disabled || historyIndex >= history.length - 1) return;

    const newIndex = historyIndex + 1;
    const state = history[newIndex];
    setDisplay(state.display);
    setCursorPosition(state.cursor);
    setHistoryIndex(newIndex);
    saveAnswer();
    focusDisplay();
  }, [disabled, historyIndex, history.length, saveAnswer, focusDisplay]);

  const blurDisplay = useCallback(() => {
    if (!editingFraction) {
      setIsEditing(false);
    }
  }, [editingFraction]);

  const setCurrentFractionValue = useCallback((value: string) => {
    if (!editingFraction) return;

    setFractionValues(prev => {
      const newValues = { ...prev };
      if (!newValues[editingFraction.id]) {
        newValues[editingFraction.id] = { num: '', den: '' };
      }
      newValues[editingFraction.id][editingFraction.part] = value;
      return newValues;
    });
  }, [editingFraction]);

  const finishFractionEdit = useCallback(() => {
    setEditingFraction(null);
    setIsEditing(true);

    setTimeout(() => {
      if (hiddenInputRef.current) {
        hiddenInputRef.current.focus();
      }
    }, 0);
  }, []);

  const insertFraction = useCallback((type: 'simple' | 'mixed') => {
    addToHistory(display, cursorPosition);

    const fractionId = `frac_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let placeholder: string;

    if (type === 'simple') {
      placeholder = `[FRAC:${fractionId}:SIMPLE]`;
      setFractionValues(prev => ({
        ...prev,
        [fractionId]: { num: '', den: '' }
      }));
    } else {
      placeholder = `[FRAC:${fractionId}:MIXED]`;
      setFractionValues(prev => ({
        ...prev,
        [fractionId]: { num: '', den: '', whole: '' }
      }));
    }

    const start = cursorPosition;
    const before = display.slice(0, start);
    const after = display.slice(start);

    setDisplay(before + placeholder + after);
    setCursorPosition(start + placeholder.length);
    saveAnswer();
  }, [addToHistory, display, cursorPosition, saveAnswer]);

  const backspace = useCallback(() => {
    if (disabled || cursorPosition <= 0) return;

    addToHistory(display, cursorPosition);

    // Check if we're about to delete a fraction placeholder
    const beforeCursor = display.slice(0, cursorPosition);
    const fractionMatch = beforeCursor.match(/\[FRAC:[^\]]+\]$/);

    if (fractionMatch) {
      // Delete the entire fraction
      const fractionLength = fractionMatch[0].length;
      const before = display.slice(0, cursorPosition - fractionLength);
      const after = display.slice(cursorPosition);
      setDisplay(before + after);
      setCursorPosition(cursorPosition - fractionLength);

      // Clean up fraction values
      const fractionId = fractionMatch[0].match(/\[FRAC:([^:]+):/)?.[1];
      if (fractionId && fractionValues[fractionId]) {
        setFractionValues(prev => {
          const newValues = { ...prev };
          delete newValues[fractionId];
          return newValues;
        });
      }
    } else {
      // Normal character deletion
      const before = display.slice(0, cursorPosition - 1);
      const after = display.slice(cursorPosition);
      setDisplay(before + after);
      setCursorPosition(prev => prev - 1);
    }

    saveAnswer();
  }, [disabled, cursorPosition, addToHistory, display, fractionValues, saveAnswer]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled) return;

    // Handle fraction editing
    if (editingFraction) {
      if (event.key === 'Enter' || event.key === 'Escape' || event.key === 'Tab') {
        event.preventDefault();
        finishFractionEdit();
        return;
      } else if (event.key === 'Backspace') {
        event.preventDefault();
        const currentValue = getCurrentFractionValue();
        if (fractionCursorPosition > 0) {
          const before = currentValue.slice(0, fractionCursorPosition - 1);
          const after = currentValue.slice(fractionCursorPosition);
          setCurrentFractionValue(before + after);
          setFractionCursorPosition(prev => prev - 1);
          updateEditingFractionCursor(fractionCursorPosition - 1);
        }
        return;
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if (fractionCursorPosition > 0) {
          setFractionCursorPosition(prev => prev - 1);
          updateEditingFractionCursor(fractionCursorPosition - 1);
        }
        return;
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        const currentValue = getCurrentFractionValue();
        if (fractionCursorPosition < currentValue.length) {
          setFractionCursorPosition(prev => prev + 1);
          updateEditingFractionCursor(fractionCursorPosition + 1);
        }
        return;
      } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        const currentValue = getCurrentFractionValue();
        const before = currentValue.slice(0, fractionCursorPosition);
        const after = currentValue.slice(fractionCursorPosition);
        setCurrentFractionValue(before + event.key + after);
        setFractionCursorPosition(prev => prev + 1);
        updateEditingFractionCursor(fractionCursorPosition + 1);
        return;
      }
      return;
    }

    // Normal keyboard handling when not editing fractions
    if (event.ctrlKey || event.metaKey) {
      if (event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
        return;
      } else if (event.key === 'y' || (event.key === 'z' && event.shiftKey)) {
        event.preventDefault();
        redo();
        return;
      }
    }

    if (event.key === 'Backspace') {
      event.preventDefault();
      backspace();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (cursorPosition > 0) setCursorPosition(prev => prev - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (cursorPosition < display.length) setCursorPosition(prev => prev + 1);
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      addToHistory(display, cursorPosition);
      const before = display.slice(0, cursorPosition);
      const after = display.slice(cursorPosition);
      setDisplay(before + event.key + after);
      setCursorPosition(prev => prev + 1);
      saveAnswer();
    }
  }, [
    disabled, editingFraction, fractionCursorPosition, getCurrentFractionValue,
    setCurrentFractionValue, updateEditingFractionCursor, finishFractionEdit, undo, redo, cursorPosition,
    display, addToHistory, saveAnswer, backspace
  ]);

  const handleButtonClick = useCallback((button: CalculatorButton) => {
    if (disabled) return;

    // If we're editing a fraction, handle the button click for fraction input
    if (editingFraction) {
      if (button.value === 'FRACTION' || button.value === 'MIXED_FRACTION') {
        return;
      }

      // Add characters to fraction
      const currentValue = getCurrentFractionValue();
      const before = currentValue.slice(0, fractionCursorPosition);
      const after = currentValue.slice(fractionCursorPosition);
      setCurrentFractionValue(before + button.value + after);
      setFractionCursorPosition(prev => prev + button.value.length);
      updateEditingFractionCursor(fractionCursorPosition + button.value.length);
      return;
    }

    if (button.value === 'FRACTION') {
      insertFraction('simple');
      return;
    }

    if (button.value === 'MIXED_FRACTION') {
      insertFraction('mixed');
      return;
    }

    // Handle all other buttons (numbers, operators, etc.)
    addToHistory(display, cursorPosition);
    const start = cursorPosition;
    const before = display.slice(0, start);
    const after = display.slice(start);

    setDisplay(before + button.value + after);
    setCursorPosition(start + button.value.length);
    saveAnswer();
  }, [
    disabled, editingFraction, fractionCursorPosition, getCurrentFractionValue,
    setCurrentFractionValue, updateEditingFractionCursor, addToHistory, display,
    cursorPosition, saveAnswer, insertFraction
  ]);

  const startFractionEdit = useCallback((fractionId: string, part: 'num' | 'den' | 'whole') => {
    const currentValue = fractionValues[fractionId]?.[part] || '';
    setFractionCursorPosition(currentValue.length);

    setEditingFraction({
      id: fractionId,
      part,
      cursorPosition: currentValue.length
    });

    setTimeout(() => {
      if (hiddenInputRef.current) {
        hiddenInputRef.current.focus();
      }
    }, 0);
  }, [fractionValues]);

  const handleDisplayClick = useCallback((event: React.MouseEvent) => {
    if (editingFraction) {
      const target = event.target as HTMLElement;
      const fractionDisplay = target.closest('.fraction-display');

      if (!fractionDisplay) {
        finishFractionEdit();
      }
    }

    focusDisplay();
  }, [editingFraction, finishFractionEdit, focusDisplay]);

  const handleFractionContainerClick = useCallback((event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const fractionId = target.getAttribute('data-fraction-id');
    const fractionPart = target.getAttribute('data-fraction-part');

    if (fractionId && fractionPart) {
      startFractionEdit(fractionId, fractionPart as 'num' | 'den' | 'whole');
      event.stopPropagation();
    } else {
      if (editingFraction) {
        finishFractionEdit();
      }
    }
  }, [editingFraction, startFractionEdit, finishFractionEdit]);

  const clearDisplay = useCallback(() => {
    if (disabled) return;
    addToHistory(display, cursorPosition);
    setDisplay('');
    setCursorPosition(0);
    setFractionValues({});
    setEditingFraction(null);
    onAnswerChange('');
    focusDisplay();
  }, [disabled, addToHistory, display, cursorPosition, onAnswerChange, focusDisplay]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="equation-calculator space-y-6">
      {/* Question */}
      <div className="prose max-w-none">
        <h3 className="mb-4 text-lg font-normal text-gray-900">
          <div dangerouslySetInnerHTML={{ __html: latexToHtml(question.question) }} />
        </h3>
      </div>

            {difficulty && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">Difficulty Level:</span>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    level <= difficulty 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-200 text-blue-600'
                  }`}
                >
                  {level}
                </div>
              ))}
            </div>
            <span className="text-sm text-blue-700">
              {difficulty === 1 && 'Very Easy'}
              {difficulty === 2 && 'Easy'}
              {difficulty === 3 && 'Medium'}
              {difficulty === 4 && 'Hard'}
              {difficulty === 5 && 'Very Hard'}
            </span>
          </div>
        </div>
      )}

      {/* Calculator Interface */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        {/* Simple Display */}
        <div className="relative mb-4">
          {/* Hidden input for keyboard handling */}
          <input
            ref={hiddenInputRef}
            onKeyDown={handleKeyDown}
            onBlur={blurDisplay}
            type="text"
            className="absolute -left-[9999px] opacity-0"
            tabIndex={-1}
            disabled={disabled}
          />

          {/* Visual Display Container */}
          <div
            ref={displayContainerRef}
            onClick={handleDisplayClick}
            className={getDisplayClass(isAnswerCorrect, disabled, isEditing, showAnswer)}
            role="textbox"
            tabIndex={0}
          >
            {display.trim() ? (
              display.includes('[FRAC:') ? (
                // Render with interactive fraction elements
                <div className="flex h-full items-center justify-start">
                  <div 
                    className="fraction-display text-base" 
                    onClick={handleFractionContainerClick}
                    dangerouslySetInnerHTML={{ __html: displayWithFractionBoxes }}
                  />
                </div>
              ) : (
                // Simple text display
                <div className="flex h-full items-center justify-start">
                  <div className="relative text-base">
                    {display}
                    {/* Show cursor position */}
                    {!showAnswer && (
                      <div
                        style={{ left: `${cursorPosition * 0.7}em` }}
                        className="caret absolute bottom-0 h-5 w-[2px] rounded text-xs"
                      />
                    )}
                  </div>
                </div>
              )
            ) : (
              // Placeholder
              <div className="flex h-full items-center justify-start text-base text-gray-400">
                Enter your mathematical expression...
              </div>
            )}
          </div>
        </div>

        {/* Action Icons */}
        <div className="mb-4 flex justify-center gap-4">
          {/* Left Arrow Button */}
          <button
            onClick={moveCursorLeft}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
            title="Move Cursor Left"
            disabled={disabled || (editingFraction ? fractionCursorPosition <= 0 : cursorPosition <= 0)}
          >
            <ArrowLeft size={20} />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={moveCursorRight}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
            title="Move Cursor Right"
            disabled={disabled ||
              (editingFraction
                ? fractionCursorPosition >= getCurrentFractionValue().length
                : cursorPosition >= display.length)}
          >
            <ArrowRight size={20} />
          </button>

          {/* Undo Button */}
          <button
            onClick={undo}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
            title="Undo (Ctrl+Z)"
            disabled={disabled || !canUndo}
          >
            <Undo size={20} />
          </button>

          {/* Redo Button */}
          <button
            onClick={redo}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
            title="Redo (Ctrl+Y)"
            disabled={disabled || !canRedo}
          >
            <Redo size={20} />
          </button>

          {/* Backspace Button */}
          <button
            onClick={() => {
              if (editingFraction) {
                const currentValue = getCurrentFractionValue();
                if (currentValue.length > 0 && fractionCursorPosition > 0) {
                  const before = currentValue.slice(0, fractionCursorPosition - 1);
                  const after = currentValue.slice(fractionCursorPosition);
                  setCurrentFractionValue(before + after);
                  setFractionCursorPosition(prev => prev - 1);
                  updateEditingFractionCursor(fractionCursorPosition - 1);
                }
              } else {
                backspace();
              }
            }}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
            title="Backspace"
            disabled={disabled}
          >
            <Delete size={20} />
          </button>

          {/* Clear Button */}
          <button
            onClick={clearDisplay}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
            title="Clear"
            disabled={disabled}
          >
            <Trash2 size={20} />
          </button>
        </div>

        {/* Virtual Keyboard */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          {BUTTONS.map((row, rowIndex) => (
            <div key={rowIndex} className="mb-2 grid grid-cols-5 gap-2">
              {row.map((button, buttonIndex) => (
                <button
                  key={buttonIndex}
                  onClick={() => handleButtonClick(button)}
                  className="flex h-12 items-center justify-center rounded border border-gray-300 text-base font-medium transition-colors hover:bg-white/50 active:bg-white/50 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={disabled}
                >
                  {button.label.includes('<div') ? (
                    <div dangerouslySetInnerHTML={{ __html: button.label }} />
                  ) : (
                    button.label
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Instructions */}
        <p className="mt-2 text-sm text-gray-500">
          Use the virtual keyboard or type directly. Click on fraction boxes to edit them.
        </p>
      </div>

                   {/* Correct answer when in review mode */}
      {showAnswer && correctAnswer && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <h4 className="mb-2 font-medium text-green-800">Correct Answer:</h4>
          <div className="font-mono text-green-700">{correctAnswer}</div>
        </div>
      )}
     </div>
   );
 };
