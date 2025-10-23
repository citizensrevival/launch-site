// Staging Manager Component
// This component provides the main interface for managing staging sessions

import React, { useState } from 'react';
import { useStagingSessions, useStagingManagement } from '../../lib/cms/stagingHooks';
import { SiteStaging } from '../../lib/cms/types';

interface StagingManagerProps {
  siteId: string;
}

export function StagingManager({ siteId }: StagingManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newStagingName, setNewStagingName] = useState('');
  const [newStagingDescription, setNewStagingDescription] = useState('');

  const {
    sessions,
    loading: sessionsLoading,
    error: sessionsError,
    deleteSession,
    refresh: refreshSessions
  } = useStagingSessions(siteId);

  const {
    activeStaging,
    loading: managementLoading,
    error: managementError,
    createStagingSession,
    publishAllStaged,
    rollbackAllStaged,
    setActiveStaging
  } = useStagingManagement(siteId);

  const handleCreateStaging = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStagingName.trim()) return;

    const staging = await createStagingSession(newStagingName.trim(), newStagingDescription.trim() || undefined);
    if (staging) {
      setNewStagingName('');
      setNewStagingDescription('');
      setShowCreateForm(false);
      await refreshSessions();
    }
  };

  const handleDeleteStaging = async (stagingId: string) => {
    if (window.confirm('Are you sure you want to delete this staging session?')) {
      await deleteSession(stagingId);
      if (activeStaging === stagingId) {
        setActiveStaging(null);
      }
    }
  };

  const handlePublishStaged = async () => {
    if (window.confirm('Are you sure you want to publish all staged content? This will make all staged changes live.')) {
      const success = await publishAllStaged();
      if (success) {
        await refreshSessions();
      }
    }
  };

  const handleRollbackStaged = async () => {
    if (window.confirm('Are you sure you want to rollback all staged content? This will discard all staged changes.')) {
      const success = await rollbackAllStaged();
      if (success) {
        await refreshSessions();
      }
    }
  };

  if (sessionsLoading || managementLoading) {
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
        <h2 className="text-2xl font-bold text-gray-900">Staging Management</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create Staging Session
        </button>
      </div>

      {sessionsError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">Error loading staging sessions: {sessionsError}</div>
        </div>
      )}

      {managementError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">Error: {managementError}</div>
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

      {/* Active Staging Session */}
      {activeStaging && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Active Staging Session</h3>
              <p className="text-blue-700">
                You have an active staging session. Use the controls below to manage staged content.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handlePublishStaged}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Publish All Staged
              </button>
              <button
                onClick={handleRollbackStaged}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Rollback All Staged
              </button>
              <button
                onClick={() => setActiveStaging(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Close Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staging Sessions List */}
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
                isActive={activeStaging === session.id}
                onActivate={() => setActiveStaging(session.id)}
                onDelete={() => handleDeleteStaging(session.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

interface StagingSessionItemProps {
  session: SiteStaging;
  isActive: boolean;
  onActivate: () => void;
  onDelete: () => void;
}

function StagingSessionItem({ session, isActive, onActivate, onDelete }: StagingSessionItemProps) {
  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h4 className="text-sm font-medium text-gray-900">{session.name}</h4>
            {isActive && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Active
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
          {!isActive && (
            <button
              onClick={onActivate}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Activate
            </button>
          )}
          <button
            onClick={onDelete}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
