// CMS Assets Component
// Asset management interface

import React, { useState, useCallback, useRef } from 'react';
import { AdminLayout } from '../AdminLayout';
import { useAssets, useAssetManagement } from '../../lib/cms/hooks';
import { useAppSelector } from '../../shell/store/hooks';
import type { Asset, AssetKind, ContentFilters, ContentSort } from '../../lib/cms/types';

interface CmsAssetsProps {
  siteId?: string;
}

export function CmsAssets({ siteId }: CmsAssetsProps) {
  const selectedSite = useAppSelector((state) => state.site.selectedSite);
  const currentSiteId = siteId || selectedSite?.id;
  
  // Early return before any hooks to avoid Rules of Hooks violation
  if (!currentSiteId) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Site Selected</h3>
            <p className="text-gray-500">Please select a site from the dropdown in the header to manage assets.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  const [filters, setFilters] = useState<ContentFilters>({});
  const [sort] = useState<ContentSort>({ field: 'created_at', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { assets, loading, error } = useAssets(currentSiteId, filters, sort, page, 20);
  const { uploadAsset, deleteAsset, loading: actionLoading, error: actionError } = useAssetManagement();

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (files) {
      setSelectedFiles(Array.from(files));
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0 || !currentSiteId) return;

    for (const file of selectedFiles) {
      await uploadAsset(currentSiteId, file);
    }
    
    setSelectedFiles([]);
    // Refresh assets list
    window.location.reload();
  }, [selectedFiles, uploadAsset, currentSiteId]);

  const handleDelete = useCallback(async (assetId: string) => {
    if (confirm('Are you sure you want to delete this asset?')) {
      await deleteAsset(assetId);
      // Refresh assets list
      window.location.reload();
    }
  }, [deleteAsset]);

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

  const getAssetUrl = (asset: Asset) => {
    // This would be the actual Supabase storage URL
    return `https://your-project.supabase.co/storage/v1/object/public/cms-assets/${asset.storage_key}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <AdminLayout
      pageHeader={
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Assets</h1>
          <p className="text-gray-400 mt-1">Manage your media assets and files</p>
        </div>
      }
    >
      <div className="p-6">
        {/* Upload Area */}
        <div className="mb-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
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

        {/* Filters and Controls */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <select
              value={filters.kind || ''}
              onChange={(e) => setFilters({ ...filters, kind: e.target.value as AssetKind || undefined })}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="file">Files</option>
            </select>

            <input
              type="text"
              placeholder="Search assets..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white"
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              List
            </button>
          </div>
        </div>

        {/* Error Display */}
        {(error || actionError) && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="text-red-800">
              {error || actionError}
            </div>
          </div>
        )}

        {/* Assets Display */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : assets?.data.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">📁</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assets found</h3>
            <p className="text-gray-500">Upload your first asset to get started.</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {assets?.data.map((asset) => (
              <div
                key={asset.id}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${
                  viewMode === 'list' ? 'flex items-center p-4' : ''
                }`}
              >
                {viewMode === 'grid' ? (
                  <>
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      {asset.kind === 'image' ? (
                        <img
                          src={getAssetUrl(asset)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400 text-4xl">
                          {asset.kind === 'video' ? '🎥' : '📄'}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 truncate">
                        {asset.storage_key.split('/').pop()}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {asset.kind} • {asset.width && asset.height ? `${asset.width}×${asset.height}` : 'Unknown size'}
                      </p>
                      <div className="mt-2 flex space-x-2">
                        <button
                          onClick={() => handleDelete(asset.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center mr-4">
                      {asset.kind === 'image' ? (
                        <img
                          src={getAssetUrl(asset)}
                          alt=""
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <div className="text-gray-400 text-2xl">
                          {asset.kind === 'video' ? '🎥' : '📄'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {asset.storage_key.split('/').pop()}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {asset.kind} • {asset.width && asset.height ? `${asset.width}×${asset.height}` : 'Unknown size'}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDelete(asset.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {assets && assets.total_pages > 1 && (
          <div className="mt-6 flex items-center justify-center space-x-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {page} of {assets.total_pages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === assets.total_pages}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
