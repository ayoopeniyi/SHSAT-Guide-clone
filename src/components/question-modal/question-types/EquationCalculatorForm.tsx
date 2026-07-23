import React from 'react';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Input } from '../../ui/input';

import { EquationCalculator } from '../../EquationCalculator';
import ImageUpload from '../../ImageUpload';
import { HierarchySection } from '../components/HierarchySection';
import { ChoiceTagEditor, type TagSlot } from '../../shared/ChoiceTagEditor';
import { Tags } from "lucide-react";

interface EquationCalculatorFormProps {
  question: string;
  setQuestion: (question: string) => void;
  correctAnswer: string;
  setCorrectAnswer: (answer: string) => void;
  questionImageUrl?: string;
  onQuestionImageUploaded: (imageUrl: string) => void;
  onQuestionImageDeleted: () => void;
  difficulty: number;
  setDifficulty: (difficulty: number) => void;
  questionId?: number;
  userName: string;
  isTestPack?: boolean;
  allowTemporary?: boolean;
  // Hierarchy fields
  eqChapter?: number;
  setEqChapter?: (value: number | undefined) => void;
  eqTopic?: number;
  setEqTopic?: (value: number | undefined) => void;
  eqSubTopic?: number;
  setEqSubTopic?: (value: number | undefined) => void;
  eqQuestionCategory?: string;
  setEqQuestionCategory?: (value: string) => void;
  explanation?: string;
  setExplanation?: (value: string) => void;
  eqTagSlots?: TagSlot[];
  setEqTagSlots?: (slots: TagSlot[]) => void;
}

