import { Link } from "react-router-dom";
import { BarChart } from "lucide-react";

type TeacherDashboardChapterProps = {
  chapters: any;
  loading: boolean;
  error: string;
};

const TeacherDashboardChapter = ({
  chapters,
  loading,
  error,
}: TeacherDashboardChapterProps) => {
  return (
    <main>
      {/* Chapters Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Chapters</h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Add New Chapter
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-8">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chapters.map((chapter: any) => (
              <Link
                key={chapter.chapter_number}
                to={`/chapters/${chapter.chapter_number}`}
                className="block p-4 border rounded-lg hover:border-blue-500 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">
                      Chapter {chapter.chapter_number}: {chapter.title}
                    </h3>
                    <p className="text-sm text-gray-500">{chapter.subject}</p>
                  </div>
                  <BarChart className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default TeacherDashboardChapter;
