// Staging Dashboard Component
// This component provides a comprehensive staging management interface

import React, { useState } from 'react';
import { useStagingSessions, useStagingSession } from '../../lib/cms/stagingHooks';
import { SiteStaging, StagingDependency } from '../../lib/cms/types';
import { StagingDependencyVisualization } from './components/StagingControls';

interface StagingDashboardProps {
  siteId: string;
}

export function StagingDashboard({ siteId }: StagingDashboardProps) {
  const [selectedStaging, setSelectedStaging] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newStagingName, setNewStagingName] = useState('');
  const [newStagingDescription, setNewStagingDescription] = useState('');

  const {
    sessions,
    loading: sessionsLoading,
    error: sessionsError,
    createNewStaging,
    deleteSession,
    refresh: refreshSessions
  } = useStagingSessions(siteId);

  const {
    session: selectedSession,
    dependencies,
    preview,
    loading: sessionLoading,
    error: sessionError,
    stageEntity,
    publishStaged,
    rollbackStaged,
    refresh: refreshSession
  } = useStagingSession(selectedStaging || '');

  const handleCreateStaging = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStagingName.trim()) return;

    const staging = await createNewStaging(newStagingName.trim(), newStagingDescription.trim() || undefined);
    if (staging) {
      setNewStagingName('');
      setNewStagingDescription('');
      setShowCreateForm(false);
      setSelectedStaging(staging.id);
    }
  };

  const handleDeleteStaging = async (stagingId: string) => {
    if (window.confirm('Are you sure you want to delete this staging session? This action cannot be undone.')) {
      await deleteSession(stagingId);
      if (selectedStaging === stagingId) {
        setSelectedStaging(null);
      }
    }
  };

  const handlePublishStaged = async () => {
    if (window.confirm('Are you sure you want to publish all staged content? This will make all staged changes live and cannot be undone.')) {
      const success = await publishStaged();
      if (success) {
        setSelectedStaging(null);
        await refreshSessions();
      }
    }
  };

  const handleRollbackStaged = async () => {
    if (window.confirm('Are you sure you want to rollback all staged content? This will discard all staged changes and cannot be undone.')) {
      const success = await rollbackStaged();
      if (success) {
        setSelectedStaging(null);
        await refreshSessions();
      }
    }
  };

  const handleStageEntity = async (entityType: 'page' | 'block' | 'menu' | 'asset', entityId: string, version: number) => {
    if (!selectedStaging) return;
    
    const success = await stageEntity(entityType, entityId, version);
    if (success) {
      await refreshSession();
    }
  };

  if (sessionsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading staging sessions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Staging Dashboard</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create New Staging Session
        </button>
      </div>

      {sessionsError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">Error loading staging sessions: {sessionsError}</div>
        </div>
      )}

      {sessionError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">Error loading staging session: {sessionError}</div>
        </div>
      )}

      {/* Create Staging Form */}
      {showCreateForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Staging Session</h3>
          <form onSubmit={handleCreateStaging} className="space-y-4">
            <div>
              <label htmlFor="staging-name" className="block text-sm font-medium text-gray-700 mb-1">
                Session Name *
              </label>
              <input
                id="staging-name"
                type="text"
                value={newStagingName}
                onChange={(e) => setNewStagingName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Q1 2024 Redesign"
                required
              />
            </div>
            <div>
              <label htmlFor="staging-description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="staging-description"
                value={newStagingDescription}
                onChange={(e) => setNewStagingDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional description of what this staging session contains"
                rows={3}
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Create Session
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staging Sessions List */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Staging Sessions</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {sessions.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No staging sessions found. Create one to start staging content.
                </div>
              ) : (
                sessions.map((session) => (
                  <StagingSessionItem
                    key={session.id}
                    session={session}
                    isSelected={selectedStaging === session.id}
                    onSelect={() => setSelectedStaging(session.id)}
                    onDelete={() => handleDeleteStaging(session.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Selected Staging Session Details */}
        <div className="lg:col-span-2">
          {selectedStaging ? (
            <StagingSessionDetails
              session={selectedSession}
              dependencies={dependencies}
              preview={preview}
              loading={sessionLoading}
              onStageEntity={handleStageEntity}
              onPublishStaged={handlePublishStaged}
              onRollbackStaged={handleRollbackStaged}
            />
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No staging session selected</h3>
                <p className="mt-1 text-sm text-gray-500">Select a staging session to view details and manage staged content.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface StagingSessionItemProps {
  session: SiteStaging;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function StagingSessionItem({ session, isSelected, onSelect, onDelete }: StagingSessionItemProps) {
  return (
    <div className={`px-6 py-4 cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-blue-50 border-r-2 border-blue-600' : ''}`} onClick={onSelect}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h4 className="text-sm font-medium text-gray-900">{session.name}</h4>
            {isSelected && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Selected
              </span>
            )}
          </div>
          {session.description && (
            <p className="mt-1 text-sm text-gray-500">{session.description}</p>
          )}
          <div className="mt-2 text-xs text-gray-400">
            Created {new Date(session.created_at).toLocaleDateString()} at{' '}
            {new Date(session.created_at).toLocaleTimeString()}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

interface StagingSessionDetailsProps {
  session: SiteStaging | null;
  dependencies: StagingDependency[];
  preview: any;
  loading: boolean;
  onStageEntity: (entityType: 'page' | 'block' | 'menu' | 'asset', entityId: string, version: number) => Promise<void>;
  onPublishStaged: () => Promise<void>;
  onRollbackStaged: () => Promise<void>;
}

function StagingSessionDetails({
  session,
  dependencies,
  preview,
  loading,
  onPublishStaged,
  onRollbackStaged
}: StagingSessionDetailsProps) {
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading staging session...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <div className="text-gray-500">
          <h3 className="text-sm font-medium text-gray-900">Session not found</h3>
          <p className="mt-1 text-sm text-gray-500">The selected staging session could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{session.name}</h3>
            {session.description && (
              <p className="mt-1 text-sm text-gray-500">{session.description}</p>
            )}
            <div className="mt-2 text-xs text-gray-400">
              Created {new Date(session.created_at).toLocaleDateString()} at{' '}
              {new Date(session.created_at).toLocaleTimeString()}
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onPublishStaged}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Publish All Staged
            </button>
            <button
              onClick={onRollbackStaged}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Rollback All Staged
            </button>
          </div>
        </div>
      </div>

      {/* Staged Content Preview */}
      {preview && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Staged Content Preview</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Pages ({preview.pages?.length || 0})</h5>
              <div className="space-y-1">
                {preview.pages?.map((page: any) => (
                  <div key={page.id} className="text-sm text-gray-600">
                    {page.slug} - {page.title?.['en-US'] || 'Untitled'}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Blocks ({preview.blocks?.length || 0})</h5>
              <div className="space-y-1">
                {preview.blocks?.map((block: any) => (
                  <div key={block.id} className="text-sm text-gray-600">
                    {block.type} - {block.tag || 'No tag'}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Menus ({preview.menus?.length || 0})</h5>
              <div className="space-y-1">
                {preview.menus?.map((menu: any) => (
                  <div key={menu.id} className="text-sm text-gray-600">
                    {menu.handle} - {menu.label}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Assets ({preview.assets?.length || 0})</h5>
              <div className="space-y-1">
                {preview.assets?.map((asset: any) => (
                  <div key={asset.id} className="text-sm text-gray-600">
                    {asset.kind} - {asset.storage_key}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dependencies */}
      {dependencies.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Staging Dependencies</h4>
          <StagingDependencyVisualization dependencies={dependencies} />
        </div>
      )}
    </div>
  );
}
