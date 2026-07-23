import React from "react";

interface QuestionBankStatesProps {
  loading?: boolean;
  error?: string | null;
}

export const QuestionBankStates: React.FC<QuestionBankStatesProps> = ({ loading, error }) => {
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        {/* Skeleton for filter sidebar and question list */}
        <div className="flex gap-2 w-full max-w-6xl">
          {/* Sidebar skeleton */}
          <div className="w-56 flex-shrink-0 mb-8 sticky top-24 hidden md:block">
            <div className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded mb-3 w-full" />
              ))}
              <div className="h-10 bg-gray-200 rounded mt-6" />
            </div>
          </div>
          {/* Question list skeleton */}
          <div className="flex-1 pb-16 pl-2">
            <div className="mb-4 h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow-sm p-3 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-5 bg-gray-200 rounded w-full mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/4 mb-2" />
                  <div className="h-8 bg-gray-200 rounded w-1/2 mt-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center text-red-600 py-8">{error}</div>
      </div>
    );
  }

  return null;
}; 