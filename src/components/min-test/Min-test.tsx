import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Award, RotateCcw, BookOpen, Brain, TrendingUp } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: 'Math' | 'ELA';
}

const questions: Question[] = [
  {
    id: 1,
    subject: 'Math',
    question: 'If x + 5 = 12, what is the value of x?',
    options: ['5', '7', '17', '60'],
    correctAnswer: 1,
    explanation: 'To solve x + 5 = 12, subtract 5 from both sides: x = 12 - 5 = 7'
  },
  {
    id: 2,
    subject: 'Math',
    question: 'What is 15% of 200?',
    options: ['15', '30', '45', '50'],
    correctAnswer: 1,
    explanation: '15% of 200 = 0.15 × 200 = 30'
  },
  {
    id: 3,
    subject: 'ELA',
    question: 'Which word is a synonym for "meticulous"?',
    options: ['Careless', 'Detailed', 'Quick', 'Lazy'],
    correctAnswer: 1,
    explanation: 'Meticulous means showing great attention to detail, making "detailed" the correct synonym.'
  },
  {
    id: 4,
    subject: 'Math',
    question: 'If a rectangle has a length of 8 cm and width of 5 cm, what is its perimeter?',
    options: ['13 cm', '26 cm', '40 cm', '80 cm'],
    correctAnswer: 1,
    explanation: 'Perimeter = 2(length + width) = 2(8 + 5) = 2(13) = 26 cm'
  },
  {
    id: 5,
    subject: 'ELA',
    question: 'Choose the sentence with correct punctuation:',
    options: [
      'The students books were on the desk.',
      'The students\' books were on the desk.',
      'The student\'s books were on the desk.',
      'The students book\'s were on the desk.'
    ],
    correctAnswer: 1,
    explanation: 'When referring to books belonging to multiple students, use "students\'" (plural possessive).'
  }
];

const MiniTest: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [testStarted, setTestStarted] = useState(false);

  useEffect(() => {
    if (testStarted && !showResults && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [testStarted, showResults, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === questions[index].correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswers(new Array(questions.length).fill(null));
    setShowResults(false);
    setTimeLeft(600);
    setTestStarted(false);
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Start Screen
  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-6">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">SHSAT Mini-Test</h1>
            <p className="text-gray-600 text-lg">Quick assessment to test your skills</p>
          </div>

          <div className="space-y-6 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Test Details
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span><strong>Questions:</strong> {questions.length} mixed (Math & ELA)</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span><strong>Time Limit:</strong> 10 minutes</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span><strong>Format:</strong> Multiple choice</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span><strong>Passing Score:</strong> 80% or higher</span>
                </li>
              </ul>
            </div>

            <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
              <h2 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                Tips for Success
              </h2>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Read each question carefully before answering</li>
                <li>• You can navigate between questions using Previous/Next buttons</li>
                <li>• Review your answers before submitting</li>
                <li>• Detailed explanations will be provided after submission</li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => setTestStarted(true)}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Start Mini-Test
          </button>
        </div>
      </div>
    );
  }

  // Results Screen
  if (showResults) {
    const score = calculateScore();
    const percentage = ((score / questions.length) * 100).toFixed(0);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Score Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${
                percentage >= '80' ? 'bg-green-100' : percentage >= '60' ? 'bg-blue-100' : 'bg-yellow-100'
              }`}>
                <Award className={`w-12 h-12 ${getScoreColor(score, questions.length)}`} />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Test Complete!</h1>
              <p className="text-gray-600 text-lg">Here's how you performed</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 text-center border border-blue-200">
                <p className="text-gray-600 mb-2">Your Score</p>
                <p className={`text-4xl font-bold ${getScoreColor(score, questions.length)}`}>
                  {score}/{questions.length}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 text-center border border-purple-200">
                <p className="text-gray-600 mb-2">Percentage</p>
                <p className={`text-4xl font-bold ${getScoreColor(score, questions.length)}`}>
                  {percentage}%
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 text-center border border-green-200">
                <p className="text-gray-600 mb-2">Status</p>
                <p className={`text-2xl font-bold ${percentage >= '80' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {percentage >= '80' ? 'Excellent!' : percentage >= '60' ? 'Good' : 'Keep Practicing'}
                </p>
              </div>
            </div>

            <button
              onClick={handleRestart}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Retake Test
            </button>
          </div>

          {/* Detailed Results */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Detailed Review</h2>
            {questions.map((question, index) => {
              const isCorrect = selectedAnswers[index] === question.correctAnswer;
              return (
                <div key={question.id} className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-600">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                          {question.subject}
                        </span>
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <p className="text-gray-900 font-medium mb-4">{question.question}</p>
                      
                      <div className="space-y-2 mb-4">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`p-3 rounded-lg border-2 ${
                              optIndex === question.correctAnswer
                                ? 'border-green-500 bg-green-50'
                                : selectedAnswers[index] === optIndex
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-200 bg-gray-50'
                            }`}
                          >
                            <span className="font-medium text-gray-700">{String.fromCharCode(65 + optIndex)}. </span>
                            <span className="text-gray-900">{option}</span>
                            {optIndex === question.correctAnswer && (
                              <span className="ml-2 text-green-600 font-semibold">(Correct Answer)</span>
                            )}
                            {selectedAnswers[index] === optIndex && optIndex !== question.correctAnswer && (
                              <span className="ml-2 text-red-600 font-semibold">(Your Answer)</span>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-sm font-semibold text-blue-900 mb-1">Explanation:</p>
                        <p className="text-sm text-gray-700">{question.explanation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Test Screen
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold">
                Question {currentQuestion + 1}/{questions.length}
              </span>
              <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold">
                {question.subject}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-5 h-5" />
              <span className="font-mono font-bold text-lg">{formatTime(timeLeft)}</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{question.question}</h2>
          
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  selectedAnswers[currentQuestion] === index
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <span className="font-semibold text-gray-700 mr-3">
                  {String.fromCharCode(65 + index)}.
                </span>
                <span className="text-gray-900">{option}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex-1 py-3 bg-white text-gray-700 rounded-xl font-semibold border-2 border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Previous
          </button>
          
          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg"
            >
              Submit Test
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
            >
              Next
            </button>
          )}
        </div>

        {/* Question Navigator */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Question Navigator</h3>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-full aspect-square rounded-lg font-semibold transition-all duration-200 ${
                  index === currentQuestion
                    ? 'bg-blue-600 text-white shadow-lg'
                    : selectedAnswers[index] !== null
                    ? 'bg-green-100 text-green-700 border-2 border-green-500'
                    : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniTest;