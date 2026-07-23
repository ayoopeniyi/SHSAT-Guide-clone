import { EditingFraction, FractionValues } from '../../types/equationCalculator';

export function getDisplayClass(
  isCorrect: boolean,
  disabled: boolean,
  isEditing: boolean,
  showAnswer: boolean
): string {
  let baseClass = 'min-h-[60px] w-full rounded-lg border-2 px-4 py-3 text-left transition-all focus:outline-none focus:ring-2 focus:ring-blue-500';

  if (disabled) {
    return `${baseClass} bg-gray-100 border-gray-300 cursor-not-allowed`;
  }

  if (showAnswer) {
    if (isCorrect) {
      return `${baseClass} bg-green-50 border-green-300 text-green-800`;
    } else {
      return `${baseClass} bg-red-50 border-red-300 text-red-800`;
    }
  }

  if (isEditing) {
    return `${baseClass} bg-white border-blue-400 shadow-sm`;
  }

  return `${baseClass} bg-white border-gray-300 hover:border-gray-400`;
}

export function renderFractionBoxes(
  display: string,
  fractionValues: FractionValues,
  editingFraction: EditingFraction | null
): string {
  let result = display;

  // Replace fraction placeholders with HTML
  const fractionRegex = /\[FRAC:([^:]+):([^\]]+)\]/g;
  result = result.replace(fractionRegex, (match, fractionId, type) => {
    const fraction = fractionValues[fractionId];
    if (!fraction) return match;

    const isEditing = editingFraction?.id === fractionId;
    const editingPart = editingFraction?.part;

    if (type === 'SIMPLE') {
      return renderSimpleFraction(fraction, fractionId, isEditing, editingPart);
    } else if (type === 'MIXED') {
      return renderMixedFraction(fraction, fractionId, isEditing, editingPart);
    }

    return match;
  });

  return result;
}

function renderSimpleFraction(
  fraction: any,
  fractionId: string,
  isEditing: boolean,
  editingPart?: string
): string {
  const numClass = isEditing && editingPart === 'num' ? 'fraction-caret' : '';
  const denClass = isEditing && editingPart === 'den' ? 'fraction-caret' : '';

  return `
    <span class="fraction-container inline-block" data-fraction-id="${fractionId}">
      <div class="fraction-line">
        <span class="fraction-numerator ${numClass}" data-fraction-id="${fractionId}" data-fraction-part="num">
          ${fraction.num || '&nbsp;'}
        </span>
      </div>
      <div class="fraction-divider">─</div>
      <div class="fraction-line">
        <span class="fraction-denominator ${denClass}" data-fraction-id="${fractionId}" data-fraction-part="den">
          ${fraction.den || '&nbsp;'}
        </span>
      </div>
    </span>
  `;
}

function renderMixedFraction(
  fraction: any,
  fractionId: string,
  isEditing: boolean,
  editingPart?: string
): string {
  const wholeClass = isEditing && editingPart === 'whole' ? 'fraction-caret' : '';
  const numClass = isEditing && editingPart === 'num' ? 'fraction-caret' : '';
  const denClass = isEditing && editingPart === 'den' ? 'fraction-caret' : '';

  return `
    <span class="fraction-container inline-block" data-fraction-id="${fractionId}">
      <span class="fraction-whole ${wholeClass}" data-fraction-id="${fractionId}" data-fraction-part="whole">
        ${fraction.whole || '&nbsp;'}
      </span>
      <span class="fraction-container inline-block">
        <div class="fraction-line">
          <span class="fraction-numerator ${numClass}" data-fraction-id="${fractionId}" data-fraction-part="num">
            ${fraction.num || '&nbsp;'}
          </span>
        </div>
        <div class="fraction-divider">─</div>
        <div class="fraction-line">
          <span class="fraction-denominator ${denClass}" data-fraction-id="${fractionId}" data-fraction-part="den">
            ${fraction.den || '&nbsp;'}
          </span>
        </div>
      </span>
    </span>
  `;
}

export function latexToHtml(latex: string): string {
  // Simple LaTeX to HTML conversion
  // This is a basic implementation - you might want to use a proper LaTeX renderer
  return latex
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '<span class="fraction">$1/$2</span>')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\pi/g, 'π')
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷');
}
