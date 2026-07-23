import { Filter } from "lucide-react";
import { TrackedButton } from "../TrackedButton";

type QuestionBankFilterProps = {
  searchInput: string;
  handleSearchInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearchInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  setShowFilters: (f: boolean) => void;
  showFilters: boolean;
};

const QuestionBankFilter = ({
  searchInput,
  handleSearchInputChange,
  handleSearchInputKeyDown,
  setShowFilters,
  showFilters,
}: QuestionBankFilterProps) => {
  return (
    <main>
      {/* Search & Filters */}
      <div className="flex gap-2 items-center mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search questions, chapters, topics..."
            value={searchInput}
            onChange={handleSearchInputChange}
            onKeyDown={handleSearchInputKeyDown}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <TrackedButton
          trackingName="question_bank_filters_button"
          trackingContext={{
            page: 'question_bank',
            action: 'toggle_filters',
            current_state: showFilters ? 'visible' : 'hidden'
          }}
          variant="outline"
          className="flex items-center gap-2 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4" /> Filters
        </TrackedButton>
      </div>
    </main>
  );
};

export default QuestionBankFilter;
