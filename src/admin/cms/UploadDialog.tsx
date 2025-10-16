// UploadDialog Component
// Handles file upload with drag-and-drop functionality

import React, { useState, useCallback, useRef } from 'react';
import { useAssetManagement } from '../../lib/cms/hooks';
import { useAppSelector } from '../../shell/store/hooks';

interface UploadDialogProps {
  onUploadComplete?: () => void;
}

export function UploadDialog({ onUploadComplete }: UploadDialogProps) {
  const selectedSite = useAppSelector((state) => state.site.selectedSite);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadAsset, loading: actionLoading, error: actionError } = useAssetManagement();

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (files) {
      setSelectedFiles(Array.from(files));
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0 || !selectedSite?.id) return;

    setUploadError(null);

    try {
      for (const file of selectedFiles) {
        console.log('Uploading file:', file.name);
        const result = await uploadAsset(selectedSite.id, file);
        
        if (!result) {
          console.error('Upload failed for file:', file.name, 'No result returned');
          throw new Error(`Failed to upload ${file.name}: No result returned`);
        }
        
        console.log('Upload successful for file:', file.name, result);
      }
      
      setSelectedFiles([]);
      setUploadError(null);
      onUploadComplete?.();
    } catch (error) {
      console.error('Upload process failed:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
      // Don't clear selected files on error so user can retry
    }
  }, [selectedFiles, uploadAsset, selectedSite?.id, onUploadComplete]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="mb-6">
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          isDragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-gray-400 text-4xl mb-4">📁</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Upload Assets
        </h3>
        <p className="text-gray-500 mb-4">
          Drag and drop files here, or click to select files
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Select Files
        </button>
      </div>

      {(actionError || uploadError) && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="text-red-800">{actionError || uploadError}</div>
          {uploadError && uploadError.includes('bucket') && (
            <div className="mt-2 text-sm text-red-700">
              <p><strong>To fix this:</strong></p>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>Run: <code className="bg-red-100 px-1 rounded">./scripts/create-storage-bucket.sh</code></li>
                <li>Or create the "cms-assets" bucket manually in your Supabase dashboard</li>
                <li>Make sure the bucket is public and allows the file types you're uploading</li>
              </ol>
            </div>
          )}
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Selected Files ({selectedFiles.length})</h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{file.name}</span>
                <span className="text-gray-500">{formatFileSize(file.size)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex space-x-2">
            <button
              onClick={handleUpload}
              disabled={actionLoading}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {actionLoading ? 'Uploading...' : 'Upload All'}
            </button>
            <button
              onClick={() => setSelectedFiles([])}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