export const EquationCalculatorForm: React.FC<EquationCalculatorFormProps> = ({
  question,
  setQuestion,
  correctAnswer,
  setCorrectAnswer,
  questionImageUrl,
  onQuestionImageUploaded,
  onQuestionImageDeleted,
  difficulty,
  setDifficulty,
  questionId,
  userName,
  isTestPack = false,
  allowTemporary = false,
  // Hierarchy fields
  eqChapter,
  setEqChapter,
  eqTopic,
  setEqTopic,
  eqSubTopic,
  setEqSubTopic,
  eqQuestionCategory,
  setEqQuestionCategory,
  explanation,
  setExplanation,
  eqTagSlots = [],
  setEqTagSlots = () => { },
}) => {
  return (
    <div className="space-y-6">
      {/* Question */}
      <div>
        <Label htmlFor="question">Question</Label>
        <Textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter the equation calculator question..."
          rows={4}
          className="mt-1"
        />
        <p className="text-sm text-gray-500 mt-1">
          You can include mathematical expressions in LaTeX format: $x^2 + 2x + 1 = 0$
        </p>
      </div>
      <div>
        <Label htmlFor="difficulty">Difficulty Level</Label>
        <Input
          id="difficulty"
          type="number"
          min={1}
          max={5}
          value={difficulty || ''}
          onChange={(e) => setDifficulty(Number(e.target.value))}
          placeholder="Enter difficulty level (1-5)"
          className="mt-1"
        />
        <p className="text-sm text-gray-500 mt-1">
          1 = Very Easy, 2 = Easy, 3 = Medium, 4 = Hard, 5 = Very Hard
        </p>
      </div>


      <div>
        <div className="flex items-center justify-between mb-1">
          <Label htmlFor="correctAnswer">Correct Answer</Label>
        </div>
        <div className="text-xs text-gray-500 mb-2">
          Use the calculator below to enter the correct mathematical answer
        </div>
        <div className="border rounded-lg p-4 bg-gray-50">
          <EquationCalculator
            onAnswerChange={(answer) => {
              // Update the correct answer when the calculator answer changes
              // The answer comes as a JSON string, we need to extract the display value
              /* console.log("🔍 [EquationCalculatorForm] onAnswerChange received:", answer); */
              try {
                const answerData = JSON.parse(answer);
                /* console.log("🔍 [EquationCalculatorForm] Parsed answer data:", answerData); */

                // Extract display value, but if it's empty, try to construct from fractions
                let displayValue = answerData.display;

                if (!displayValue || displayValue.trim() === "") {
                  // If display is empty, try to construct from fractions
                  const fractions = answerData.fractions || {};
                  const fractionKeys = Object.keys(fractions);

                  if (fractionKeys.length > 0) {
                    // Construct display from fractions (e.g., "1/2" from {numerator: 1, denominator: 2})
                    displayValue = fractionKeys.map(key => {
                      const frac = fractions[key];
                      if (frac && frac.numerator !== undefined && frac.denominator !== undefined) {
                        return `${frac.numerator}/${frac.denominator}`;
                      }
                      return key;
                    }).join(' + ');
                  } else {
                    // If no fractions either, don't set anything - let user enter something
                    /* console.log("🔍 [EquationCalculatorForm] No display value or fractions, not setting answer"); */
                    return;
                  }
                }

                /* console.log("🔍 [EquationCalculatorForm] Setting correct answer to:", displayValue); */
                setCorrectAnswer(displayValue);
              } catch (e) {
                /* console.log("🔍 [EquationCalculatorForm] Failed to parse JSON, using raw answer:", answer); */
                // If it's not JSON, use the answer as is
                setCorrectAnswer(answer);
              }
            }}
            question={{
              id: 1,
              question_number: 1,
              question_type: 'equation_calculator',
              question: 'Enter the correct answer using the calculator below',
              answer: correctAnswer || "",
              content: question || ""
            }}
            showAnswer={false}
            disabled={false}
            userAnswer={correctAnswer || '{"display":"","fractions":{}}'}
            isAnswerCorrect={false}
            correctAnswer=""
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          The calculator above will automatically update the correct answer field as you type.
        </p>
      </div>

      {/* Question Image */}
      <div>
        <Label>Question Image (optional)</Label>
        <div className="text-xs text-gray-500 mb-2">
          Upload, replace, or remove the question image
        </div>
        <ImageUpload
          currentImageUrl={questionImageUrl}
          onImageUploaded={onQuestionImageUploaded}
          onImageDeleted={onQuestionImageDeleted}
          uploadId={questionId}
          uploadType="question"
          userName={userName}
          className="mt-2"
          isTestPack={isTestPack}
          allowTemporary={allowTemporary}
        />
      </div>

      {/* Explanation */}
      <div>
        <Label>Explanation (optional)</Label>
        <Textarea
          value={explanation || ""}
          onChange={(e) => setExplanation?.(e.target.value)}
          placeholder="Enter an explanation for this question"
          className="mt-1"
        />
      </div>

      {/* Test Pack Specific Fields */}
      {/* {isTestPack && (
        <>
          
          <div>
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Input
              id="difficulty"
              type="number"
              min={1}
              max={5}
              value={difficulty || ''}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              placeholder="Enter difficulty level (1-5)"
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              1 = Very Easy, 2 = Easy, 3 = Medium, 4 = Hard, 5 = Very Hard
            </p>
          </div>
        </>
      )} */}

      {/* Enhanced Preview Section */}
      <div className="border-t pt-6">
        <Label className="text-lg font-semibold mb-3">Student View Preview</Label>
        <div className="border rounded-lg p-4 bg-gray-50">
          <EquationCalculator
            onAnswerChange={() => { }}
            question={{
              id: 1,
              question_number: 1,
              question_type: 'equation_calculator',
              question: question || 'Enter a question to see preview...',
              answer: correctAnswer || "",
              content: question || ""
            }}
            showAnswer={false}
            disabled={true}
            userAnswer=""
            isAnswerCorrect={false}
            correctAnswer={correctAnswer || 'Enter correct answer to see preview...'}
          />
        </div>
      </div>

      {/* Hierarchy Section for Question Bank (not test pack) */}
      {!isTestPack && (
        <HierarchySection
          isTestPack={isTestPack}
          questionCategory={eqQuestionCategory}
          setQuestionCategory={setEqQuestionCategory}
          chapter={eqChapter}
          setChapter={setEqChapter}
          topic={eqTopic}
          setTopic={setEqTopic}
          subTopic={eqSubTopic}
          setSubTopic={setEqSubTopic}
        />
      )}

      {/* Reasoning Pattern Tags */}
      <div className="pt-4 border-t border-gray-100">
        <ChoiceTagEditor
          choiceType={isTestPack ? "test_pack" : "pre_shsat"}
          localSlots={eqTagSlots}
          onLocalSlotsChange={setEqTagSlots}
          choiceId={questionId}
        />
      </div>
    </div>
  );
};