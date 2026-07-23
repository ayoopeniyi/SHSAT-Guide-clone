import { useNavigate } from "react-router-dom";

const QuestionBankNav = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/teachers");
  };

  return (
    <main>
      <button
        className="px-4 py-2 mb-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        onClick={handleBack}
      >
        ← Back to Teacher Dashboard
      </button>
    </main>
  );
};

export default QuestionBankNav;
