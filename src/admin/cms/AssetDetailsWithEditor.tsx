// Integrated Asset Details with Editor
// Compact toolbar-based editing with metadata

import { useCallback, useEffect, useRef, useState } from 'react';
import { generateAssetVariants } from '../../lib/cms/client';
import { useAsset, useAssetManagement, useAssetVariants } from '../../lib/cms/hooks';
import type { AssetEditOperation, CropParams, ResizeParams, RotateParams } from '../../lib/cms/types';
import { getAssetUrl } from '../../lib/cms/utils';
import { Toast } from './components/Toast';

interface AssetDetailsWithEditorProps {
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
  customWidth: number | null;
  customHeight: number | null;
  maintainAspectRatio: boolean;
}

export function AssetDetailsWithEditor({ assetId, siteId, onAssetUpdated, onClose, onDelete }: AssetDetailsWithEditorProps) {
  const { asset, loading: assetLoading, error: assetError, refresh: refreshAsset } = useAsset(assetId);
  const { variants, loading: variantsLoading, refresh: refreshVariants } = useAssetVariants(assetId);
  const { saveEditedAsset } = useAssetManagement();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Edit state
  const [editState, setEditState] = useState<EditState>({
    crop: null,
    rotation: 0,
    resizePercent: 100,
    customWidth: null,
    customHeight: null,
    maintainAspectRatio: true,
  });
  
  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const cropStartRef = useRef<{ x: number; y: number } | null>(null);
  const [isDrawingCrop, setIsDrawingCrop] = useState(false);
  const [showCropButton, setShowCropButton] = useState(false);

  // Load original image
  useEffect(() => {
    if (!asset || asset.kind !== 'image') return;
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
        }
      }
      setEditState(prev => ({
        ...prev,
        customWidth: img.width,
        customHeight: img.height,
      }));
    };
    img.src = getAssetUrl(asset.storage_key, siteId);
  }, [asset, siteId]);

  // Auto-generate preview when edits change
  useEffect(() => {
    if (hasEdits() && imageRef.current) {
      generatePreview();
    } else {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
  }, [editState]);

  const hasEdits = useCallback(() => {
    return (
      editState.crop !== null ||
      editState.rotation !== 0 ||
      editState.resizePercent !== 100 ||
      (editState.customWidth !== null && editState.customWidth !== asset?.width) ||
      (editState.customHeight !== null && editState.customHeight !== asset?.height)
    );
  }, [editState, asset]);

  const generatePreview = async () => {
    if (!imageRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let img = imageRef.current;
    let width = img.width;
    let height = img.height;

    // Apply rotation
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

      // Create new image from rotated canvas
      const rotatedImg = new Image();
      rotatedImg.src = canvas.toDataURL();
      await new Promise(resolve => rotatedImg.onload = resolve);
      img = rotatedImg;
      width = canvas.width;
      height = canvas.height;
    }

    // Apply crop
    if (editState.crop && editState.crop.width > 0 && editState.crop.height > 0) {
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

    // Apply resize
    let finalWidth = width;
    let finalHeight = height;
    
    if (editState.resizePercent !== 100) {
      finalWidth = Math.round(width * (editState.resizePercent / 100));
      finalHeight = Math.round(height * (editState.resizePercent / 100));
    } else if (editState.customWidth !== null && editState.customHeight !== null) {
      finalWidth = editState.customWidth;
      finalHeight = editState.customHeight;
    }

    if (finalWidth !== width || finalHeight !== height) {
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

    canvas.toBlob((blob) => {
      if (blob) {
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(URL.createObjectURL(blob));
      }
    }, 'image/jpeg', 0.92);
  };

  // Crop drawing handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    cropStartRef.current = { x, y };
    setIsDrawingCrop(true);
    setShowCropButton(false);
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

    const cropArea = {
      x: width > 0 ? cropStartRef.current.x : currentX,
      y: height > 0 ? cropStartRef.current.y : currentY,
      width: Math.abs(width),
      height: Math.abs(height),
    };

    // Draw crop preview
    drawCropPreview(cropArea);
  };

  const handleCanvasMouseUp = () => {
    if (isDrawingCrop && cropStartRef.current) {
      setIsDrawingCrop(false);
      setShowCropButton(true);
    }
  };

  const drawCropPreview = (crop: CropParams) => {
    if (!imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Redraw original image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0);

    // Draw dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear crop area to show image
    ctx.clearRect(crop.x, crop.y, crop.width, crop.height);
    ctx.drawImage(
      imageRef.current,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      crop.x,
      crop.y,
      crop.width,
      crop.height
    );

    // Draw crop border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(crop.x, crop.y, crop.width, crop.height);

    // Store the temporary crop
    setEditState(prev => ({ ...prev, crop }));
  };

  const handleApplyCrop = () => {
    setShowCropButton(false);
    // Crop is already in editState from drawing
  };

  const handleClearCrop = () => {
    setEditState(prev => ({ ...prev, crop: null }));
    setShowCropButton(false);
    cropStartRef.current = null;
    
    // Redraw original
    if (imageRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imageRef.current, 0, 0);
      }
    }
  };

  const handleRotate = (direction: 'left' | 'right') => {
    const degrees = direction === 'left' ? 270 : 90;
    setEditState(prev => ({
      ...prev,
      rotation: ((prev.rotation + degrees) % 360) as 0 | 90 | 180 | 270,
    }));
  };

  const handleResizePercentChange = (percent: number) => {
    if (!asset) return;
    setEditState(prev => ({
      ...prev,
      resizePercent: percent,
      customWidth: Math.round((asset.width || 0) * (percent / 100)),
      customHeight: Math.round((asset.height || 0) * (percent / 100)),
    }));
  };

  const handleCustomWidthChange = (width: number) => {
    if (!asset) return;
    setEditState(prev => {
      const newState = { ...prev, customWidth: width, resizePercent: 100 };
      if (prev.maintainAspectRatio && asset.width && asset.height) {
        const aspectRatio = asset.width / asset.height;
        newState.customHeight = Math.round(width / aspectRatio);
      }
      return newState;
    });
  };

  const handleCustomHeightChange = (height: number) => {
    if (!asset) return;
    setEditState(prev => {
      const newState = { ...prev, customHeight: height, resizePercent: 100 };
      if (prev.maintainAspectRatio && asset.width && asset.height) {
        const aspectRatio = asset.width / asset.height;
        newState.customWidth = Math.round(height * aspectRatio);
      }
      return newState;
    });
  };

  const handleSave = async (createNew: boolean) => {
    if (!hasEdits() || !imageRef.current) return;

    setIsProcessing(true);
    try {
      // Generate final edited image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Apply all transformations (same as preview but with final quality)
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
      if (editState.crop && editState.crop.width > 0 && editState.crop.height > 0) {
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
      let finalWidth = width;
      let finalHeight = height;
      
      if (editState.resizePercent !== 100) {
        finalWidth = Math.round(width * (editState.resizePercent / 100));
        finalHeight = Math.round(height * (editState.resizePercent / 100));
      } else if (editState.customWidth !== null && editState.customHeight !== null) {
        finalWidth = editState.customWidth;
        finalHeight = editState.customHeight;
      }

      if (finalWidth !== width || finalHeight !== height) {
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
            width: finalWidth,
            height: finalHeight,
            maintainAspectRatio: editState.maintainAspectRatio,
          } as ResizeParams,
        };
      }

      const result = await saveEditedAsset(assetId, blob, operation, createNew);
      
      if (result.success && result.data) {
        setToast({
          message: createNew ? 'New asset created successfully!' : 'Asset updated successfully!',
          type: 'success',
          details: createNew
            ? 'A new asset has been created with variants.'
            : 'The asset has been updated and variants regenerated.',
        });

        // Reset edit state
        setEditState({
          crop: null,
          rotation: 0,
          resizePercent: 100,
          customWidth: asset?.width || null,
          customHeight: asset?.height || null,
          maintainAspectRatio: true,
        });

        // Refresh
        if (onAssetUpdated) {
          onAssetUpdated();
        }
        if (!createNew) {
          refreshAsset();
          setTimeout(() => refreshVariants(), 2000);
        }
      } else {
        setToast({
          message: 'Failed to save edited asset',
          type: 'error',
          details: result.error || 'Unknown error occurred',
        });
      }
    } catch (err) {
      setToast({
        message: 'Error saving edited asset',
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
      if (error) {
        setToast({
          message: 'Failed to generate variants',
          type: 'error',
          details: error,
        });
      } else {
        setToast({
          message: 'Variants generation started',
          type: 'success',
        });
        setTimeout(() => {
          refreshVariants();
          if (onAssetUpdated) onAssetUpdated();
        }, 2000);
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
    if (bytes === 0) return '0 Bytes';
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
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="relative w-full max-w-7xl bg-white rounded-lg shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {asset.storage_key.split('/').pop()}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Image Area - Takes up 2 columns */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Canvas with interactive editing */}
                  <div className="bg-gray-100 rounded-lg p-4 relative">
                    <div className="relative inline-block">
                      {asset.kind === 'image' ? (
                        <>
                          <canvas
                            ref={canvasRef}
                            onMouseDown={handleCanvasMouseDown}
                            onMouseMove={handleCanvasMouseMove}
                            onMouseUp={handleCanvasMouseUp}
                            onMouseLeave={handleCanvasMouseUp}
                            className="max-w-full h-auto border border-gray-300 cursor-crosshair"
                            style={{ maxHeight: '600px' }}
                          />
                          {showCropButton && editState.crop && (
                            <div className="absolute top-2 right-2 flex gap-2">
                              <button
                                onClick={handleApplyCrop}
                                className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                </svg>
                                Apply Crop
                              </button>
                              <button
                                onClick={handleClearCrop}
                                className="bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-gray-400 text-6xl p-12">
                          {asset.kind === 'video' ? '🎥' : '📄'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Preview */}
                  {previewUrl && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                      <img src={previewUrl} alt="Preview" className="max-w-full h-auto max-h-[300px] border border-gray-300" />
                    </div>
                  )}

                  {/* Editing Controls */}
                  {asset.kind === 'image' && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      <h3 className="font-semibold text-gray-900">Edit Tools</h3>

                      {/* Rotate */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-24">Rotate:</span>
                        <button
                          onClick={() => handleRotate('left')}
                          className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                          title="Rotate left"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleRotate('right')}
                          className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                          title="Rotate right"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                          </svg>
                        </button>
                        {editState.rotation !== 0 && (
                          <span className="text-sm text-gray-600">({editState.rotation}°)</span>
                        )}
                      </div>

                      {/* Crop Info */}
                      {editState.crop && (
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 w-24">Crop:</span>
                          <span className="text-sm text-gray-700">
                            {Math.round(editState.crop.width)} × {Math.round(editState.crop.height)}px
                          </span>
                          <button
                            onClick={handleClearCrop}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Clear
                          </button>
                        </div>
                      )}

                      {/* Resize Slider */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 w-24">Resize:</span>
                          <input
                            type="range"
                            min="25"
                            max="200"
                            step="25"
                            value={editState.resizePercent}
                            onChange={(e) => handleResizePercentChange(parseInt(e.target.value))}
                            className="flex-1"
                          />
                          <span className="text-sm text-gray-700 w-16 text-right">{editState.resizePercent}%</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 w-24"></span>
                          <div className="flex gap-2">
                            {[25, 50, 75, 100, 125, 150, 200].map((percent) => (
                              <button
                                key={percent}
                                onClick={() => handleResizePercentChange(percent)}
                                className={`px-2 py-1 text-xs rounded ${
                                  editState.resizePercent === percent
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {percent}%
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Custom Dimensions */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 w-24">Dimensions:</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={editState.customWidth || ''}
                              onChange={(e) => handleCustomWidthChange(parseInt(e.target.value) || 0)}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="Width"
                            />
                            <span className="text-gray-500">×</span>
                            <input
                              type="number"
                              value={editState.customHeight || ''}
                              onChange={(e) => handleCustomHeightChange(parseInt(e.target.value) || 0)}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="Height"
                            />
                            <label className="flex items-center gap-1 text-sm">
                              <input
                                type="checkbox"
                                checked={editState.maintainAspectRatio}
                                onChange={(e) =>
                                  setEditState((prev) => ({ ...prev, maintainAspectRatio: e.target.checked }))
                                }
                                className="rounded"
                              />
                              Lock
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 italic">
                        Tip: Draw a box on the image to crop
                      </div>
                    </div>
                  )}
                </div>

                {/* Side Panel - Info & Variants */}
                <div className="space-y-4">
                  {/* Asset Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Asset Information</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Type:</dt>
                        <dd className="font-medium text-gray-900">{asset.kind}</dd>
                      </div>
                      {asset.width && asset.height && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Dimensions:</dt>
                          <dd className="font-medium text-gray-900">
                            {asset.width} × {asset.height}px
                          </dd>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <dt className="text-gray-600">ID:</dt>
                        <dd className="font-mono text-xs text-gray-700 break-all">{asset.id}</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Variants */}
                  {asset.kind === 'image' && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">Variants</h3>
                        <button
                          onClick={handleGenerateVariants}
                          disabled={isGenerating}
                          className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isGenerating ? 'Generating...' : 'Generate'}
                        </button>
                      </div>

                      {variantsLoading && (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                      )}

                      {!variantsLoading && variants.length === 0 && (
                        <div className="text-center py-4 text-gray-500 text-xs">
                          No variants yet
                        </div>
                      )}

                      {!variantsLoading && variants.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs text-gray-600">
                            {variants.length} variants • {formatBytes(variants.reduce((sum, v) => sum + (v.file_size || 0), 0))}
                          </div>
                          {variants.map((variant) => (
                            <div key={variant.id} className="text-xs text-gray-600">
                              {variant.variant_name}: {variant.width}×{variant.height}px ({formatBytes(variant.file_size)})
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer with action buttons */}
            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Close
                </button>
                {onDelete && (
                  <button
                    onClick={() => onDelete(assetId)}
                    disabled={isProcessing}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    Delete Asset
                  </button>
                )}
              </div>
              {asset.kind === 'image' && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleSave(false)}
                    disabled={!hasEdits() || isProcessing}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Replace the original asset with this edited version"
                  >
                    {isProcessing ? 'Updating...' : 'Update Asset'}
                  </button>
                  <button
                    onClick={() => handleSave(true)}
                    disabled={!hasEdits() || isProcessing}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Create a new asset with this edited version"
                  >
                    {isProcessing ? 'Saving...' : 'Save as New Asset'}
                  </button>
                </div>
              )}
            </div>
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

