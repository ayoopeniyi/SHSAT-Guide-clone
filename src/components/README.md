# Equation Calculator Component

A React component that provides a virtual calculator interface for mathematical expressions, with support for fractions, undo/redo functionality, and keyboard input.

## Features

- **Virtual Calculator Interface**: Full calculator with numbers, operators, and mathematical functions
- **Fraction Support**: Create and edit simple and mixed fractions with interactive editing
- **Undo/Redo**: Full history management with keyboard shortcuts (Ctrl+Z, Ctrl+Y)
- **Keyboard Input**: Type directly or use the virtual keyboard
- **Cursor Navigation**: Visual cursor with arrow key navigation
- **Answer Validation**: Support for showing correct answers and validation states
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Installation

Make sure you have the required dependencies:

```bash
npm install lucide-react
```

## Usage

```tsx
import React, { useState } from 'react';
import { EquationCalculator } from './components/EquationCalculator';
import { TestPackQuestion } from './types/testPack';

const MyComponent = () => {
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  const question: TestPackQuestion = {
    id: 1,
    question_number: 1,
    question_type: 'equation_calculator',
    question: 'Solve for x: \\frac{2x + 1}{3} = 5'
  };

  const handleAnswerChange = (answer: string) => {
    setUserAnswer(answer);
    // Validate the answer here
    setIsCorrect(answer.includes('7'));
  };

  return (
    <EquationCalculator
      onAnswerChange={handleAnswerChange}
      question={question}
      showAnswer={false}
      disabled={false}
      userAnswer={userAnswer}
      isAnswerCorrect={isCorrect}
      correctAnswer="x = 7"
    />
  );
};
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onAnswerChange` | `(answer: string) => void` | Required | Callback when the answer changes |
| `question` | `TestPackQuestion` | Required | The question object containing the problem |
| `showAnswer` | `boolean` | `false` | Whether to show the correct answer |
| `disabled` | `boolean` | `false` | Whether the calculator is disabled |
| `userAnswer` | `string` | `undefined` | The current user answer (JSON string) |
| `isAnswerCorrect` | `boolean` | `false` | Whether the current answer is correct |
| `correctAnswer` | `string` | `undefined` | The correct answer to display when showAnswer is true |

## Answer Format

The component stores answers as JSON strings with the following structure:

```json
{
  "display": "2x + 1/3 = 5",
  "fractions": {
    "frac_1234567890_abc123": {
      "num": "1",
      "den": "3",
      "whole": ""
    }
  }
}
```

## Keyboard Shortcuts

- `Ctrl+Z` / `Cmd+Z`: Undo
- `Ctrl+Y` / `Cmd+Y`: Redo
- `Arrow Keys`: Navigate cursor
- `Backspace`: Delete character or fraction
- `Enter` / `Escape` / `Tab`: Finish fraction editing

## Fraction Editing

1. Click the fraction button (⅟) to insert a simple fraction
2. Click the mixed fraction button (1⅟) to insert a mixed fraction
3. Click on any part of the fraction (numerator, denominator, or whole number) to edit it
4. Use keyboard input or the virtual keyboard to enter values
5. Press Enter, Escape, or Tab to finish editing

## Styling

The component uses Tailwind CSS classes and includes a separate CSS file for fraction styling. Make sure to import the CSS file:

```tsx
import './EquationCalculator.css';
```

## Customization

You can customize the calculator buttons by modifying the `BUTTONS` constant in `src/utils/constants/equationCalculator.ts`.

## Dependencies

- React 18+
- TypeScript
- Tailwind CSS
- Lucide React (for icons)

## File Structure

```
src/
├── components/
│   ├── EquationCalculator.tsx
│   ├── EquationCalculator.css
│   └── EquationCalculatorExample.tsx
├── types/
│   └── equationCalculator.ts
├── utils/
│   ├── constants/
│   │   └── equationCalculator.ts
│   └── functions/
│       └── equationCalculator.ts
```

## Example

See `EquationCalculatorExample.tsx` for a complete working example of how to use the component.
