import { CalculatorButton } from '../../types/equationCalculator';

export const BUTTONS: CalculatorButton[][] = [
  [
    { value: '7', label: '7' },
    { value: '8', label: '8' },
    { value: '9', label: '9' },
    { value: '÷', label: '÷' },
    { value: 'C', label: 'C' }
  ],
  [
    { value: '4', label: '4' },
    { value: '5', label: '5' },
    { value: '6', label: '6' },
    { value: '×', label: '×' },
    { value: '(', label: '(' }
  ],
  [
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '-', label: '-' },
    { value: ')', label: ')' }
  ],
  [
    { value: '0', label: '0' },
    { value: '.', label: '.' },
    { value: '=', label: '=' },
    { value: '+', label: '+' },
    { value: 'FRACTION', label: '⅟' }
  ],
  [
    { value: 'MIXED_FRACTION', label: '1⅟' },
    { value: '√', label: '√' },
    { value: 'x²', label: 'x²' },
    { value: 'π', label: 'π' },
    { value: 'e', label: 'e' }
  ]
];

export const MAX_HISTORY = 50;
