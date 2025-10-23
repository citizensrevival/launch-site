// Staging Preview Component
// This component provides real-time preview of staged content

import { useState, useEffect } from 'react';
import { getStagedContentPreview } from '../../../lib/cms/stagingClient';

interface StagingPreviewProps {
  stagingId: string;
  onEntityClick?: (entityType: 'page' | 'block' | 'menu' | 'asset', entityId: string) => void;
}

export function StagingPreview({ stagingId, onEntityClick }: StagingPreviewProps) {
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stagingId) return;

    const fetchPreview = async () => {
      setLoading(true);
      setError(null);

      const response = await getStagedContentPreview(stagingId);
      
      if (response.error) {
        setError(response.error);
      } else {
        setPreview(response.data);
      }
      
      setLoading(false);
    };

    fetchPreview();
  }, [stagingId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading preview...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">Error loading preview: {error}</div>
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="text-center text-gray-500 py-8">
        No staged content found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{preview.pages?.length || 0}</div>
          <div className="text-sm text-blue-800">Pages</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{preview.blocks?.length || 0}</div>
          <div className="text-sm text-green-800">Blocks</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">{preview.menus?.length || 0}</div>
          <div className="text-sm text-purple-800">Menus</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-600">{preview.assets?.length || 0}</div>
          <div className="text-sm text-orange-800">Assets</div>
        </div>
      </div>

      {/* Detailed Preview */}
      <div className="space-y-6">
        {/* Pages Preview */}
        {preview.pages && preview.pages.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Staged Pages</h3>
            <div className="space-y-3">
              {preview.pages.map((page: any) => (
                <div
                  key={page.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                  onClick={() => onEntityClick?.('page', page.id)}
                >
                  <div>
                    <div className="font-medium text-gray-900">{page.title?.['en-US'] || 'Untitled'}</div>
                    <div className="text-sm text-gray-500">/{page.slug}</div>
                  </div>
                  <div className="text-sm text-gray-400">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Staged
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Blocks Preview */}
        {preview.blocks && preview.blocks.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Staged Blocks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {preview.blocks.map((block: any) => (
                <div
                  key={block.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                  onClick={() => onEntityClick?.('block', block.id)}
                >
                  <div>
                    <div className="font-medium text-gray-900">{block.type}</div>
                    {block.tag && (
                      <div className="text-sm text-gray-500">{block.tag}</div>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Staged
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menus Preview */}
        {preview.menus && preview.menus.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Staged Menus</h3>
            <div className="space-y-3">
              {preview.menus.map((menu: any) => (
                <div
                  key={menu.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                  onClick={() => onEntityClick?.('menu', menu.id)}
                >
                  <div>
                    <div className="font-medium text-gray-900">{menu.label}</div>
                    <div className="text-sm text-gray-500">{menu.handle}</div>
                  </div>
                  <div className="text-sm text-gray-400">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Staged
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assets Preview */}
        {preview.assets && preview.assets.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Staged Assets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {preview.assets.map((asset: any) => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                  onClick={() => onEntityClick?.('asset', asset.id)}
                >
                  <div>
                    <div className="font-medium text-gray-900">{asset.kind}</div>
                    <div className="text-sm text-gray-500 truncate">{asset.storage_key}</div>
                  </div>
                  <div className="text-sm text-gray-400">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Staged
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Staging comparison component
interface StagingComparisonProps {
  stagingId: string;
  publishedContent: any;
}

export function StagingComparison({ stagingId, publishedContent }: StagingComparisonProps) {
  const [stagedPreview, setStagedPreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stagingId) return;

    const fetchStagedPreview = async () => {
      setLoading(true);
      setError(null);

      const response = await getStagedContentPreview(stagingId);
      
      if (response.error) {
        setError(response.error);
      } else {
        setStagedPreview(response.data);
      }
      
      setLoading(false);
    };

    fetchStagedPreview();
  }, [stagingId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading comparison...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">Error loading comparison: {error}</div>
      </div>
    );
  }

  if (!stagedPreview || !publishedContent) {
    return (
      <div className="text-center text-gray-500 py-8">
        No content to compare
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Staged vs Published Content</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staged Content */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-blue-900 mb-4">Staged Content</h4>
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-blue-800">Pages: {stagedPreview.pages?.length || 0}</div>
              <div className="text-sm font-medium text-blue-800">Blocks: {stagedPreview.blocks?.length || 0}</div>
              <div className="text-sm font-medium text-blue-800">Menus: {stagedPreview.menus?.length || 0}</div>
              <div className="text-sm font-medium text-blue-800">Assets: {stagedPreview.assets?.length || 0}</div>
            </div>
          </div>
        </div>

        {/* Published Content */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-green-900 mb-4">Published Content</h4>
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-green-800">Pages: {publishedContent.pages?.length || 0}</div>
              <div className="text-sm font-medium text-green-800">Blocks: {publishedContent.blocks?.length || 0}</div>
              <div className="text-sm font-medium text-green-800">Menus: {publishedContent.menus?.length || 0}</div>
              <div className="text-sm font-medium text-green-800">Assets: {publishedContent.assets?.length || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Changes Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Changes Summary</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Pages changed:</span>
            <span className="text-sm font-medium text-gray-900">
              {Math.abs((stagedPreview.pages?.length || 0) - (publishedContent.pages?.length || 0))}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Blocks changed:</span>
            <span className="text-sm font-medium text-gray-900">
              {Math.abs((stagedPreview.blocks?.length || 0) - (publishedContent.blocks?.length || 0))}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Menus changed:</span>
            <span className="text-sm font-medium text-gray-900">
              {Math.abs((stagedPreview.menus?.length || 0) - (publishedContent.menus?.length || 0))}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Assets changed:</span>
            <span className="text-sm font-medium text-gray-900">
              {Math.abs((stagedPreview.assets?.length || 0) - (publishedContent.assets?.length || 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
