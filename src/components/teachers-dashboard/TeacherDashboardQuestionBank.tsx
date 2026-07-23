import { FileText } from "lucide-react";
import { Link } from "react-router-dom";

const TeacherDashboardQuestionBank = () => {
  return (
    <main>
      <Link
        to="/question-bank"
        className="block p-4 w-full bg-white rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-green-600" />
          <div className="text-left">
            <h3 className="font-medium">Question Bank</h3>
            <p className="text-sm text-gray-500">Create and manage questions</p>
          </div>
        </div>
      </Link>
    </main>
  );
};

export default TeacherDashboardQuestionBank;
