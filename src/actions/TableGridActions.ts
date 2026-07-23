// TableGridActions.ts

export const fetchTableGridDetails = async (questionId: number) => {
  const apiBase = import.meta.env.VITE_API_URL;
  const response = await fetch(
    `${apiBase}/api/table-grid-questions/get-details/${questionId}`
  );
  if (!response.ok) throw new Error("Failed to fetch Table Grid details");
  return response.json();
}; 