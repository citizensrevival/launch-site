// CMS Assets Component
// Asset management interface

import { useState, useRef } from 'react';
import { AdminLayout } from '../AdminLayout';
import { UploadDialog } from './UploadDialog';
import { AssetSearch } from './AssetSearch';
import { AssetGallery } from './AssetGallery';

export function CmsAssets() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const assetGalleryRef = useRef<{ refresh: () => void }>(null);

  const handleUploadComplete = () => {
    // Close the modal and refresh the asset gallery
    setIsUploadModalOpen(false);
    assetGalleryRef.current?.refresh();
  };

  return (
    <AdminLayout
      pageHeader={
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Assets</h1>
            <p className="text-gray-400 mt-1">Manage your media assets and files</p>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Upload
          </button>
        </div>
      }
    >
      <div className="p-6">
        <AssetSearch />
        <AssetGallery ref={assetGalleryRef} />
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Upload Assets</h2>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <UploadDialog onUploadComplete={handleUploadComplete} />
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
