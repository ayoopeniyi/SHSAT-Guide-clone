type QuestionBankAddQuestionProps = {
  setShowQuestionModal: (show: boolean) => void;
};

const QuestionBankAddQuestion = ({
  setShowQuestionModal,
}: QuestionBankAddQuestionProps) => {
  return (
    <main>
      <div className="flex gap-2">
        <button
          className="px-5 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 flex items-center gap-2"
          onClick={() => setShowQuestionModal(true)}
        >
          + Add New Question
        </button>
      </div>
    </main>
  );
};

export default QuestionBankAddQuestion;
