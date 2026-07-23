import React, { useState } from 'react';
import { EquationCalculator } from './EquationCalculator';
import { TestPackQuestion } from '../types/testPack';

const exampleQuestion: TestPackQuestion = {
  id: 1,
  question_number: 1,
  question_type: 'equation_calculator',
  question: 'Solve for x: \\frac{2x + 1}{3} = 5'
};

export const EquationCalculatorExample: React.FC = () => {
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  const handleAnswerChange = (answer: string) => {
    setUserAnswer(answer);
    // Here you would typically validate the answer against the correct answer
    // For this example, we'll just check if the answer contains "7"
    setIsCorrect(answer.includes('7'));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Equation Calculator Example</h1>
      
      <div className="mb-4 flex gap-4">
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {showAnswer ? 'Hide Answer' : 'Show Answer'}
        </button>
        
        <button
          onClick={() => {
            setUserAnswer('');
            setIsCorrect(false);
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Answer
        </button>
      </div>

      <EquationCalculator
        onAnswerChange={handleAnswerChange}
        question={exampleQuestion}
        showAnswer={showAnswer}
        userAnswer={userAnswer}
        isAnswerCorrect={isCorrect}
        correctAnswer="x = 7"
      />

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Current Answer:</h3>
        <pre className="text-sm">{userAnswer || 'No answer yet'}</pre>
        
        <h3 className="font-semibold mb-2 mt-4">Is Correct:</h3>
        <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
          {isCorrect ? 'Yes' : 'No'}
        </span>
      </div>
    </div>
  );
};
