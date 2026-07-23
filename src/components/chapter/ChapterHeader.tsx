import { Chapter } from "../../lib/types";
import { BookOpen, CheckCircle } from "lucide-react";

interface ChapterHeaderProps {
  chapter: Chapter;
}

export function ChapterHeader({ chapter }: ChapterHeaderProps) {
  return (
    <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Chapter {chapter.chapter_number}: {chapter.title}
            </h1>
            {chapter.has_practice && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="w-4 h-4 mr-1" />
                Practice Available
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">{chapter.subject}</p>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <BookOpen className="w-5 h-5" />
          <span className="text-sm">
            Pages {chapter.start_page} - {chapter.end_page}
          </span>
        </div>
      </div>
    </div>
  );
}
