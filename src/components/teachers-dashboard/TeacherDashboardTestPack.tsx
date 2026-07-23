import { Book } from "lucide-react";
import { Link } from "react-router-dom";
const TeacherDashboardTestPack = () => {
  return (
    <main>
      <Link
        to="/test-pack"
        className="block p-4 w-full bg-white rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Book className="w-5 h-5 text-blue-600" />
          <div className="text-left">
            <h3 className="font-medium">Test Pack</h3>
            <p className="text-sm text-gray-500">
              Create and manage test packs
            </p>
          </div>
        </div>
      </Link>
    </main>
  );
};

export default TeacherDashboardTestPack;
