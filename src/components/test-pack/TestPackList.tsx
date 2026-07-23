import { useState, useEffect } from "react";
import { testPackService } from "../../services/testPackService";
import { TestPack } from "../../types/testPack";
import TestPackCard from "./TestPackCard";
import { Pagination } from "../shared/Pagination";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { useSearchParams } from "react-router-dom";

export default function TestPackList() {
  const [testPacks, setTestPacks] = useState<TestPack[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  // URL state
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setSearchParams({
      q: searchQuery,
      page: currentPage.toString(),
    });
  }, [searchQuery, currentPage, setSearchParams]);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    setSearchQuery(q);
    setCurrentPage(page);
    // eslint-disable-next-line
  }, [searchParams]);

  useEffect(() => {
    loadTestPacks();
  }, [currentPage]);

  const loadTestPacks = async () => {
    try {
      setLoading(true);
      const data = await testPackService.getAll();
      setTestPacks(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
    } catch (error) {
      toast.error("Failed to load test packs");
      console.error("Error loading test packs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTestPacks = testPacks.filter((pack) =>
    pack.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const displayedTestPacks = filteredTestPacks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Check if all displayed test packs are RC type
  const allRCCards =
    displayedTestPacks.length > 0 &&
    displayedTestPacks.every((pack) => pack.question_type_name === "RC");

  if (loading) {
    return (
      <div className="max-w-[2000px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm p-6 animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mx-auto px-4 ${allRCCards ? "max-w-[1600px]" : "max-w-[2000px]"}`}
    >
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <Input
          type="text"
          placeholder="Search by test name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:max-w-md"
        />
      </div>
      {/* Move Pagination to the top */}
      {totalPages > 1 && (
        <div className="flex justify-center mb-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
      {filteredTestPacks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 break-words">
            {testPacks.length === 0
              ? "No test packs found. Create your first test pack to get started."
              : "No test packs match your search criteria."}
          </p>
        </div>
      ) : (
        <>
          <div
            className={`grid gap-6 ${
              allRCCards
                ? "grid-cols-1 lg:grid-cols-2 lg:items-start"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {displayedTestPacks.map((testPack) => (
              <div
                key={testPack.id}
                className={allRCCards ? "w-full break-words" : ""}
              >
                <TestPackCard testPack={testPack} onUpdate={loadTestPacks} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
