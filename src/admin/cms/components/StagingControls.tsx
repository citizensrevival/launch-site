// Staging Controls Component
// This component provides staging controls for individual entities

import { useState } from 'react';
import { useStagingManagement } from '../../../lib/cms/stagingHooks';

interface StagingControlsProps {
  siteId: string;
  entityType: 'page' | 'block' | 'menu' | 'asset';
  entityId: string;
  version: number;
  currentStatus: 'draft' | 'published' | 'staged';
  onStatusChange?: (newStatus: 'draft' | 'published' | 'staged') => void;
}

export function StagingControls({
  siteId,
  entityType,
  entityId,
  version,
  currentStatus,
  onStatusChange
}: StagingControlsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    activeStaging,
    loading: managementLoading,
    error: managementError,
    createStagingSession,
    stageEntity,
    publishAllStaged,
    rollbackAllStaged,
  } = useStagingManagement(siteId);

  const handleStageEntity = async () => {
    if (!activeStaging) {
      // Create a new staging session
      const sessionName = `Auto-created for ${entityType} ${entityId}`;
      const staging = await createStagingSession(sessionName);
      if (!staging) return;
    }

    setLoading(true);
    setError(null);

    const success = await stageEntity(entityType, entityId, version);
    
    if (success) {
      onStatusChange?.('staged');
    } else {
      setError(managementError || 'Failed to stage entity');
    }
    
    setLoading(false);
  };

  const handleUnstageEntity = async () => {
    // For now, we'll just change the status back to draft
    // In a full implementation, this would remove the entity from staging
    onStatusChange?.('draft');
  };

  const handlePublishStaged = async () => {
    if (!activeStaging) {
      setError('No active staging session');
      return;
    }

    if (window.confirm('Are you sure you want to publish all staged content? This will make all staged changes live.')) {
      setLoading(true);
      setError(null);

      const success = await publishAllStaged();
      
      if (success) {
        onStatusChange?.('published');
      } else {
        setError(managementError || 'Failed to publish staged content');
      }
      
      setLoading(false);
    }
  };

  const handleRollbackStaged = async () => {
    if (!activeStaging) {
      setError('No active staging session');
      return;
    }

    if (window.confirm('Are you sure you want to rollback all staged content? This will discard all staged changes.')) {
      setLoading(true);
      setError(null);

      const success = await rollbackAllStaged();
      
      if (success) {
        onStatusChange?.('draft');
      } else {
        setError(managementError || 'Failed to rollback staged content');
      }
      
      setLoading(false);
    }
  };

  if (managementLoading || loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Processing...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {managementError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="text-sm text-red-800">{managementError}</div>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Status:</span>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          currentStatus === 'draft' ? 'bg-gray-100 text-gray-800' :
          currentStatus === 'published' ? 'bg-green-100 text-green-800' :
          currentStatus === 'staged' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {currentStatus}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {currentStatus === 'draft' && (
          <button
            onClick={handleStageEntity}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Stage for Publishing
          </button>
        )}

        {currentStatus === 'staged' && (
          <>
            <button
              onClick={handleUnstageEntity}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Unstage
            </button>
            <button
              onClick={handlePublishStaged}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Publish All Staged
            </button>
            <button
              onClick={handleRollbackStaged}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Rollback All Staged
            </button>
          </>
        )}

        {currentStatus === 'published' && (
          <span className="text-sm text-gray-500">This entity is currently published</span>
        )}
      </div>

      {activeStaging && (
        <div className="text-xs text-gray-500">
          Active staging session: {activeStaging}
        </div>
      )}
    </div>
  );
}

// Staging status indicator component
interface StagingStatusIndicatorProps {
  status: 'draft' | 'published' | 'staged';
  className?: string;
}

export function StagingStatusIndicator({ status, className = '' }: StagingStatusIndicatorProps) {
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
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} ${className}`}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
}

// Staging dependency visualization component
interface StagingDependencyVisualizationProps {
  dependencies: Array<{
    entity_type: string;
    entity_id: string;
    version: number;
    dependency_type: string;
  }>;
}

export function StagingDependencyVisualization({ dependencies }: StagingDependencyVisualizationProps) {
  if (dependencies.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No dependencies found
      </div>
    );
  }

  const groupedDependencies = dependencies.reduce((acc, dep) => {
    if (!acc[dep.entity_type]) {
      acc[dep.entity_type] = [];
    }
    acc[dep.entity_type].push(dep);
    return acc;
  }, {} as Record<string, typeof dependencies>);

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-900">Staging Dependencies</h4>
      {Object.entries(groupedDependencies).map(([entityType, deps]) => (
        <div key={entityType} className="bg-gray-50 rounded-md p-3">
          <div className="text-sm font-medium text-gray-700 capitalize mb-2">
            {entityType}s ({deps.length})
          </div>
          <div className="space-y-1">
            {deps.map((dep, index) => (
              <div key={index} className="text-xs text-gray-600">
                {dep.entity_id} (v{dep.version}) - {dep.dependency_type}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
