// QuestionChoicesActions.ts

export const updateQuestionChoices = async (
  questionId: number,
  choices: any[],
  deletedChoiceLabels: string[],
  userName: string
) => {
  const apiBase = import.meta.env.VITE_API_URL;
  const payload = {
    choices,
    deleted_choice_labels: deletedChoiceLabels,
    last_edited_by: userName,
  };
  const response = await fetch(
    `${apiBase}/api/pre-shsat/questions/${questionId}/choices`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!response.ok) throw new Error("Failed to update question choices");
  return response.json();
}; 