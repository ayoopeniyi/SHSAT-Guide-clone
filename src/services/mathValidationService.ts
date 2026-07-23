import algebra from 'algebra.js';

export interface MathValidationResult {
  isValid: boolean;
  isEquivalent: boolean;
  error?: string;
  normalizedAnswer?: string;
  steps?: string[];
}

export interface MathExpression {
  expression: string;
  variables?: string[];
  domain?: 'real' | 'complex' | 'integer';
}

export class MathValidationService {
  /**
   * Validates if a mathematical expression is syntactically correct
   */
  static validateExpression(expression: string): MathValidationResult {
    try {
      if (!expression.trim()) {
        return {
          isValid: false,
          isEquivalent: false,
          error: 'Expression cannot be empty'
        };
      }

      // Try to parse the expression
      const parsed = algebra.parse(expression);
      
      return {
        isValid: true,
        isEquivalent: false,
        normalizedAnswer: parsed.toTex()
      };
    } catch (error) {
      return {
        isValid: false,
        isEquivalent: false,
        error: `Invalid mathematical expression: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Compares two mathematical expressions for equivalence
   */
  static compareExpressions(
    studentAnswer: string, 
    correctAnswer: string,
    variables: string[] = ['x', 'y', 'z']
  ): MathValidationResult {
    try {
      // Validate both expressions
      const studentValidation = this.validateExpression(studentAnswer);
      const correctValidation = this.validateExpression(correctAnswer);

      if (!studentValidation.isValid) {
        return studentValidation;
      }

      if (!correctValidation.isValid) {
        return {
          isValid: false,
          isEquivalent: false,
          error: 'Correct answer is invalid'
        };
      }

      // Parse both expressions
      const studentExpr = algebra.parse(studentAnswer);
      const correctExpr = algebra.parse(correctAnswer);

      // Check if they're exactly the same
      if (studentAnswer.trim() === correctAnswer.trim()) {
        return {
          isValid: true,
          isEquivalent: true,
          normalizedAnswer: studentValidation.normalizedAnswer,
          steps: ['Expressions are identical']
        };
      }

      // Try to solve for variables and compare
      const steps: string[] = [];
      let isEquivalent = false;

      // Check if both are equations
      if (studentAnswer.includes('=') && correctAnswer.includes('=')) {
        try {
          const studentSolution = studentExpr.solveFor('x');
          const correctSolution = correctExpr.solveFor('x');
          
          steps.push(`Student solution: ${studentSolution.toTex()}`);
          steps.push(`Correct solution: ${correctSolution.toTex()}`);
          
          // Compare solutions
          const studentValue = this.evaluateExpression(studentSolution.toString());
          const correctValue = this.evaluateExpression(correctSolution.toString());
          
          isEquivalent = Math.abs(studentValue - correctValue) < 1e-10;
          
          if (isEquivalent) {
            steps.push('Solutions are equivalent');
          } else {
            steps.push('Solutions are different');
          }
        } catch (solveError) {
          // If solving fails, try other comparison methods
          steps.push('Could not solve equations, trying other methods...');
        }
      }

      // If not equivalent yet, try simplifying both expressions
      if (!isEquivalent) {
        try {
          const simplifiedStudent = studentExpr.simplify();
          const simplifiedCorrect = correctExpr.simplify();
          
          steps.push(`Simplified student: ${simplifiedStudent.toTex()}`);
          steps.push(`Simplified correct: ${simplifiedCorrect.toTex()}`);
          
          // Compare simplified forms
          if (simplifiedStudent.toString() === simplifiedCorrect.toString()) {
            isEquivalent = true;
            steps.push('Simplified expressions are identical');
          }
        } catch (simplifyError) {
          steps.push('Could not simplify expressions');
        }
      }

      // If still not equivalent, try numerical evaluation
      if (!isEquivalent) {
        try {
          const testValues = [-2, -1, 0, 1, 2];
          let allEqual = true;
          
          for (const value of testValues) {
            const studentValue = this.evaluateExpression(studentAnswer.replace(/x/g, value.toString()));
            const correctValue = this.evaluateExpression(correctAnswer.replace(/x/g, value.toString()));
            
            if (Math.abs(studentValue - correctValue) > 1e-10) {
              allEqual = false;
              break;
            }
          }
          
          if (allEqual) {
            isEquivalent = true;
            steps.push('Expressions are equivalent for test values');
          } else {
            steps.push('Expressions are not equivalent for test values');
          }
        } catch (evalError) {
          steps.push('Could not evaluate expressions numerically');
        }
      }

      return {
        isValid: true,
        isEquivalent,
        normalizedAnswer: studentValidation.normalizedAnswer,
        steps
      };

    } catch (error) {
      return {
        isValid: false,
        isEquivalent: false,
        error: `Comparison failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Evaluates a mathematical expression numerically
   */
  private static evaluateExpression(expression: string): number {
    try {
      // Replace common mathematical functions
      let evalExpression = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/√/g, 'Math.sqrt')
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/log/g, 'Math.log')
        .replace(/ln/g, 'Math.log');

      // Use Function constructor for safe evaluation
      const func = new Function('Math', `return ${evalExpression}`);
      return func(Math);
    } catch (error) {
      throw new Error(`Evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Solves an equation for a specific variable
   */
  static solveEquation(equation: string, variable: string = 'x'): MathValidationResult {
    try {
      const expr = algebra.parse(equation);
      const solution = expr.solveFor(variable);
      
      return {
        isValid: true,
        isEquivalent: false,
        normalizedAnswer: solution.toTex(),
        steps: [
          `Original equation: ${expr.toTex()}`,
          `Solving for ${variable}: ${solution.toTex()}`
        ]
      };
    } catch (error) {
      return {
        isValid: false,
        isEquivalent: false,
        error: `Could not solve equation: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Simplifies a mathematical expression
   */
  static simplifyExpression(expression: string): MathValidationResult {
    try {
      const expr = algebra.parse(expression);
      const simplified = expr.simplify();
      
      return {
        isValid: true,
        isEquivalent: false,
        normalizedAnswer: simplified.toTex(),
        steps: [
          `Original expression: ${expr.toTex()}`,
          `Simplified: ${simplified.toTex()}`
        ]
      };
    } catch (error) {
      return {
        isValid: false,
        isEquivalent: false,
        error: `Could not simplify expression: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Checks if an answer matches any of the correct answers (for multiple correct answers)
   */
  static checkMultipleAnswers(
    studentAnswer: string, 
    correctAnswers: string[]
  ): MathValidationResult {
    for (const correctAnswer of correctAnswers) {
      const comparison = this.compareExpressions(studentAnswer, correctAnswer);
      if (comparison.isEquivalent) {
        return {
          ...comparison,
          steps: [...(comparison.steps || []), `Matched correct answer: ${correctAnswer}`]
        };
      }
    }

    return {
      isValid: true,
      isEquivalent: false,
      error: 'Answer does not match any of the correct answers',
      steps: ['Checked against all correct answers - no match found']
    };
  }

  /**
   * Converts a mathematical expression to LaTeX format
   */
  static toLatex(expression: string): string {
    try {
      const expr = algebra.parse(expression);
      return expr.toTex();
    } catch (error) {
      return expression; // Return original if parsing fails
    }
  }

  /**
   * Extracts variables from a mathematical expression
   */
  static extractVariables(expression: string): string[] {
    try {
      const expr = algebra.parse(expression);
      // This is a simplified approach - algebra.js doesn't directly expose variables
      // You might need to implement a more sophisticated variable extraction
      const variableRegex = /[a-zA-Z]/g;
      const matches = expression.match(variableRegex) || [];
      return [...new Set(matches)].filter(v => !['e', 'i', 'π'].includes(v));
    } catch (error) {
      return [];
    }
  }
} 