import { useState, useEffect } from "react";
import { useCacheStore } from "../stores/cacheStore";
import { useAuthStore } from "../stores/authStore";
import TeacherDashboardNav from "../components/teachers-dashboard/TeacherDashboardNav";
import TeacherDashboardHeader from "../components/teachers-dashboard/TeacherDashboardHeader";
import TeacherDashboardChapter from "../components/teachers-dashboard/TeacherDashBoardChapter";
import TeacherDashboardQuestionBank from "../components/teachers-dashboard/TeacherDashboardQuestionBank";
import TeacherDashboardTestPack from "../components/teachers-dashboard/TeacherDashboardTestPack";
import { fetchPreShsatData } from "../actions/TeacherAction";
import { Link } from "react-router-dom";
import { Settings, Package, Eye, ExternalLink } from "lucide-react";

interface Chapter {
  chapter_number: number;
  title: string;
  subject: string;
  start_page: number;
  end_page: number;
  has_practice: boolean;
  created_at: string;
  updated_at: string;
}

export function TeacherPage() {
  const setCache = useCacheStore((s) => s.setCache);
  const getCache = useCacheStore((s) => s.getCache);
  //const clearCache = useCacheStore((s) => s.clearCache);
  const { user, isAdmin } = useAuthStore();
  const chaptersCacheKey = "teacherChapters";
  const questionsCacheKey = "teacherTotalQuestions";
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cachedChapters = getCache(chaptersCacheKey);
    const cachedTotalQuestions = getCache(questionsCacheKey);
    if (cachedChapters && cachedTotalQuestions !== undefined) {
      setChapters(cachedChapters);
      setTotalQuestions(cachedTotalQuestions);
      setLoading(false);
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { chapters, totalQuestions } = await fetchPreShsatData();

      setChapters(chapters);
      setTotalQuestions(totalQuestions);
      setCache(chaptersCacheKey, chapters);
      setCache(questionsCacheKey, totalQuestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };
  // const handleRefresh = () => {
  //   clearCache(chaptersCacheKey);
  //   clearCache(questionsCacheKey);
  //   fetchData();
  // }

  return (
    <div className="min-h-screen bg-gray-50 py-8"> 
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <TeacherDashboardNav />
        <TeacherDashboardHeader
          chaptersLength={chapters.length}
          totalQuestions={totalQuestions}
        />
        
        {/* Admin Controls */}
        {isAdmin && (
          <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Admin Controls</h3>
                <p className="text-sm text-gray-500">Manage products and system settings</p>
              </div>
              <div className="flex space-x-3">
                <Link
                  to="/admin/products"
                  className="inline-flex items-center px-4 py-2 bg-[#1d99c6] text-white rounded-lg hover:bg-[#176781] transition-colors"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Manage Products
                </Link>
                <Link
                  to="/manage-tests"
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Manage Visibility
                </Link>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Scraper Tools */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Scraper Tools</h3>
              <p className="text-sm text-gray-500">Access scraping utilities</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => window.open("https://bc-scraping.up.railway.app/sat_scrapper/index.html", "_blank")}
                className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                SAT Scrapper
              </button>
              <button
                onClick={() => window.open("https://bc-scraping.up.railway.app/nycshsat_scrapper/index.html", "_blank")}
                className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                NYCSHSAT Scrapper
              </button>
            </div>
          </div>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          style={{ marginTop: "20px" }}
        >
          <TeacherDashboardQuestionBank />
          <TeacherDashboardTestPack />
        </div>
        <TeacherDashboardChapter
          chapters={chapters}
          loading={loading}
          error={error || ""}
        />
      </div>
    </div>
  );
}
