"use client";
import { Upload, FileText, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

type PreviewType = {
  url: string;
  type: 'image' | 'pdf';
};

export function FileUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<PreviewType | null>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (file.type.startsWith('image/')) {
        setPreview({
          url: e.target?.result as string,
          type: 'image'
        });
      } else if (file.type === 'application/pdf') {
        setPreview({
          url: URL.createObjectURL(file),
          type: 'pdf'
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setPreview(null);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center ${
        dragActive ? "border-primary bg-primary/5" : "border-gray-200"
      }`}
      onDragEnter={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragActive(false);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept=".jpg,.png,.pdf,.docx,.txt"
        onChange={handleChange}
      />

      {preview ? (
        <div className="w-full max-w-md mx-auto">
          {preview.type === 'image' ? (
            <div className="relative w-32 h-32 mx-auto">
              <Image
                src={preview.url}
                alt="Uploaded image"
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <div className="h-[500px] w-full">
              <iframe
                src={preview.url}
                className="w-full h-full"
                title="PDF preview"
              />
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={handleRemove}
          >
            <X className="h-4 w-4 mr-2" />
            Remove File
          </Button>
        </div>
      ) : (
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center gap-4 cursor-pointer"
        >
          <div className="p-4 rounded-full bg-primary/10">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-lg font-medium">Drop your file here or click to upload</p>
            <p className="text-sm text-muted-foreground">Supports: PNG, JPG, PDF, DOCX, TXT</p>
          </div>
        </label>
      )}
    </div>
  );
} 