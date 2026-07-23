// PassageActions.ts

export const addQuestionsToPassage = async (
  passageId: number,
  questionTypes: any,
  userName: string
) => {
  const apiBase = import.meta.env.VITE_API_URL;
  const payload = {
    question_types: questionTypes,
    created_by: userName,
    last_edited_by: userName,
  };
  const response = await fetch(
    `${apiBase}/api/passages/${passageId}/questions/bulk`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!response.ok) throw new Error("Failed to create questions");
  return response.json();
}; 