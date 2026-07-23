import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { Copy, Check, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './alert';

interface MathDisplayProps {
  expression: string;
  title?: string;
  className?: string;
  showCopyButton?: boolean;
  showError?: boolean;
  errorMessage?: string;
  variant?: 'default' | 'success' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

export const MathDisplay: React.FC<MathDisplayProps> = ({
  expression,
  title,
  className = "",
  showCopyButton = true,
  showError = false,
  errorMessage = "Invalid mathematical expression",
  variant = "default",
  size = "md"
}) => {
  const [renderedExpression, setRenderedExpression] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [copied, setCopied] = useState(false);

  // Size classes
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  // Variant classes
  const variantClasses = {
    default: 'bg-white border-gray-200',
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200'
  };

  // Render mathematical expression using MathJax
  useEffect(() => {
    const renderMathExpression = async () => {
      if (!expression.trim()) {
        setRenderedExpression('');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setHasError(false);

      try {
        // Clean up the expression for better rendering
        let cleanExpression = expression
          .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '\\frac{$1}{$2}')
          .replace(/×/g, '\\times ')
          .replace(/÷/g, '\\div ')
          .replace(/²/g, '^2')
          .replace(/³/g, '^3')
          .replace(/√/g, '\\sqrt{}')
          .replace(/π/g, '\\pi')
          .replace(/∞/g, '\\infty');

        // If it's an equation (contains =), wrap in display mode
        if (cleanExpression.includes('=')) {
          cleanExpression = `\\[${cleanExpression}\\]`;
        } else {
          cleanExpression = `\\(${cleanExpression}\\)`;
        }

        setRenderedExpression(cleanExpression);
        
        // Trigger MathJax rendering
        if (window.MathJax) {
          window.MathJax.typesetPromise();
        }
      } catch (error) {
        console.error('Math rendering error:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    renderMathExpression();
  }, [expression]);

  // Copy expression to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(expression);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Load MathJax if not already loaded
  useEffect(() => {
    if (!window.MathJax) {
      const script = document.createElement('script');
      script.src = 'https://polyfill.io/v3/polyfill.min.js?features=es6';
      script.async = true;
      document.head.appendChild(script);

      const mathJaxScript = document.createElement('script');
      mathJaxScript.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
      mathJaxScript.async = true;
      mathJaxScript.onload = () => {
        window.MathJax = {
          tex: {
            inlineMath: [['\\(', '\\)']],
            displayMath: [['\\[', '\\]']],
            processEscapes: true,
            processEnvironments: true
          },
          options: {
            ignoreHtmlClass: 'tex2jax_ignore',
            processHtmlClass: 'tex2jax_process'
          },
          typesetPromise: () => Promise.resolve()
        };
      };
      document.head.appendChild(mathJaxScript);
    }
  }, []);

  if (isLoading) {
    return (
      <Card className={`${variantClasses[variant]} ${className}`}>
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasError || showError) {
    return (
      <Card className={`${variantClasses.error} ${className}`}>
        <CardContent className="p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${variantClasses[variant]} ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            {title && (
              <div className="mb-2">
                <Badge variant="outline" className="text-xs">
                  {title}
                </Badge>
              </div>
            )}
            
            <div 
              className={`${sizeClasses[size]} font-mono`}
              dangerouslySetInnerHTML={{ __html: renderedExpression }}
            />
          </div>
          
          {showCopyButton && (
            <Button
              onClick={copyToClipboard}
              variant="ghost"
              size="sm"
              className="shrink-0"
              title="Copy expression"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Add MathJax types to window
declare global {
  interface Window {
    MathJax?: {
      tex: {
        inlineMath: string[][];
        displayMath: string[][];
        processEscapes: boolean;
        processEnvironments: boolean;
      };
      options: {
        ignoreHtmlClass: string;
        processHtmlClass: string;
      };
      typesetPromise: () => Promise<void>;
    };
  }
} 