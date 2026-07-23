// DndQuestionActions.ts

export const updateDndQuestion = async (
  questionId: number,
  dndPayload: any,
  userName: string
) => {
  const apiBase = import.meta.env.VITE_API_URL;
  const payload = { ...dndPayload, last_edited_by: userName };
  const response = await fetch(
    `${apiBase}/api/pre-shsat/dnd-questions/${questionId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!response.ok) throw new Error("Failed to update DND question");
  return response.json();
};

export const fetchDndDetails = async (questionId: number) => {
  const apiBase = import.meta.env.VITE_API_URL;
  
  // First, get the question to determine its subtype
  const questionResponse = await fetch(`${apiBase}/api/pre-shsat/questions/${questionId}`);
  if (!questionResponse.ok) throw new Error("Failed to fetch question details");
  const questionData = await questionResponse.json();
  
  // Determine the correct DND endpoint based on question_subtype
  let endpoint = `${apiBase}/api/pre-shsat/dnd-questions/${questionId}`; // default
  
  if (questionData.question_subtype) {
    switch (questionData.question_subtype) {
      case "table_dnd":
        endpoint = `${apiBase}/api/pre-shsat/dnd-questions/table_dnd/${questionId}`;
        break;
      case "two_buckets_single":
        // Use generic endpoint for two_buckets_single as there's no specific endpoint
        endpoint = `${apiBase}/api/pre-shsat/dnd-questions/${questionId}`;
        break;
      case "two_buckets_multi":
        endpoint = `${apiBase}/api/pre-shsat/dnd-questions/dnd_multi/${questionId}`;
        break;
      case "one_bucket_multi":
        endpoint = `${apiBase}/api/pre-shsat/dnd-questions/dnd_one_bucket_multi/${questionId}`;
        break;
      case "one_bucket_single":
        endpoint = `${apiBase}/api/pre-shsat/dnd-questions/dnd_one_bucket_single/${questionId}`;
        break;
      default:
        // Fallback to generic endpoint
        endpoint = `${apiBase}/api/pre-shsat/dnd-questions/${questionId}`;
        break;
    }
  }
  
  /* console.log("🔍 [fetchDndDetails] Using DND endpoint:", endpoint); */
  const response = await fetch(endpoint);
  if (!response.ok) throw new Error("Failed to fetch DND details");
  return response.json();
}; 