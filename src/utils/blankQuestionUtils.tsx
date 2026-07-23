import React from "react";

/**
 * Renders a blank question with input fields and the default instruction
 * "Enter your answer in the space."
 */
export const renderBlankQuestion = (
  questionText: string,
  options: {
    disabled?: boolean;
    showInstruction?: boolean;
    inputClassName?: string;
    instructionClassName?: string;
  } = {},
) => {
  const {
    disabled = true,
    showInstruction = true,
    inputClassName = "border-b-2 border-gray-400 bg-transparent px-2 py-1 w-[120px] text-center focus:border-blue-500 focus:outline-none",
    instructionClassName = "text-sm text-gray-600 italic",
  } = options;

  // Handle null or undefined questionText
  if (!questionText) {
    return (
      <div>
        {showInstruction && (
          <div className={`mb-2 ${instructionClassName}`}>
            Enter your answer in the space.
          </div>
        )}
        <div className="break-words text-gray-500 italic">
          No question text available
        </div>
      </div>
    );
  }

  // Use regex to find any sequence of 2 or more underscores (more flexible)
  const blankRegex = /_{2,}/g;
  const parts = questionText.split(blankRegex);
  const blanks = questionText.match(blankRegex) || [];

  return (
    <div>
      {showInstruction && (
        <div className={`mb-2 ${instructionClassName}`}>
          Enter your answer in the space.
        </div>
      )}
      <div className="break-words">
        {parts.map((part, idx) => (
          <span key={idx}>
            {part}
            {idx < blanks.length && (
              <span className="inline-block mx-1">
                <input
                  type="text"
                  className={inputClassName}
                  placeholder=""
                  disabled={disabled}
                />
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
};

/**
 * Renders a "Fill in the Box" question with a single text input below the question
 */
export const renderFillBoxQuestion = (
  questionText: string,
  options: {
    disabled?: boolean;
    showInstruction?: boolean;
    inputClassName?: string;
    instructionClassName?: string;
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
  } = {},
) => {
  const {
    disabled = true,
    showInstruction = true,
    inputClassName = "border-2 border-gray-300 rounded px-2 py-1 w-auto min-w-[100px] max-w-[250px] focus:border-blue-500 focus:outline-none text-center text-sm",
    instructionClassName = "text-sm text-gray-600 italic",
    value = "",
    onChange,
    placeholder = "",
  } = options;

  return (
    <div>
      <div className="mb-4 text-base text-gray-900">
        {questionText || "No question text available"}
      </div>
      {showInstruction && (
        <div className={`mb-2 ${instructionClassName}`}>
          Enter your answer in the space.
        </div>
      )}
      <div className="flex justify-start">
        <input
          type="text"
          className={inputClassName}
          placeholder={placeholder}
          disabled={disabled}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          style={{
            width: `${Math.max(100, Math.min(250, (value?.length || placeholder?.length || 10) * 10 + 30))}px`,
          }}
        />
      </div>
    </div>
  );
};

/**
 * Renders a blank question preview with underlines instead of input fields
 * (useful for admin previews)
 */
export const renderBlankQuestionPreview = (
  questionText: string,
  options: {
    showInstruction?: boolean;
    instructionClassName?: string;
  } = {},
) => {
  const {
    showInstruction = true,
    instructionClassName = "text-sm text-gray-600 italic",
  } = options;

  // Handle null or undefined questionText
  if (!questionText) {
    return (
      <div>
        {showInstruction && (
          <div className={`mb-2 ${instructionClassName}`}>
            Enter your answer in the space.
          </div>
        )}
        <div className="break-words text-gray-500 italic">
          No question text available
        </div>
      </div>
    );
  }

  // Use regex to find any sequence of 2 or more underscores (more flexible)
  const blankRegex = /_{2,}/g;
  const parts = questionText.split(blankRegex);
  const blanks = questionText.match(blankRegex) || [];

  return (
    <div>
      {showInstruction && (
        <div className={`mb-2 ${instructionClassName}`}>
          Enter your answer in the space.
        </div>
      )}
      <div className="break-words">
        {parts.map((part, idx) => (
          <span key={idx}>
            {part}
            {idx < blanks.length && (
              <span className="inline-block mx-1 border-b-2 border-gray-400 w-[120px] h-6 align-bottom"></span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
};

/**
 * Renders a blank question for question cards with actual input boxes
 * (shows what students will see)
 */
export const renderBlankQuestionCard = (
  questionText: string,
  options: {
    showInstruction?: boolean;
    instructionClassName?: string;
  } = {},
) => {
  const {
    showInstruction = true,
    instructionClassName = "text-sm text-gray-600 italic",
  } = options;

  // Handle null or undefined questionText
  if (!questionText) {
    return (
      <div>
        {showInstruction && (
          <div className={`mb-2 ${instructionClassName}`}>
            Enter your answer in the space.
          </div>
        )}
        <div className="break-words text-gray-500 italic">
          No question text available
        </div>
      </div>
    );
  }

  // Use regex to find any sequence of 2 or more underscores (more flexible)
  const blankRegex = /_{2,}/g;
  const parts = questionText.split(blankRegex);
  const blanks = questionText.match(blankRegex) || [];

  return (
    <div>
      {showInstruction && (
        <div className={`mb-2 ${instructionClassName}`}>
          Enter your answer in the space.
        </div>
      )}
      <div className="break-words">
        {parts.map((part, idx) => (
          <span key={idx}>
            {part}
            {idx < blanks.length && (
              <span className="inline-block mx-1">
                <input
                  type="text"
                  className="border-b-2 border-gray-400 bg-transparent px-2 py-1 w-[120px] text-center focus:border-blue-500 focus:outline-none"
                  placeholder=""
                  disabled={true}
                />
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
};

/**
 * Renders a "Fill in the Box" preview (for admin/teacher view)
 */
export const renderFillBoxPreview = (
  questionText: string,
  options: {
    showInstruction?: boolean;
    instructionClassName?: string;
  } = {},
) => {
  const {
    showInstruction = true,
    instructionClassName = "text-sm text-gray-600 italic",
  } = options;

  return (
    <div>
      <div className="mb-4 text-base text-gray-900">
        {questionText || "No question text available"}
      </div>
      {showInstruction && (
        <div className={`mb-2 ${instructionClassName}`}>
          Enter your answer in the space.
        </div>
      )}
      <div className="flex justify-start">
        <div className="border-2 border-gray-400 rounded px-2 py-1 min-w-[100px] max-w-[250px] h-8 bg-gray-50"></div>
      </div>
    </div>
  );
};

/**
 * Constant for the default blank question instruction
 */
export const BLANK_QUESTION_INSTRUCTION = "Enter your answer in the space.";

/**
 * Checks if a question has blank placeholders
 */
export const hasBlankPlaceholders = (questionText: string): boolean => {
  if (!questionText) return false;
  return /_{2,}/.test(questionText);
};

/**
 * Gets the number of blanks in a question
 */
export const getBlankCount = (questionText: string): number => {
  if (!questionText) return 0;
  return (questionText.match(/_{2,}/g) || []).length;
};
