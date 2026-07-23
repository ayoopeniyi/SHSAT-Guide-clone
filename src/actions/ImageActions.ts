// ImageActions.ts

export const uploadChoiceImage = async (
  choiceId: number,
  file: File,
  userName: string
) => {
  const apiBase = import.meta.env.VITE_API_URL;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("last_edited_by", userName);
  const response = await fetch(
    `${apiBase}/api/images/upload/choice/${choiceId}`,
    {
      method: "POST",
      body: formData,
    }
  );
  if (!response.ok) throw new Error("Image upload failed");
  return response.json();
}; 