"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { Pencil, XCircle } from "lucide-react";
import { Label } from "../../components/ui/label";
import "../main.css";

interface ImageUploaderProps {
  value?: string | null;
  label?: string;
  maxSizeInMB?: number;
  allowedTypes?: string[];
  onChange?: (file: File | null) => void;
  onImageChange?: (imageUrl: string | null) => void;
  className?: string;
}

export function ImageUploader({
  value = null,
  label = "Upload Photo",
  maxSizeInMB = 1,
  allowedTypes = ["image/png", "image/jpeg", "image/jpg"],
  onChange,
  onImageChange,
  className = "",
}: ImageUploaderProps) {
  const [image, setImage] = useState<string | null>(value);
  const [error, setError] = useState<string | null>(null);

  // 🧠 Sync with value from parent
  useEffect(() => {
    setImage(value || null);
  }, [value]);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);

    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      setError(`File type not supported. Please upload ${allowedTypes.map((type) => type.split("/")[1]).join(", ")}`);
      return;
    }

    if (file.size > maxSizeInMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeInMB}MB limit`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = reader.result as string;
      setImage(imageUrl);
      onImageChange?.(imageUrl);
    };
    reader.readAsDataURL(file);
    onChange?.(file);
  };

  const handleRemoveImage = () => {
    setImage(null);
    onImageChange?.(null);
    onChange?.(null);
  };

  const allowedTypesText = allowedTypes.map((type) => type.split("/")[1]).join(", ");

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative imagebox flex-col items-center justify-center border-primary/40 rounded-lg p-4 text-center">
        <Label className="text-gray-700 font-bold pt-4">{label}</Label>

        {image ? (
          <div className="relative w-full h-full flex flex-col items-center">
            <img src={image} alt="Uploaded" className="w-full h-full object-cover rounded-lg border border-gray-300" />
            <button
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition z-10"
              type="button"
            >
              <XCircle className="w-5 h-5 text-red-500" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 top bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-300">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
              </svg>
            </div>
            <div className="mt-2 flex items-center space-x-1 cursor-pointer text-primary">
              <Pencil className="h-4 w-4" />
              <span className="text-sm font-medium">Upload Photo</span>
            </div>
          </div>
        )}
        <input
          type="file"
          accept={allowedTypes.join(", ")}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleImageUpload}
        />
        <p className="text-xs text-gray-500 top text-center">
          Allowed file types: {allowedTypesText}
          <br />
          Allowed file size: less than {maxSizeInMB}MB
        </p>
        {error && <p className="text-xs text-red-500 text-center">{error}</p>}
      </div>
    </div>
  );
}