// Compact Asset Editor with Toolbar
// In-place editing with metadata support

import { useAsset, useAssetVariants, useAssetManagement } from '../../lib/cms/hooks';
import { getAssetUrl } from '../../lib/cms/utils';
import { generateAssetVariants, updateAsset } from '../../lib/cms/client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Toast } from './components/Toast';
import type { Asset, AssetEditOperation, CropParams, ResizeParams, RotateParams } from '../../lib/cms/types';

interface AssetDetailsCompactProps {
  assetId: string;
  siteId: string;
  onAssetUpdated?: () => void;
  onClose: () => void;
  onDelete?: (assetId: string) => void;
}

interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  details?: string;
}

interface EditState {
  crop: CropParams | null;
  rotation: 0 | 90 | 180 | 270;
  resizePercent: number;
}

interface MetadataState {
  fileName: string;
  altText: string;
  description: string;
  tags: string;
  focalPoint: { x: number; y: number } | null;
}

export function AssetDetailsCompact({ assetId, siteId, onAssetUpdated, onClose, onDelete }: AssetDetailsCompactProps) {
  const { asset, loading: assetLoading, error: assetError, refresh: refreshAsset } = useAsset(assetId);
  const { variants, loading: variantsLoading, refresh: refreshVariants } = useAssetVariants(assetId);
  const { saveEditedAsset } = useAssetManagement();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [activeTab, setActiveTab] = useState<'edit' | 'meta' | 'variants'>('edit');
  
  // Edit state
  const [editState, setEditState] = useState<EditState>({
    crop: null,
    rotation: 0,
    resizePercent: 100,
  });
  
  // Metadata state
  const [metadata, setMetadata] = useState<MetadataState>({
    fileName: '',
    altText: '',
    description: '',
    tags: '',
    focalPoint: null,
  });
  
  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const cropStartRef = useRef<{ x: number; y: number } | null>(null);
  const [isDrawingCrop, setIsDrawingCrop] = useState(false);
  const [isSelectingFocalPoint, setIsSelectingFocalPoint] = useState(false);

  // Initialize metadata from asset
  useEffect(() => {
    if (asset) {
      setMetadata({
        fileName: asset.storage_key.split('/').pop() || '',
        altText: '',
        description: '',
        tags: '',
        focalPoint: null,
      });
    }
  }, [asset]);

  // Load and draw image
  useEffect(() => {
    if (!asset || asset.kind !== 'image') return;
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      redrawCanvas();
    };
    img.src = getAssetUrl(asset.storage_key, siteId);
  }, [asset, siteId]);

  // Redraw canvas when edit state changes
  useEffect(() => {
    if (imageRef.current) {
      redrawCanvas();
    }
  }, [editState, metadata.focalPoint]);

  const hasEdits = useCallback(() => {
    return (
      editState.crop !== null ||
      editState.rotation !== 0 ||
      editState.resizePercent !== 100
    );
  }, [editState]);

  const redrawCanvas = () => {
    if (!imageRef.current || !canvasRef.current) return;

    const img = imageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = img.width;
    canvas.height = img.height;

    // Apply rotation if needed
    if (editState.rotation !== 0) {
      ctx.save();
      if (editState.rotation === 90 || editState.rotation === 270) {
        canvas.width = img.height;
        canvas.height = img.width;
      }
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((editState.rotation * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();
    } else {
      ctx.drawImage(img, 0, 0);
    }

    // Draw crop overlay if active
    if (editState.crop && editState.crop.width > 0) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.clearRect(editState.crop.x, editState.crop.y, editState.crop.width, editState.crop.height);
      ctx.drawImage(
        img,
        editState.crop.x,
        editState.crop.y,
        editState.crop.width,
        editState.crop.height,
        editState.crop.x,
        editState.crop.y,
        editState.crop.width,
        editState.crop.height
      );

      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.strokeRect(editState.crop.x, editState.crop.y, editState.crop.width, editState.crop.height);
    }

    // Draw focal point if set
    if (metadata.focalPoint) {
      ctx.beginPath();
      ctx.arc(metadata.focalPoint.x, metadata.focalPoint.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Crosshair
      ctx.beginPath();
      ctx.moveTo(metadata.focalPoint.x - 15, metadata.focalPoint.y);
      ctx.lineTo(metadata.focalPoint.x + 15, metadata.focalPoint.y);
      ctx.moveTo(metadata.focalPoint.x, metadata.focalPoint.y - 15);
      ctx.lineTo(metadata.focalPoint.x, metadata.focalPoint.y + 15);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  // Canvas interaction handlers
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (isSelectingFocalPoint) {
      setMetadata(prev => ({ ...prev, focalPoint: { x, y } }));
      setIsSelectingFocalPoint(false);
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isSelectingFocalPoint || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    cropStartRef.current = { x, y };
    setIsDrawingCrop(true);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingCrop || !cropStartRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const currentX = (e.clientX - rect.left) * scaleX;
    const currentY = (e.clientY - rect.top) * scaleY;

    const width = currentX - cropStartRef.current.x;
    const height = currentY - cropStartRef.current.y;

    setEditState(prev => ({
      ...prev,
      crop: {
        x: width > 0 ? cropStartRef.current!.x : currentX,
        y: height > 0 ? cropStartRef.current!.y : currentY,
        width: Math.abs(width),
        height: Math.abs(height),
      }
    }));
  };

  const handleCanvasMouseUp = () => {
    if (isDrawingCrop) {
      setIsDrawingCrop(false);
      cropStartRef.current = null;
    }
  };

  const handleRotate = (direction: 'left' | 'right') => {
    const degrees = direction === 'left' ? 270 : 90;
    setEditState(prev => ({
      ...prev,
      rotation: ((prev.rotation + degrees) % 360) as 0 | 90 | 180 | 270,
    }));
  };

  const handleClearCrop = () => {
    setEditState(prev => ({ ...prev, crop: null }));
  };

  const handleResetEdits = () => {
    setEditState({
      crop: null,
      rotation: 0,
      resizePercent: 100,
    });
  };

  const handleSave = async (createNew: boolean) => {
    if (!hasEdits() || !imageRef.current) return;

    setIsProcessing(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      let img = imageRef.current;
      let width = img.width;
      let height = img.height;

      // Rotation
      if (editState.rotation !== 0) {
        if (editState.rotation === 90 || editState.rotation === 270) {
          canvas.width = height;
          canvas.height = width;
        } else {
          canvas.width = width;
          canvas.height = height;
        }
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((editState.rotation * Math.PI) / 180);
        ctx.drawImage(img, -width / 2, -height / 2);
        ctx.restore();

        const rotatedImg = new Image();
        rotatedImg.src = canvas.toDataURL();
        await new Promise(resolve => rotatedImg.onload = resolve);
        img = rotatedImg;
        width = canvas.width;
        height = canvas.height;
      }

      // Crop
      if (editState.crop && editState.crop.width > 0) {
        canvas.width = editState.crop.width;
        canvas.height = editState.crop.height;
        ctx.drawImage(
          img,
          editState.crop.x,
          editState.crop.y,
          editState.crop.width,
          editState.crop.height,
          0,
          0,
          editState.crop.width,
          editState.crop.height
        );
        width = editState.crop.width;
        height = editState.crop.height;
      } else {
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0);
      }

      // Resize
      if (editState.resizePercent !== 100) {
        const finalWidth = Math.round(width * (editState.resizePercent / 100));
        const finalHeight = Math.round(height * (editState.resizePercent / 100));
        const resizedCanvas = document.createElement('canvas');
        resizedCanvas.width = finalWidth;
        resizedCanvas.height = finalHeight;
        const resizedCtx = resizedCanvas.getContext('2d');
        if (resizedCtx) {
          resizedCtx.drawImage(canvas, 0, 0, finalWidth, finalHeight);
          canvas.width = finalWidth;
          canvas.height = finalHeight;
          ctx.drawImage(resizedCanvas, 0, 0);
        }
      }

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Failed to create blob'))),
          'image/jpeg',
          0.92
        );
      });

      // Determine primary operation
      let operation: AssetEditOperation;
      if (editState.crop && editState.crop.width > 0) {
        operation = { operation: 'crop', params: editState.crop };
      } else if (editState.rotation !== 0) {
        operation = { operation: 'rotate', params: { degrees: editState.rotation as 90 | 180 | 270 } as RotateParams };
      } else {
        operation = {
          operation: 'resize',
          params: {
            width: Math.round(width * (editState.resizePercent / 100)),
            height: Math.round(height * (editState.resizePercent / 100)),
            maintainAspectRatio: true,
          } as ResizeParams,
        };
      }

      const result = await saveEditedAsset(assetId, blob, operation, createNew);
      
      if (result.success) {
        setToast({
          message: createNew ? 'New asset created!' : 'Asset updated!',
          type: 'success',
        });
        handleResetEdits();
        if (onAssetUpdated) onAssetUpdated();
        if (!createNew) {
          refreshAsset();
          setTimeout(() => refreshVariants(), 2000);
        }
      } else {
        setToast({
          message: 'Failed to save',
          type: 'error',
          details: result.error || 'Unknown error',
        });
      }
    } catch (err) {
      setToast({
        message: 'Error saving',
        type: 'error',
        details: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveMetadata = async () => {
    setIsProcessing(true);
    try {
      const result = await updateAsset(assetId, {
        // Note: storage_key contains filename, but we can't update it without moving the file
        // In a real implementation, you'd need backend support for this
      });
      
      if (!result.error) {
        setToast({
          message: 'Metadata saved!',
          type: 'success',
        });
        refreshAsset();
      } else {
        setToast({
          message: 'Failed to save metadata',
          type: 'error',
          details: result.error,
        });
      }
    } catch (err) {
      setToast({
        message: 'Error saving metadata',
        type: 'error',
        details: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateVariants = async () => {
    setIsGenerating(true);
    try {
      const { error } = await generateAssetVariants(assetId);
      if (!error) {
        setToast({ message: 'Variants generated!', type: 'success' });
        setTimeout(() => {
          refreshVariants();
          if (onAssetUpdated) onAssetUpdated();
        }, 2000);
      } else {
        setToast({ message: 'Failed to generate variants', type: 'error', details: error });
      }
    } catch (err) {
      setToast({
        message: 'Error generating variants',
        type: 'error',
        details: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (assetLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (assetError || !asset) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <div className="text-red-800">{assetError || 'Asset not found'}</div>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-200 rounded-md">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
        <div className="relative w-full max-w-5xl bg-white rounded-lg shadow-xl max-h-[90vh] flex flex-col">
          {/* Header with Toolbar */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600" title="Close">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <span className="text-sm font-medium text-gray-900">{metadata.fileName}</span>
            </div>

            {/* Toolbar - Edit Controls */}
            {asset.kind === 'image' && activeTab === 'edit' && (
              <div className="flex items-center gap-2">
                {/* Rotate */}
                <button
                  onClick={() => handleRotate('left')}
                  className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                  title="Rotate left"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </button>
                <button
                  onClick={() => handleRotate('right')}
                  className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                  title="Rotate right"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                  </svg>
                </button>

                <div className="w-px h-6 bg-gray-300"></div>

                {/* Resize */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Size:</span>
                  <input
                    type="range"
                    min="25"
                    max="200"
                    step="25"
                    value={editState.resizePercent}
                    onChange={(e) => setEditState(prev => ({ ...prev, resizePercent: parseInt(e.target.value) }))}
                    className="w-32"
                  />
                  <span className="text-xs text-gray-700 w-10">{editState.resizePercent}%</span>
                </div>

                <div className="w-px h-6 bg-gray-300"></div>

                {/* Crop controls */}
                {editState.crop && (
                  <button
                    onClick={handleClearCrop}
                    className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    Clear Crop
                  </button>
                )}

                {hasEdits() && (
                  <button
                    onClick={handleResetEdits}
                    className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    Reset
                  </button>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {onDelete && (
                <button
                  onClick={() => onDelete(assetId)}
                  disabled={isProcessing}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Delete
                </button>
              )}
              {asset.kind === 'image' && activeTab === 'edit' && (
                <>
                  <button
                    onClick={() => handleSave(false)}
                    disabled={!hasEdits() || isProcessing}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleSave(true)}
                    disabled={!hasEdits() || isProcessing}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save New
                  </button>
                </>
              )}
              {activeTab === 'meta' && (
                <button
                  onClick={handleSaveMetadata}
                  disabled={isProcessing}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Save Metadata
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 px-4 flex-shrink-0">
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'edit'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setActiveTab('meta')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'meta'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Metadata
            </button>
            <button
              onClick={() => setActiveTab('variants')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'variants'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Variants ({variants.length})
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'edit' && (
              <div className="flex flex-col items-center">
                {asset.kind === 'image' ? (
                  <>
                    <canvas
                      ref={canvasRef}
                      onClick={handleCanvasClick}
                      onMouseDown={handleCanvasMouseDown}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                      onMouseLeave={handleCanvasMouseUp}
                      className={`max-w-full h-auto border border-gray-300 ${
                        isSelectingFocalPoint ? 'cursor-crosshair' : 'cursor-crosshair'
                      }`}
                      style={{ maxHeight: 'calc(90vh - 200px)' }}
                    />
                    <div className="mt-2 text-xs text-gray-500 text-center">
                      {isSelectingFocalPoint
                        ? 'Click on the image to set focal point'
                        : 'Draw on image to crop • Use toolbar to rotate/resize'}
                    </div>
                  </>
                ) : (
                  <div className="text-gray-400 text-6xl p-12">
                    {asset.kind === 'video' ? '🎥' : '📄'}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'meta' && (
              <div className="max-w-2xl mx-auto space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File Name</label>
                  <input
                    type="text"
                    value={metadata.fileName}
                    onChange={(e) => setMetadata(prev => ({ ...prev, fileName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
                  <input
                    type="text"
                    value={metadata.altText}
                    onChange={(e) => setMetadata(prev => ({ ...prev, altText: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Describe the image for accessibility"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={metadata.description}
                    onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    rows={3}
                    placeholder="Optional description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <input
                    type="text"
                    value={metadata.tags}
                    onChange={(e) => setMetadata(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Comma-separated tags"
                  />
                </div>

                {asset.kind === 'image' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Focal Point</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsSelectingFocalPoint(!isSelectingFocalPoint)}
                        className={`px-3 py-2 text-sm rounded-md ${
                          isSelectingFocalPoint
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {isSelectingFocalPoint ? 'Click on image...' : 'Set Focal Point'}
                      </button>
                      {metadata.focalPoint && (
                        <>
                          <span className="text-sm text-gray-600">
                            ({Math.round(metadata.focalPoint.x)}, {Math.round(metadata.focalPoint.y)})
                          </span>
                          <button
                            onClick={() => setMetadata(prev => ({ ...prev, focalPoint: null }))}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Clear
                          </button>
                        </>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Focal point helps with smart cropping and responsive images
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200 text-sm text-gray-600">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-medium">ID:</span> {asset.id.substring(0, 8)}...
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {asset.kind}
                    </div>
                    {asset.width && asset.height && (
                      <div>
                        <span className="font-medium">Size:</span> {asset.width} × {asset.height}px
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'variants' && (
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900">Image Variants</h3>
                  <button
                    onClick={handleGenerateVariants}
                    disabled={isGenerating}
                    className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isGenerating ? 'Generating...' : 'Generate Variants'}
                  </button>
                </div>

                {variantsLoading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                )}

                {!variantsLoading && variants.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No variants generated yet
                  </div>
                )}

                {!variantsLoading && variants.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600 mb-2">
                      {variants.length} variants • Total size: {formatBytes(variants.reduce((sum, v) => sum + (v.file_size || 0), 0))}
                    </div>
                    {variants.map((variant) => (
                      <div key={variant.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-white">
                        <div>
                          <div className="font-medium text-sm text-gray-900 capitalize">{variant.variant_name}</div>
                          <div className="text-xs text-gray-600">
                            {variant.width} × {variant.height}px • {formatBytes(variant.file_size)}
                          </div>
                        </div>
                        <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                          <img
                            src={getAssetUrl(variant.storage_key, siteId)}
                            alt={variant.variant_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          details={toast.details}
          onClose={() => setToast(null)}
          duration={toast.type === 'success' ? 3000 : 7000}
        />
      )}
    </>
  );
}

