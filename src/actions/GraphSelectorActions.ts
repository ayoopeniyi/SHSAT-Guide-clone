// GraphSelectorActions.ts

export const fetchGraphSelectorDetails = async (questionId: number) => {
  const apiBase = import.meta.env.VITE_API_URL;
  const response = await fetch(
    `${apiBase}/api/graph-selector/get-details/${questionId}`
  );
  if (!response.ok) throw new Error("Failed to fetch Graph Selector details");
  return response.json();
}; 