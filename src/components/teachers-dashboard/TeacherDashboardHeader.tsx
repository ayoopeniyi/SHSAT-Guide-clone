import { Book, FileText } from "lucide-react";

type TeacherDashboardHeaderProps = {
  chaptersLength: number;
  totalQuestions: number;
};

const TeacherDashboardHeader = ({
  chaptersLength,
  totalQuestions,
}: TeacherDashboardHeaderProps) => {
  return (
    <main>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Manage your chapters and track student progress
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <Book className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold">Total Chapters</h3>
          </div>
          <p className="mt-2 text-3xl font-bold">{chaptersLength}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold">Total Questions</h3>
          </div>
          <p className="mt-2 text-3xl font-bold">{totalQuestions}</p>
        </div>
      </div>
    </main>
  );
};

export default TeacherDashboardHeader;
