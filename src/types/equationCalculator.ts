export interface CalculatorButton {
  value: string;
  label: string;
  type?: 'number' | 'operator' | 'function' | 'fraction';
}

export interface FractionValue {
  num: string;
  den: string;
  whole?: string;
}

export interface FractionValues {
  [key: string]: FractionValue;
}

export interface EditingFraction {
  id: string;
  part: 'num' | 'den' | 'whole';
  cursorPosition?: number;
}

export interface HistoryState {
  display: string;
  cursor: number;
}

export interface AnswerData {
  display: string;
  fractions: FractionValues;
}
