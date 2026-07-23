interface Test {
  id: number;
  name: string;
  test_description?: string;
  created_at: string;
  updated_at: string;
}

interface TestPackInfoProps {
  selectedTest: Test | null;
  totalQuestions: number;
}

export function TestPackInfo({
  selectedTest,
  totalQuestions,
}: TestPackInfoProps) {
  if (!selectedTest) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          Select a test from the filters to view its questions.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-semibold mb-2">{selectedTest.name}</h2>
      <div className="text-sm text-gray-500">Questions: {totalQuestions}</div>
    </div>
  );
}
