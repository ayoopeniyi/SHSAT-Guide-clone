// RaySelectorActions.ts

export const fetchRaySelectorDetails = async (questionId: number) => {
  const apiBase = import.meta.env.VITE_API_URL;
  const response = await fetch(
    `${apiBase}/api/ray-selector/get/${questionId}`
  );
  if (!response.ok) throw new Error("Failed to fetch Ray Selector details");
  return response.json();
}; 