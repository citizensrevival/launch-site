// Staging Integration Component
// This component provides staging controls that can be integrated into existing editors

import React, { useState } from 'react';
import { useStagingManagement } from '../../../lib/cms/stagingHooks';
import { StagingStatusIndicator } from './StagingControls';

interface StagingIntegrationProps {
  siteId: string;
  entityType: 'page' | 'block' | 'menu' | 'asset';
  entityId: string;
  version: number;
  currentStatus: 'draft' | 'published' | 'staged';
  onStatusChange?: (newStatus: 'draft' | 'published' | 'staged') => void;
  showPreview?: boolean;
  onPreviewClick?: () => void;
}

export function StagingIntegration({
  siteId,
  entityType,
  entityId,
  version,
  currentStatus,
  onStatusChange,
  showPreview = false,
  onPreviewClick
}: StagingIntegrationProps) {
  const [showStagingOptions, setShowStagingOptions] = useState(false);
  const [stagingName, setStagingName] = useState('');
  const [stagingDescription, setStagingDescription] = useState('');

  const {
    activeStaging,
    loading,
    error,
    createStagingSession,
    stageEntity,
    publishAllStaged,
    rollbackAllStaged,
  } = useStagingManagement(siteId);

  const handleStageEntity = async () => {
    if (!activeStaging) {
      // Create a new staging session
      const sessionName = `${entityType}-${entityId}-${Date.now()}`;
      const staging = await createStagingSession(sessionName, `Auto-created for ${entityType} ${entityId}`);
      if (!staging) return;
    }

    const success = await stageEntity(entityType, entityId, version);
    if (success) {
      onStatusChange?.('staged');
    }
  };

  const handleUnstageEntity = async () => {
    // For now, we'll just change the status back to draft
    // In a full implementation, this would remove the entity from staging
    onStatusChange?.('draft');
  };

  const handlePublishStaged = async () => {
    if (!activeStaging) {
      return;
    }

    if (window.confirm('Are you sure you want to publish all staged content? This will make all staged changes live.')) {
      const success = await publishAllStaged();
      if (success) {
        onStatusChange?.('published');
      }
    }
  };

  const handleRollbackStaged = async () => {
    if (!activeStaging) {
      return;
    }

    if (window.confirm('Are you sure you want to rollback all staged content? This will discard all staged changes.')) {
      const success = await rollbackAllStaged();
      if (success) {
        onStatusChange?.('draft');
      }
    }
  };

  const handleCreateStagingSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stagingName.trim()) return;

    const staging = await createStagingSession(stagingName.trim(), stagingDescription.trim() || undefined);
    if (staging) {
      setStagingName('');
      setStagingDescription('');
      setShowStagingOptions(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Status and Basic Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <StagingStatusIndicator status={currentStatus} />
        </div>
        
        <div className="flex items-center space-x-2">
          {currentStatus === 'draft' && (
            <button
              onClick={handleStageEntity}
              disabled={loading}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Staging...' : 'Stage for Publishing'}
            </button>
          )}

          {currentStatus === 'staged' && (
            <>
              <button
                onClick={handleUnstageEntity}
                disabled={loading}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
              >
                Unstage
              </button>
              <button
                onClick={handlePublishStaged}
                disabled={loading}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                Publish All Staged
              </button>
              <button
                onClick={handleRollbackStaged}
                disabled={loading}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                Rollback All Staged
              </button>
            </>
          )}

          {showPreview && onPreviewClick && (
            <button
              onClick={onPreviewClick}
              className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Preview
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {/* Active Staging Session Info */}
      {activeStaging && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="text-sm text-blue-800">
            <strong>Active staging session:</strong> {activeStaging}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            All staged content will be published together when you click "Publish All Staged"
          </div>
        </div>
      )}

      {/* Staging Options */}
      {!activeStaging && (
        <div className="border border-gray-200 rounded-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Staging Options</h4>
              <p className="text-sm text-gray-500">Create a staging session to group related changes</p>
            </div>
            <button
              onClick={() => setShowStagingOptions(true)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Create Staging Session
            </button>
          </div>
        </div>
      )}

      {/* Create Staging Session Form */}
      {showStagingOptions && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Create Staging Session</h4>
          <form onSubmit={handleCreateStagingSession} className="space-y-3">
            <div>
              <label htmlFor="staging-name" className="block text-xs font-medium text-gray-700 mb-1">
                Session Name *
              </label>
              <input
                id="staging-name"
                type="text"
                value={stagingName}
                onChange={(e) => setStagingName(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Q1 2024 Redesign"
                required
              />
            </div>
            <div>
              <label htmlFor="staging-description" className="block text-xs font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="staging-description"
                value={stagingDescription}
                onChange={(e) => setStagingDescription(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional description"
                rows={2}
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Session'}
              </button>
              <button
                type="button"
                onClick={() => setShowStagingOptions(false)}
                className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Staging Workflow Help */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
        <h4 className="text-xs font-medium text-gray-900 mb-2">Staging Workflow</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div>1. <strong>Stage</strong> - Add this content to a staging session</div>
          <div>2. <strong>Preview</strong> - Review all staged content together</div>
          <div>3. <strong>Publish</strong> - Make all staged changes live at once</div>
          <div>4. <strong>Rollback</strong> - Discard all staged changes</div>
        </div>
      </div>
    </div>
  );
}

// Staging status badge component for use in lists
interface StagingStatusBadgeProps {
  status: 'draft' | 'published' | 'staged';
  size?: 'sm' | 'md' | 'lg';
}

export function StagingStatusBadge({ status, size = 'sm' }: StagingStatusBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'draft':
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: '📝',
          label: 'Draft'
        };
      case 'published':
        return {
          color: 'bg-green-100 text-green-800',
          icon: '✅',
          label: 'Published'
        };
      case 'staged':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: '🚀',
          label: 'Staged'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: '❓',
          label: 'Unknown'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${config.color} ${sizeClasses[size]}`}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
}

// Staging workflow progress component
interface StagingWorkflowProgressProps {
  currentStep: 'stage' | 'preview' | 'publish' | 'complete';
  onStepClick?: (step: string) => void;
}

export function StagingWorkflowProgress({ currentStep, onStepClick }: StagingWorkflowProgressProps) {
  const steps = [
    { id: 'stage', label: 'Stage Content', icon: '📝' },
    { id: 'preview', label: 'Preview Changes', icon: '👁️' },
    { id: 'publish', label: 'Publish All', icon: '🚀' },
    { id: 'complete', label: 'Complete', icon: '✅' }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="flex items-center space-x-4">
      {steps.map((step, index) => {
        const isActive = index === currentStepIndex;
        const isCompleted = index < currentStepIndex;
        const isClickable = onStepClick && (isCompleted || isActive);

        return (
          <div
            key={step.id}
            className={`flex items-center space-x-2 ${
              isClickable ? 'cursor-pointer' : 'cursor-default'
            }`}
            onClick={() => isClickable && onStepClick?.(step.id)}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                isCompleted
                  ? 'bg-green-100 text-green-800'
                  : isActive
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {isCompleted ? '✓' : step.icon}
            </div>
            <span
              className={`text-sm font-medium ${
                isActive
                  ? 'text-blue-800'
                  : isCompleted
                  ? 'text-green-800'
                  : 'text-gray-400'
              }`}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 ${
                  isCompleted ? 'bg-green-200' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
