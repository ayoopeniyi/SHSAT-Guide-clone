export const fetchPreShsatData = async () => {
  const apiBase = import.meta.env.VITE_API_URL;

  try {
    const [chaptersResponse, questionsResponse] = await Promise.all([
      fetch(`${apiBase}/api/pre-shsat/chapters`),
      fetch(`${apiBase}/api/pre-shsat/questions`),
    ]);

    if (!chaptersResponse.ok || !questionsResponse.ok) {
      throw new Error("Failed to fetch data");
    }

    const chaptersData = await chaptersResponse.json();
    const questionsData = await questionsResponse.json();

    const sortedChapters = [...chaptersData].sort(
      (a, b) => a.chapter_number - b.chapter_number,
    );

    return {
      chapters: sortedChapters,
      totalQuestions: questionsData.total || 0,
    };
  } catch (err) {
    throw err instanceof Error ? err : new Error("Failed to load data");
  }
};
