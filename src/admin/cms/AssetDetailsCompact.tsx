// Compact Asset Editor with Toolbar
// In-place editing with metadata support

import {
  mdiClose,
  mdiContentCopy,
  mdiContentSaveOutline,
  mdiContentSavePlusOutline,
  mdiDelete,
  mdiDownloadCircleOutline,
  mdiImageSizeSelectActual,
  mdiImageSizeSelectLarge,
  mdiOpenInNew,
  mdiPlus,
  mdiRotateLeft,
  mdiRotateRight,
  mdiTarget,
} from '@mdi/js';
import Icon from '@mdi/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { generateAssetVariants, updateAssetMetadata } from '../../lib/cms/client';
import { useAsset, useAssetManagement, useAssetVariants } from '../../lib/cms/hooks';
import type { AssetEditOperation, CropParams, ResizeParams, RotateParams } from '../../lib/cms/types';
import { getAssetUrl } from '../../lib/cms/utils';
import { supabase } from '../../shell/lib/supabase';
import { Toast } from './components/Toast';

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
  name: string;
  altText: string;
  description: string;
  tags: string[];
  focalPoint: { x: number; y: number } | null;
}

export function AssetDetailsCompact({ assetId, siteId, onAssetUpdated, onClose, onDelete }: AssetDetailsCompactProps) {
  const { asset, loading: assetLoading, error: assetError, refresh: refreshAsset } = useAsset(assetId);
  const { variants, loading: variantsLoading, refresh: refreshVariants } = useAssetVariants(assetId);
  const { saveEditedAsset } = useAssetManagement();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [newTag, setNewTag] = useState('');
  
  // Edit state
  const [editState, setEditState] = useState<EditState>({
    crop: null,
    rotation: 0,
    resizePercent: 100,
  });
  
  // Metadata state
  const [metadata, setMetadata] = useState<MetadataState>({
    name: '',
    altText: '',
    description: '',
    tags: [],
    focalPoint: null,
  });
  
  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const cropStartRef = useRef<{ x: number; y: number } | null>(null);
  const [isDrawingCrop, setIsDrawingCrop] = useState(false);
  const [isSelectingFocalPoint, setIsSelectingFocalPoint] = useState(false);

  // Initialize metadata from asset and latest version
  useEffect(() => {
    const loadMetadata = async () => {
      if (!asset) return;

      // Get the latest asset version to load existing metadata
      const { data: latestVersion } = await supabase
        .from('asset_version')
        .select('meta')
        .eq('asset_id', asset.id)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();

      const meta = latestVersion?.meta?.['en-US'] || {};
      
      setMetadata({
        name: (meta as any).name || asset.storage_key.split('/').pop() || '',
        altText: meta.alt || '',
        description: meta.caption || '',
        tags: Array.isArray(meta.tags) ? meta.tags : [],
        focalPoint: (meta as any).focalPoint || null,
      });
    };

    loadMetadata();
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

  const hasMetadataChanges = useCallback(() => {
    // This is a simple check - in production you'd compare with original values
    return metadata.name.length > 0 || metadata.altText.length > 0 || metadata.tags.length > 0;
  }, [metadata]);

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

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag) {
      setMetadata(prev => {
        // Prevent duplicates
        if (prev.tags.includes(trimmedTag)) {
          return prev;
        }
        // Add and sort alphabetically
        const updatedTags = [...prev.tags, trimmedTag].sort((a, b) => 
          a.toLowerCase().localeCompare(b.toLowerCase())
        );
        return {
          ...prev,
          tags: updatedTags
        };
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const saveMetadata = async () => {
    const result = await updateAssetMetadata(assetId, {
      fileName: metadata.name,
      altText: metadata.altText,
      description: metadata.description,
      tags: metadata.tags,
      focalPoint: metadata.focalPoint || undefined,
    });
    
    if (result.error) {
      throw new Error(result.error);
    }
  };

  const handleSave = async (createNew: boolean) => {
    setIsProcessing(true);
    try {
      // If there are image edits, process them
      if (hasEdits() && imageRef.current) {
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
          // Save metadata after image edits
          await saveMetadata();
          
          setToast({
            message: createNew ? 'New asset created!' : 'Asset updated!',
            type: 'success',
          });
          handleResetEdits();
          if (onAssetUpdated) onAssetUpdated();
          if (!createNew) {
            refreshAsset();
            // Regenerate variants after update
            setTimeout(() => {
              generateAssetVariants(assetId);
              setTimeout(() => refreshVariants(), 2000);
            }, 1000);
          }
        } else {
          setToast({
            message: 'Failed to save',
            type: 'error',
            details: result.error || 'Unknown error',
          });
        }
      } else if (hasMetadataChanges()) {
        // Only metadata changes, no image edits
        await saveMetadata();
        setToast({
          message: 'Metadata saved!',
          type: 'success',
        });
        refreshAsset();
      } else {
        setToast({
          message: 'No changes to save',
          type: 'info',
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

  const handleCopyUrl = (storageKey: string) => {
    const url = getAssetUrl(storageKey, siteId);
    navigator.clipboard.writeText(url);
    setToast({ message: 'URL copied!', type: 'success' });
  };

  const handleOpenInNew = (storageKey: string) => {
    const url = getAssetUrl(storageKey, siteId);
    window.open(url, '_blank');
  };

  const handleDownload = (storageKey: string, name: string) => {
    const url = getAssetUrl(storageKey, siteId);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const hasChanges = hasEdits() || hasMetadataChanges();

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
        <div className="relative w-full max-w-6xl bg-white rounded-lg shadow-xl max-h-[90vh] flex flex-col">
          {/* Combined Header and Toolbar */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 flex-shrink-0">
            {/* Left: Editing Controls */}
            <div className="flex items-center gap-2">
              {asset.kind === 'image' && (
                <>
                  <button
                    onClick={() => handleRotate('left')}
                    className="p-2 text-gray-600 hover:bg-gray-200 rounded"
                    title="Rotate left"
                  >
                    <Icon path={mdiRotateLeft} size={0.8} />
                  </button>
                  <button
                    onClick={() => handleRotate('right')}
                    className="p-2 text-gray-600 hover:bg-gray-200 rounded"
                    title="Rotate right"
                  >
                    <Icon path={mdiRotateRight} size={0.8} />
                  </button>

                  <div className="w-px h-6 bg-gray-300 mx-1"></div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">Size:</span>
                    <select
                      value={editState.resizePercent}
                      onChange={(e) => setEditState(prev => ({ ...prev, resizePercent: parseInt(e.target.value) }))}
                      className="px-2 py-1 text-xs border border-gray-300 rounded bg-white"
                    >
                      <option value="25">25%</option>
                      <option value="50">50%</option>
                      <option value="75">75%</option>
                      <option value="100">100%</option>
                      <option value="125">125%</option>
                      <option value="150">150%</option>
                      <option value="200">200%</option>
                    </select>
                  </div>

                  <div className="w-px h-6 bg-gray-300 mx-1"></div>

                  <button
                    onClick={() => setIsSelectingFocalPoint(!isSelectingFocalPoint)}
                    className={`p-2 rounded ${
                      isSelectingFocalPoint
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                    title="Set focal point"
                  >
                    <Icon path={mdiTarget} size={0.8} />
                  </button>

                  {editState.crop && (
                    <button
                      onClick={handleClearCrop}
                      className="text-xs px-2 py-1 text-red-600 hover:bg-red-100 rounded"
                      title="Clear crop"
                    >
                      Clear Crop
                    </button>
                  )}

                  {hasEdits() && (
                    <button
                      onClick={handleResetEdits}
                      className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-200 rounded"
                      title="Reset all edits"
                    >
                      Reset
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-2">
              {onDelete && (
                <button
                  onClick={() => onDelete(assetId)}
                  disabled={isProcessing}
                  className="p-2 text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors"
                  title="Delete asset"
                >
                  <Icon path={mdiDelete} size={0.9} />
                </button>
              )}
              <button
                onClick={() => handleSave(false)}
                disabled={!hasChanges || isProcessing}
                className="p-2 text-indigo-600 hover:text-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Update asset"
              >
                <Icon path={mdiContentSaveOutline} size={0.9} />
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={!hasChanges || isProcessing}
                className="p-2 text-blue-600 hover:text-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Save as new asset"
              >
                <Icon path={mdiContentSavePlusOutline} size={0.9} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Close"
              >
                <Icon path={mdiClose} size={0.9} />
              </button>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              {/* LEFT COLUMN - Image and Variants */}
              <div className="space-y-4">
                {/* Canvas */}
                <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
                  {asset.kind === 'image' ? (
                    <canvas
                      ref={canvasRef}
                      onClick={handleCanvasClick}
                      onMouseDown={handleCanvasMouseDown}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                      onMouseLeave={handleCanvasMouseUp}
                      className="max-w-full h-auto border border-gray-300 cursor-crosshair"
                      style={{ maxHeight: 'calc(90vh - 400px)' }}
                    />
                  ) : (
                    <div className="text-gray-400 text-6xl p-12">
                      {asset.kind === 'video' ? '🎥' : '📄'}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 text-center">
                  {isSelectingFocalPoint
                    ? 'Click on the image to set focal point'
                    : 'Draw on image to crop • Use toolbar to rotate/resize'}
                </div>

                {/* Image & Variants List */}
                {asset.kind === 'image' && (
                  <div className="space-y-2">
                    {/* Original Image */}
                    <div className="flex items-center justify-between p-2 border border-gray-300 rounded bg-white text-xs">
                      <div className="flex items-center gap-2 flex-1">
                        <Icon path={mdiImageSizeSelectActual} size={0.7} className="text-blue-600" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Original</div>
                          <div className="text-gray-600">
                            {asset.width}×{asset.height}px
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopyUrl(asset.storage_key)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                          title="Copy URL"
                        >
                          <Icon path={mdiContentCopy} size={0.6} />
                        </button>
                        <button
                          onClick={() => handleOpenInNew(asset.storage_key)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                          title="Open in new tab"
                        >
                          <Icon path={mdiOpenInNew} size={0.6} />
                        </button>
                        <button
                          onClick={() => handleDownload(asset.storage_key, metadata.name)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                          title="Download"
                        >
                          <Icon path={mdiDownloadCircleOutline} size={0.6} />
                        </button>
                      </div>
                    </div>

                    {/* Variants */}
                    {variantsLoading && (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      </div>
                    )}

                    {!variantsLoading && variants.length === 0 && (
                      <div className="text-center py-4">
                        <button
                          onClick={handleGenerateVariants}
                          disabled={isGenerating}
                          className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isGenerating ? 'Generating...' : 'Generate Variants'}
                        </button>
                      </div>
                    )}

                    {!variantsLoading && variants.length > 0 && (
                      <>
                        {variants.map((variant) => (
                          <div key={variant.id} className="flex items-center justify-between p-2 border border-gray-200 rounded bg-white text-xs">
                            <div className="flex items-center gap-2 flex-1">
                              <Icon path={mdiImageSizeSelectLarge} size={0.7} className="text-gray-500" />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 capitalize">{variant.variant_name}</div>
                                <div className="text-gray-600">
                                  {variant.width}×{variant.height}px • {formatBytes(variant.file_size)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleCopyUrl(variant.storage_key)}
                                className="p-1 text-gray-500 hover:text-gray-700"
                                title="Copy URL"
                              >
                                <Icon path={mdiContentCopy} size={0.6} />
                              </button>
                              <button
                                onClick={() => handleOpenInNew(variant.storage_key)}
                                className="p-1 text-gray-500 hover:text-gray-700"
                                title="Open in new tab"
                              >
                                <Icon path={mdiOpenInNew} size={0.6} />
                              </button>
                              <button
                                onClick={() => handleDownload(variant.storage_key, `${metadata.name}-${variant.variant_name}`)}
                                className="p-1 text-gray-500 hover:text-gray-700"
                                title="Download"
                              >
                                <Icon path={mdiDownloadCircleOutline} size={0.6} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN - Metadata */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900">Metadata</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={metadata.name}
                    onChange={(e) => setMetadata(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Display name (does not change storage key)
                  </p>
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
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Add a tag..."
                      />
                      <button
                        onClick={handleAddTag}
                        className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                        title="Add tag"
                      >
                        <Icon path={mdiPlus} size={0.9} />
                      </button>
                    </div>
                    {metadata.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {metadata.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {tag}
                            <button
                              onClick={() => handleRemoveTag(index)}
                              className="text-gray-500 hover:text-red-600"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {metadata.focalPoint && (
                  <div className="pt-2 text-xs text-gray-600">
                    <span className="font-medium">Focal Point:</span> ({Math.round(metadata.focalPoint.x)}, {Math.round(metadata.focalPoint.y)})
                    <button
                      onClick={() => setMetadata(prev => ({ ...prev, focalPoint: null }))}
                      className="ml-2 text-red-600 hover:text-red-700"
                    >
                      Clear
                    </button>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200 text-sm text-gray-600 space-y-1">
                  <div>
                    <span className="font-medium">ID:</span> {asset.id.substring(0, 8)}...
                  </div>
                  <div>
                    <span className="font-medium">Type:</span> {asset.kind}
                  </div>
                  {asset.width && asset.height && (
                    <div>
                      <span className="font-medium">Dimensions:</span> {asset.width} × {asset.height}px
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Created:</span> {new Date(asset.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
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
