import { useState, useRef, useEffect, useCallback } from 'react';
import type { Asset, AssetEditOperation, CropParams, ResizeParams, RotateParams } from '../../../lib/cms/types';

type EditMode = 'none' | 'crop' | 'resize' | 'rotate';

interface AssetEditorProps {
  asset: Asset;
  imageUrl: string;
  onSave: (editOperation: AssetEditOperation, editedImageBlob: Blob) => Promise<void>;
  onCancel: () => void;
}

export function AssetEditor({ asset, imageUrl, onSave, onCancel }: AssetEditorProps) {
  const [mode, setMode] = useState<EditMode>('none');
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);
  const [cropArea, setCropArea] = useState<CropParams | null>(null);
  const [resizeWidth, setResizeWidth] = useState(asset.width || 0);
  const [resizeHeight, setResizeHeight] = useState(asset.height || 0);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const cropStartRef = useRef<{ x: number; y: number } | null>(null);
  const cropPreviewRef = useRef<HTMLCanvasElement>(null);

  // Load the original image
  useEffect(() => {
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
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Update preview when rotation changes
  useEffect(() => {
    if (mode === 'rotate' && imageRef.current && canvasRef.current) {
      applyRotationPreview();
    }
  }, [rotation, mode]);

  const applyRotationPreview = useCallback(() => {
    if (!imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;

    // Adjust canvas size based on rotation
    if (rotation === 90 || rotation === 270) {
      canvas.width = img.height;
      canvas.height = img.width;
    } else {
      canvas.width = img.width;
      canvas.height = img.height;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();
  }, [rotation]);

  const handleModeChange = (newMode: EditMode) => {
    setMode(newMode);
    setCropArea(null);
    setRotation(0);
    
    // Reset canvas to original image
    if (imageRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const img = imageRef.current;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
    }
  };

  const handleRotate = (degrees: 90 | 180 | 270) => {
    setRotation((prev) => ((prev + degrees) % 360) as 0 | 90 | 180 | 270);
  };

  const handleResizeWidthChange = (width: number) => {
    setResizeWidth(width);
    if (maintainAspectRatio && asset.width && asset.height) {
      const aspectRatio = asset.width / asset.height;
      setResizeHeight(Math.round(width / aspectRatio));
    }
  };

  const handleResizeHeightChange = (height: number) => {
    setResizeHeight(height);
    if (maintainAspectRatio && asset.width && asset.height) {
      const aspectRatio = asset.width / asset.height;
      setResizeWidth(Math.round(height * aspectRatio));
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== 'crop' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    cropStartRef.current = { x, y };
    setCropArea({ x, y, width: 0, height: 0 });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== 'crop' || !cropStartRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const currentX = (e.clientX - rect.left) * scaleX;
    const currentY = (e.clientY - rect.top) * scaleY;

    const width = currentX - cropStartRef.current.x;
    const height = currentY - cropStartRef.current.y;

    setCropArea({
      x: width > 0 ? cropStartRef.current.x : currentX,
      y: height > 0 ? cropStartRef.current.y : currentY,
      width: Math.abs(width),
      height: Math.abs(height),
    });

    // Draw crop preview
    drawCropPreview(cropArea);
  };

  const handleCanvasMouseUp = () => {
    if (mode === 'crop') {
      cropStartRef.current = null;
    }
  };

  const drawCropPreview = (crop: CropParams | null) => {
    if (!crop || !imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Redraw original image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0);

    // Draw dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear crop area
    ctx.clearRect(crop.x, crop.y, crop.width, crop.height);
    ctx.drawImage(imageRef.current, crop.x, crop.y, crop.width, crop.height, crop.x, crop.y, crop.width, crop.height);

    // Draw crop border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(crop.x, crop.y, crop.width, crop.height);
  };

  const generateEditedImage = async (): Promise<{ blob: Blob; operation: AssetEditOperation }> => {
    if (!canvasRef.current || !imageRef.current) {
      throw new Error('Canvas or image not ready');
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    const img = imageRef.current;

    // Apply edits based on mode
    if (mode === 'crop' && cropArea && cropArea.width > 0 && cropArea.height > 0) {
      canvas.width = cropArea.width;
      canvas.height = cropArea.height;
      ctx.drawImage(img, cropArea.x, cropArea.y, cropArea.width, cropArea.height, 0, 0, cropArea.width, cropArea.height);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Failed to create blob'))), 'image/jpeg', 0.92);
      });

      return {
        blob,
        operation: {
          operation: 'crop',
          params: cropArea,
        },
      };
    } else if (mode === 'resize') {
      canvas.width = resizeWidth;
      canvas.height = resizeHeight;
      ctx.drawImage(img, 0, 0, resizeWidth, resizeHeight);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Failed to create blob'))), 'image/jpeg', 0.92);
      });

      return {
        blob,
        operation: {
          operation: 'resize',
          params: {
            width: resizeWidth,
            height: resizeHeight,
            maintainAspectRatio,
          } as ResizeParams,
        },
      };
    } else if (mode === 'rotate' && rotation !== 0) {
      // Adjust canvas size based on rotation
      if (rotation === 90 || rotation === 270) {
        canvas.width = img.height;
        canvas.height = img.width;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Failed to create blob'))), 'image/jpeg', 0.92);
      });

      return {
        blob,
        operation: {
          operation: 'rotate',
          params: { degrees: rotation as 90 | 180 | 270 } as RotateParams,
        },
      };
    }

    throw new Error('No valid edit operation selected');
  };

  const handleSave = async () => {
    if (mode === 'none') return;

    setIsProcessing(true);
    try {
      const { blob, operation } = await generateEditedImage();
      await onSave(operation, blob);
    } catch (error) {
      console.error('Error saving edited asset:', error);
      alert('Failed to save edited asset');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePreview = async () => {
    try {
      const { blob } = await generateEditedImage();
      const url = URL.createObjectURL(blob);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(url);
    } catch (error) {
      console.error('Error generating preview:', error);
      alert('Failed to generate preview');
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const isValidEdit =
    (mode === 'crop' && cropArea && cropArea.width > 0 && cropArea.height > 0) ||
    (mode === 'resize' && resizeWidth > 0 && resizeHeight > 0) ||
    (mode === 'rotate' && rotation !== 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" onClick={onCancel} />

        <div className="relative w-full max-w-6xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">Edit Asset</h2>
            <button
              onClick={onCancel}
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
              {/* Tools Panel */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Edit Tools</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleModeChange('crop')}
                      className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        mode === 'crop'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Crop
                    </button>
                    <button
                      onClick={() => handleModeChange('resize')}
                      className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        mode === 'resize'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Resize
                    </button>
                    <button
                      onClick={() => handleModeChange('rotate')}
                      className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        mode === 'rotate'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Rotate
                    </button>
                  </div>
                </div>

                {/* Tool-specific controls */}
                {mode === 'crop' && (
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Crop Settings</h4>
                    <p className="text-xs text-gray-600">
                      Click and drag on the image to select crop area
                    </p>
                    {cropArea && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <div>X: {Math.round(cropArea.x)}</div>
                        <div>Y: {Math.round(cropArea.y)}</div>
                        <div>Width: {Math.round(cropArea.width)}</div>
                        <div>Height: {Math.round(cropArea.height)}</div>
                      </div>
                    )}
                  </div>
                )}

                {mode === 'resize' && (
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Resize Settings</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Width (px)</label>
                        <input
                          type="number"
                          value={resizeWidth}
                          onChange={(e) => handleResizeWidthChange(parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Height (px)</label>
                        <input
                          type="number"
                          value={resizeHeight}
                          onChange={(e) => handleResizeHeightChange(parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={maintainAspectRatio}
                          onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-xs text-gray-700">Maintain aspect ratio</span>
                      </label>
                    </div>
                  </div>
                )}

                {mode === 'rotate' && (
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Rotate</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleRotate(90)}
                        className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-md"
                      >
                        90°
                      </button>
                      <button
                        onClick={() => handleRotate(180)}
                        className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-md"
                      >
                        180°
                      </button>
                      <button
                        onClick={() => handleRotate(270)}
                        className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-md"
                      >
                        270°
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-600">Current: {rotation}°</p>
                  </div>
                )}

                {/* Original dimensions */}
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Original</h4>
                  <div className="text-xs text-gray-600">
                    <div>Width: {asset.width}px</div>
                    <div>Height: {asset.height}px</div>
                  </div>
                </div>
              </div>

              {/* Canvas Area */}
              <div className="lg:col-span-2">
                <div className="bg-gray-100 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
                  <div className="relative max-w-full max-h-[600px] overflow-auto">
                    <canvas
                      ref={canvasRef}
                      onMouseDown={handleCanvasMouseDown}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                      onMouseLeave={handleCanvasMouseUp}
                      className="max-w-full h-auto border border-gray-300 cursor-crosshair"
                      style={{ maxHeight: '600px' }}
                    />
                  </div>
                </div>

                {/* Preview */}
                {previewUrl && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                    <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
                      <img src={previewUrl} alt="Preview" className="max-w-full h-auto max-h-[300px]" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 bg-gray-50">
            <button
              onClick={onCancel}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePreview}
              disabled={!isValidEdit || isProcessing}
              className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100 disabled:opacity-50"
            >
              Preview
            </button>
            <button
              onClick={handleSave}
              disabled={!isValidEdit || isProcessing}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isProcessing ? 'Saving...' : 'Save Edited Version'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

