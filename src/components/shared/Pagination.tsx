import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showPageInput?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * A reusable pagination component with customizable styling and behavior.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Pagination
 *   currentPage={1}
 *   totalPages={10}
 *   onPageChange={(page) => setCurrentPage(page)}
 * />
 *
 * // With custom styling
 * <Pagination
 *   currentPage={currentPage}
 *   totalPages={totalPages}
 *   onPageChange={setCurrentPage}
 *   size="lg"
 *   className="mt-8"
 *   showPageInput={false}
 * />
 * ```
 *
 * @param currentPage - The current active page number
 * @param totalPages - The total number of pages available
 * @param onPageChange - Callback function called when page changes
 * @param className - Additional CSS classes to apply to the container
 * @param showPageInput - Whether to show the page number input field (default: true)
 * @param size - Size variant for the component (default: 'md')
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
  showPageInput = true,
  size = "md",
}: PaginationProps) {
  const [pageInput, setPageInput] = useState(currentPage.toString());

  // Update page input when currentPage changes externally
  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let page = parseInt(e.target.value, 10);
    if (isNaN(page) || page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    onPageChange(page);
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      let page = parseInt((e.target as HTMLInputElement).value, 10);
      if (isNaN(page) || page < 1) page = 1;
      if (page > totalPages) page = totalPages;
      onPageChange(page);
    }
  };

  const handlePreviousPage = () => {
    const newPage = Math.max(currentPage - 1, 1);
    onPageChange(newPage);
  };

  const handleNextPage = () => {
    const newPage = Math.min(currentPage + 1, totalPages);
    onPageChange(newPage);
  };

  // Don't render if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  const sizeClasses = {
    sm: {
      button: "p-1.5",
      input: "w-10 text-sm",
      text: "text-sm",
      icon: "w-4 h-4",
    },
    md: {
      button: "p-2",
      input: "w-12 text-base",
      text: "text-base",
      icon: "w-5 h-5",
    },
    lg: {
      button: "p-3",
      input: "w-16 text-lg",
      text: "text-lg",
      icon: "w-6 h-6",
    },
  };

  const classes = sizeClasses[size];

  return (
    <div
      className={`flex justify-center items-center gap-2 md:gap-4 ${className}`}
    >
      <button
        onClick={handlePreviousPage}
        disabled={currentPage === 1}
        className={`rounded-md border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${classes.button}`}
        aria-label="Previous page"
      >
        <ChevronLeft className={classes.icon} />
      </button>

      {showPageInput && (
        <>
          <input
            type="number"
            value={pageInput}
            min={1}
            max={totalPages}
            onChange={handlePageInputChange}
            onBlur={handlePageInputBlur}
            onKeyDown={handlePageInputKeyDown}
            className={`text-center font-semibold border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-1 ${classes.input}`}
            aria-label="Current page"
          />
          <span className={`text-gray-500 ${classes.text}`}>
            / {totalPages}
          </span>
        </>
      )}

      <button
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
        className={`rounded-md border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${classes.button}`}
        aria-label="Next page"
      >
        <ChevronRight className={classes.icon} />
      </button>
    </div>
  );
}
