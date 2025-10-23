// Unit tests for BlockEditor component
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BlockEditor } from '../../admin/cms/components/BlockEditor';
import type { Block, BlockVersion } from '../../lib/cms/types';

// Mock the hooks
vi.mock('../../lib/cms/hooks', () => ({
  useBlockVersions: vi.fn(),
  useBlockVersionManagement: vi.fn()
}));

// Mock the child components
vi.mock('../../admin/cms/components/BlockContentEditor', () => ({
  BlockContentEditor: ({ content, onChange }: any) => (
    <div data-testid="block-content-editor">
      <textarea
        data-testid="content-input"
        value={JSON.stringify(content)}
        onChange={(e) => onChange(JSON.parse(e.target.value))}
      />
    </div>
  )
}));

vi.mock('../../admin/cms/components/AssetPicker', () => ({
  AssetPicker: ({ onAssetSelect }: any) => (
    <div data-testid="asset-picker">
      <button
        data-testid="select-asset"
        onClick={() => onAssetSelect('asset-123')}
      >
        Select Asset
      </button>
    </div>
  )
}));

describe('BlockEditor', () => {
  const mockBlock: Block = {
    id: 'block-123',
    site_id: 'site-123',
    type: 'hero',
    tag: 'marketing',
    is_system: false,
    system_key: 'hero-block'
  };

  const mockVersions: BlockVersion[] = [
    {
      id: 'version-1',
      block_id: 'block-123',
      version: 1,
      layout_variant: 'default',
      content: { 'en-US': { title: 'Hero Title' } },
      assets: [],
      status: 'published',
      created_at: '2024-01-01T00:00:00Z',
      created_by: 'user-123',
      updated_by: null,
      updated_at: null
    },
    {
      id: 'version-2',
      block_id: 'block-123',
      version: 2,
      layout_variant: 'hero',
      content: { 'en-US': { title: 'Updated Hero Title' } },
      assets: [{ role: 'hero_image', asset_id: 'asset-123' }],
      status: 'draft',
      created_at: '2024-01-02T00:00:00Z',
      created_by: 'user-123',
      updated_by: 'user-123',
      updated_at: '2024-01-02T00:00:00Z'
    }
  ];

  const mockHooks = {
    useBlockVersions: vi.fn(),
    useBlockVersionManagement: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock useBlockVersions
    mockHooks.useBlockVersions.mockReturnValue({
      versions: { data: mockVersions },
      loading: false,
      error: null
    });

    // Mock useBlockVersionManagement
    mockHooks.useBlockVersionManagement.mockReturnValue({
      createBlockVersion: vi.fn().mockResolvedValue({ data: mockVersions[1], error: null }),
      updateBlockVersion: vi.fn().mockResolvedValue({ data: mockVersions[1], error: null }),
      publishBlock: vi.fn().mockResolvedValue({ data: true, error: null }),
      loading: false,
      error: null
    });

    // Import and mock the hooks
    const { useBlockVersions, useBlockVersionManagement } = await import('../../lib/cms/hooks');
    vi.mocked(useBlockVersions).mockImplementation(mockHooks.useBlockVersions);
    vi.mocked(useBlockVersionManagement).mockImplementation(mockHooks.useBlockVersionManagement);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render when open', () => {
    render(
      <BlockEditor
        block={mockBlock}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Edit Block: hero')).toBeInTheDocument();
    expect(screen.getByText('Version Management')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <BlockEditor
        block={mockBlock}
        isOpen={false}
        onClose={vi.fn()}
      />
    );

    expect(screen.queryByText('Edit Block: hero')).not.toBeInTheDocument();
  });

  it('should display version information', () => {
    render(
      <BlockEditor
        block={mockBlock}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Version 2')).toBeInTheDocument();
    expect(screen.getByText('draft')).toBeInTheDocument();
  });

  it('should allow version selection', async () => {
    render(
      <BlockEditor
        block={mockBlock}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    const versionSelector = screen.getByText('Version 2');
    fireEvent.click(versionSelector);

    await waitFor(() => {
      expect(screen.getByText('Version 1')).toBeInTheDocument();
    });
  });

  it('should handle layout variant changes', () => {
    render(
      <BlockEditor
        block={mockBlock}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    const layoutSelect = screen.getByDisplayValue('hero');
    fireEvent.change(layoutSelect, { target: { value: 'card' } });

    expect(layoutSelect).toHaveValue('card');
  });

  it('should handle save version', async () => {
    const mockOnSave = vi.fn();
    const { createBlockVersion } = mockHooks.useBlockVersionManagement();

    render(
      <BlockEditor
        block={mockBlock}
        isOpen={true}
        onClose={vi.fn()}
        onSave={mockOnSave}
      />
    );

    const saveButton = screen.getByText('Save Version');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(createBlockVersion).toHaveBeenCalled();
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  it('should handle publish version', async () => {
    const { publishBlock } = mockHooks.useBlockVersionManagement();

    render(
      <BlockEditor
        block={mockBlock}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    const publishButton = screen.getByText('Publish');
    fireEvent.click(publishButton);

    await waitFor(() => {
      expect(publishBlock).toHaveBeenCalledWith('block-123', 2);
    });
  });

  it('should handle asset management', () => {
    render(
      <BlockEditor
        block={mockBlock}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    // Check if assets are displayed
    expect(screen.getByText('hero_image')).toBeInTheDocument();
  });

  it('should handle close', () => {
    const mockOnClose = vi.fn();
    
    render(
      <BlockEditor
        block={mockBlock}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should display loading state', () => {
    mockHooks.useBlockVersions.mockReturnValue({
      versions: null,
      loading: true,
      error: null
    });

    render(
      <BlockEditor
        block={mockBlock}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Loading versions...')).toBeInTheDocument();
  });

  it('should display error state', () => {
    mockHooks.useBlockVersions.mockReturnValue({
      versions: null,
      loading: false,
      error: 'Failed to load versions'
    });

    render(
      <BlockEditor
        block={mockBlock}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Error loading versions: Failed to load versions')).toBeInTheDocument();
  });
});
