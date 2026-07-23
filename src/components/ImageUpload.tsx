import React, { useCallback, useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  /** Current image URL if any */
  currentImageUrl?: string;
  /** Called when an image is successfully uploaded */
  onImageUploaded: (imageUrl: string, choiceId?: number) => void;
  /** Called when image is deleted */
  onImageDeleted: () => void;
  /** The ID to use for upload (question_id or choice_id) */
  uploadId?: number;
  /** Type of upload: 'question' or 'choice' */
  uploadType: "question" | "choice";
  /** Maximum file size in MB */
  maxSizeMB?: number;
  /** Custom class name */
  className?: string;
  /** For new choices: question ID to create choice under */
  questionId?: number;
  /** For new choices: index of choice in the array */
  choiceIndex?: number;
  /** For new choices: choice label (A, B, C, etc.) */
  choiceLabel?: string;
  /** For new choices: current choice text */
  choiceText?: string;
  /** User information for tracking */
  userName?: string;
  /** Allow temporary upload (stores file locally until question is saved) */
  allowTemporary?: boolean;
  /** Is this during editing of existing question/choice? */
  isEditing?: boolean;
  /** Is this for a test pack question/choice? */
  isTestPack?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImageUrl,
  onImageUploaded,
  onImageDeleted,
  uploadId,
  uploadType,
  maxSizeMB = 5,
  className,
  questionId,
  choiceIndex,
  choiceLabel,
  choiceText,
  userName,
  allowTemporary,
  isEditing = false,
  isTestPack = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImageUrl || null,
  );
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync previewUrl with currentImageUrl prop changes
  React.useEffect(() => {
    /* console.log("🔍 [ImageUpload] currentImageUrl changed:", currentImageUrl); */
    setPreviewUrl(currentImageUrl || null);
  }, [currentImageUrl]);

  // Get API URL with fallback
  const getApiUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    const fallbackUrl =
      "https://eznnseebbi.execute-api.ap-southeast-2.amazonaws.com/dev";
    const apiUrl = envUrl || fallbackUrl;
    /* console.log(
      `🔗 Using API URL: ${apiUrl} (from ${envUrl ? "env" : "fallback"})`,
    ); */
    return apiUrl;
  };

  const validateFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return "Only PNG, JPEG, and SVG images are allowed";
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSizeMB}MB`;
    }

    return null;
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    /* console.log(
      `🚀 Starting image upload - Type: ${uploadType}, IsEditing: ${isEditing}, HasUploadId: ${!!uploadId}`,
    ); */

    try {
      // Validate file first
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        return;
      }

      const apiUrl = getApiUrl();

      // For temporary uploads (new questions not yet saved), just store locally
      if (allowTemporary && !uploadId && !isEditing) {
        /* console.log("📁 Storing image temporarily (question not saved yet)"); */
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          setPreviewUrl(dataUrl);
          onImageUploaded(dataUrl);
          toast.success("Image ready for upload when question is saved!");
        };
        reader.readAsDataURL(file);
        setIsUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      let endpoint: string;

      // SCENARIO 1: Editing existing choice - just add/update image
      if (isEditing && uploadType === "choice" && uploadId) {
        if (isTestPack) {
          endpoint = `${apiUrl}/api/images/test-pack/upload/choice/${uploadId}`;
        } else {
          endpoint = `${apiUrl}/api/images/upload/choice/${uploadId}`;
        }
        formData.append("last_edited_by", userName || "Unknown");
        formData.append("replace_existing", "true");
        /* console.log(
          `✏️ EDITING: Uploading image to existing choice ${uploadId}`,
        ); */
      }
      // SCENARIO 2: Creating new choice with image (during new question creation)
      else if (
        uploadType === "choice" &&
        !uploadId &&
        questionId &&
        choiceLabel
      ) {
        endpoint = `${apiUrl}/api/images/upload/new-choice/${questionId}`;
        // For test pack, choices are created with the question, so use the same as before
        formData.append("choice_index", (choiceIndex || 0).toString());
        formData.append("choice_label", choiceLabel);
        formData.append("choice_text", choiceText || "");
        formData.append("created_by", userName || "Unknown");
        formData.append("last_edited_by", userName || "Unknown");
        /* console.log(
          `➕ CREATING: New choice with image - Question ${questionId}, Label ${choiceLabel}`,
        ); */
      }
      // SCENARIO 3: Question image upload
      else if (uploadType === "question" && uploadId) {
        // Always use test-pack endpoint for test pack questions
        if (isTestPack) {
          endpoint = `${apiUrl}/api/images/test-pack/upload/question/${uploadId}`;
        } else {
          endpoint = `${apiUrl}/api/images/upload/question/${uploadId}`;
        }
        formData.append("last_edited_by", userName || "Unknown");
        /* console.log(`📄 Uploading image to question ${uploadId}`); */
      } else {
        throw new Error(
          `Invalid upload configuration - Type: ${uploadType}, UploadId: ${uploadId}, QuestionId: ${questionId}, IsEditing: ${isEditing}`,
        );
      }

      /* console.log(`📡 Making request to: ${endpoint}`); */

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      /* console.log(`📡 Response status: ${response.status}`); */

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ detail: "Unknown error" }));
        console.error("❌ Upload error response:", errorData);
        throw new Error(
          errorData.detail || `Upload failed (${response.status})`,
        );
      }

      const data = await response.json();
      /* console.log("✅ Upload success:", data); */

      if (data.success && data.image_url) {
        setPreviewUrl(data.image_url);
        onImageUploaded(data.image_url, data.choice_id);

        if (data.choice_id && uploadType === "choice" && !uploadId) {
          toast.success(
            `✅ Choice created with image! (ID: ${data.choice_id})`,
          );
          /* console.log(
            `🎉 New choice created: ID ${data.choice_id}, Label: ${choiceLabel}`,
          ); */
        } else {
          toast.success("✅ Image uploaded successfully!");
          /* console.log(`🎉 Image uploaded for ${uploadType}`); */
        }
      } else {
        console.error("❌ Invalid response structure:", data);
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("❌ Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload image",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const deleteImage = async () => {
    /* console.log("🔍 [ImageUpload] Delete button clicked:", {
      allowTemporary,
      uploadId,
      currentImageUrl,
      previewUrl,
      uploadType,
      isTestPack
    }); */
    
    // For temporary uploads or new choices without IDs, just clear the preview
    if (allowTemporary || !uploadId) {
      /* console.log("🔍 [ImageUpload] Clearing preview (temporary/no uploadId)"); */
      setPreviewUrl(null);
      onImageDeleted();
      toast.success("Image removed");
      return;
    }

    setIsUploading(true);
    /* console.log(`🗑️ Deleting image for ${uploadType} ${uploadId}`); */

    try {
      const apiUrl = getApiUrl();
      const endpoint = `${apiUrl}/api/images/${uploadType}/${uploadId}/image`;

      /* console.log(`🔍 [ImageUpload] Making DELETE request to: ${endpoint}`); */

      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      /* console.log(`🔍 [ImageUpload] Response status: ${response.status}`); */

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ detail: "Unknown error" }));
        
        console.error(`🔍 [ImageUpload] API error:`, errorData);
        
        // If the question is not found, treat it as a temporary upload
        if (errorData.detail && errorData.detail.includes("not found")) {
          /* console.log("🔍 [ImageUpload] Question not found, treating as temporary upload"); */
          setPreviewUrl(null);
          onImageDeleted();
          toast.success("Image removed");
          return;
        }
        
        throw new Error(errorData.detail || "Delete failed");
      }

      /* console.log("🔍 [ImageUpload] API delete successful, clearing preview"); */
      setPreviewUrl(null);
      onImageDeleted();
      toast.success("✅ Image deleted successfully!");
      /* console.log("🗑️ Image deleted successfully"); */
    } catch (error) {
      console.error("❌ Delete error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete image",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const error = validateFile(file);
      if (error) {
        toast.error(error);
        return;
      }

      uploadImage(file);
    },
    [uploadId, uploadType, isEditing, isTestPack],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".svg"],
    },
    multiple: false,
    disabled: isUploading,
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    uploadImage(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      {previewUrl ? (
        // Show preview when image exists
        <Card className="relative p-2 border-2 border-dashed border-gray-300">
          <div className="relative group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {uploadType === "question" ? "Question Image" : "Choice Image"}
                {uploadType === "choice" && choiceLabel && ` (${choiceLabel})`}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={deleteImage}
                disabled={isUploading}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              >
                {isUploading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <X className="h-3 w-3" />
                )}
              </Button>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <div className="cursor-pointer">
                  <img
                    src={previewUrl}
                    alt={`${uploadType === "question" ? "Question" : "Choice"} preview`}
                    className="max-w-full max-h-32 object-contain rounded border hover:opacity-80 transition-opacity"
                    onError={(e) => {
                      console.error("❌ Image failed to load:", previewUrl);
                      e.currentTarget.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIGZhaWxlZCB0byBsb2FkPC90ZXh0Pjwvc3ZnPg==";
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Click to enlarge
                  </p>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-auto p-4">
                <img
                  src={previewUrl}
                  alt={`${uploadType === "question" ? "Question" : "Choice"} full size`}
                  className="w-full h-auto object-contain"
                />
              </DialogContent>
            </Dialog>
          </div>
        </Card>
      ) : (
        // Show upload area when no image
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
            ${
              isDragActive || dragActive
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }
            ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <input
            {...getInputProps()}
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".png,.jpg,.jpeg,.svg"
          />

          <div className="flex flex-col items-center space-y-2">
            {isUploading ? (
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            ) : (
              <ImageIcon className="h-8 w-8 text-gray-400" />
            )}

            <div className="text-sm">
              {isUploading ? (
                <p className="text-blue-600">Uploading...</p>
              ) : isDragActive ? (
                <p className="text-blue-600">Drop the image here</p>
              ) : (
                <div>
                  <p className="text-gray-600">
                    <span className="font-medium">Click to upload</span> or drag
                    and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, SVG up to {maxSizeMB}MB
                    {uploadType === "choice" &&
                      choiceLabel &&
                      ` for choice ${choiceLabel}`}
                  </p>
                </div>
              )}
            </div>

            {!isUploading && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerFileSelect();
                }}
                className="mt-2"
              >
                <Upload className="h-4 w-4 mr-2" />
                Select File
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
