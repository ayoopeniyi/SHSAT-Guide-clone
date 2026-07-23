import React, { useState, useRef, useCallback } from "react";
import { Button } from "./button";
import { X, Upload, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onImageUpload: (file: File) => Promise<void>;
  onImageDelete?: () => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImageUrl,
  onImageUpload,
  onImageDelete,
  disabled = false,
  className = "",
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = ["image/jpeg", "image/jpg", "image/png"];
  const maxSize = 10 * 1024 * 1024; // 10MB

  const validateFile = (file: File): boolean => {
    if (!acceptedTypes.includes(file.type)) {
      toast.error(
        "Invalid file type. Only JPG, JPEG, and PNG files are allowed.",
      );
      return false;
    }
    if (file.size > maxSize) {
      toast.error("File too large. Maximum size is 10MB.");
      return false;
    }
    return true;
  };

  const handleFileUpload = async (file: File) => {
    if (!validateFile(file)) return;

    setIsUploading(true);
    try {
      await onImageUpload(file);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload image. Please try again.");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset input value to allow same file selection
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDelete = async () => {
    if (onImageDelete) {
      try {
        await onImageDelete();
        toast.success("Image deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete image. Please try again.");
        console.error("Delete error:", error);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className={`space-y-3 ${className}`}>
        {/* Current Image Display */}
        {currentImageUrl && (
          <div className="relative flex justify-center">
            <div className="relative inline-block">
              <img
                src={currentImageUrl}
                alt="Question image"
                className="max-w-full h-auto max-h-32 rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setIsViewModalOpen(true)}
              />
              <div className="absolute top-2 right-2 flex gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-6 w-6 p-0 bg-white/80 hover:bg-white"
                  onClick={() => setIsViewModalOpen(true)}
                >
                  <Eye className="h-3 w-3" />
                </Button>
                {onImageDelete && (
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="h-6 w-6 p-0"
                    onClick={handleDelete}
                    disabled={disabled}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Upload Area */}
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center transition-colors
            ${isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300"}
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-gray-400"}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={!disabled ? triggerFileInput : undefined}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />

          <div className="space-y-2">
            <Upload
              className={`mx-auto h-8 w-8 ${disabled ? "text-gray-400" : "text-gray-500"}`}
            />
            <div className="space-y-1">
              <p
                className={`text-sm font-medium ${disabled ? "text-gray-400" : "text-gray-700"}`}
              >
                {isUploading
                  ? "Uploading..."
                  : currentImageUrl
                    ? "Replace Image"
                    : "Add Image"}
              </p>
              <p
                className={`text-xs ${disabled ? "text-gray-400" : "text-gray-500"}`}
              >
                Drag & drop or click to select • JPG, JPEG, PNG • Max 10MB
              </p>
            </div>
          </div>
        </div>

        {/* Manual Upload Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={triggerFileInput}
          disabled={disabled || isUploading}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading
            ? "Uploading..."
            : currentImageUrl
              ? "Replace Image"
              : "Upload Image"}
        </Button>
      </div>

      {/* Image View Modal */}
      {isViewModalOpen && currentImageUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={currentImageUrl}
              alt="Question image"
              className="max-w-full max-h-full rounded-lg"
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="absolute top-2 right-2"
              onClick={() => setIsViewModalOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
