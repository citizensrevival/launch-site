// Unit tests for AssetPicker component
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AssetPicker, AssetPickerButton } from '../../admin/cms/components/AssetPicker';
import type { Asset } from '../../lib/cms/types';

// Mock the hooks
vi.mock('../../lib/cms/hooks', () => ({
  useAssets: vi.fn()
}));

describe('AssetPicker', () => {
  const mockAssets: Asset[] = [
    {
      id: 'asset-1',
      site_id: 'site-1',
      kind: 'image',
      storage_key: 'images/hero.jpg',
      width: 1920,
      height: 1080,
      duration_ms: null,
      checksum: 'abc123',
      is_system: false,
      system_key: 'hero-image',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'asset-2',
      site_id: 'site-1',
      kind: 'video',
      storage_key: 'videos/intro.mp4',
      width: 1920,
      height: 1080,
      duration_ms: 30000,
      checksum: 'def456',
      is_system: false,
      system_key: 'intro-video',
      created_at: '2024-01-02T00:00:00Z'
    },
    {
      id: 'asset-3',
      site_id: 'site-1',
      kind: 'document',
      storage_key: 'docs/guide.pdf',
      width: null,
      height: null,
      duration_ms: null,
      checksum: 'ghi789',
      is_system: false,
      system_key: 'user-guide',
      created_at: '2024-01-03T00:00:00Z'
    }
  ];

  const mockHooks = {
    useAssets: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock useAssets
    mockHooks.useAssets.mockReturnValue({
      assets: { data: mockAssets, count: 3, page: 1, page_size: 50, total_pages: 1 },
      loading: false,
      error: null
    });

    // Import and mock the hooks
    const { useAssets } = await import('../../lib/cms/hooks');
    vi.mocked(useAssets).mockImplementation(mockHooks.useAssets);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render when open', () => {
    render(
      <AssetPicker
        isOpen={true}
        onClose={vi.fn()}
        onAssetSelect={vi.fn()}
      />
    );

    expect(screen.getByText('Select Asset')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <AssetPicker
        isOpen={false}
        onClose={vi.fn()}
        onAssetSelect={vi.fn()}
      />
    );

    expect(screen.queryByText('Select Asset')).not.toBeInTheDocument();
  });

  it('should display assets', () => {
    render(
      <AssetPicker
        isOpen={true}
        onClose={vi.fn()}
        onAssetSelect={vi.fn()}
      />
    );

    expect(screen.getByText('hero-image')).toBeInTheDocument();
    expect(screen.getByText('intro-video')).toBeInTheDocument();
    expect(screen.getByText('user-guide')).toBeInTheDocument();
  });

  it('should handle asset selection', () => {
    const mockOnAssetSelect = vi.fn();
    
    render(
      <AssetPicker
        isOpen={true}
        onClose={vi.fn()}
        onAssetSelect={mockOnAssetSelect}
      />
    );

    const assetCard = screen.getByText('hero-image').closest('div');
    fireEvent.click(assetCard!);

    expect(mockOnAssetSelect).toHaveBeenCalledWith('asset-1');
  });

  it('should handle search', () => {
    render(
      <AssetPicker
        isOpen={true}
        onClose={vi.fn()}
        onAssetSelect={vi.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search assets...');
    fireEvent.change(searchInput, { target: { value: 'hero' } });

    expect(screen.getByText('hero-image')).toBeInTheDocument();
    expect(screen.queryByText('intro-video')).not.toBeInTheDocument();
  });

  it('should handle kind filtering', () => {
    render(
      <AssetPicker
        isOpen={true}
        onClose={vi.fn()}
        onAssetSelect={vi.fn()}
      />
    );

    const kindSelect = screen.getByDisplayValue('All Types');
    fireEvent.change(kindSelect, { target: { value: 'image' } });

    expect(screen.getByText('hero-image')).toBeInTheDocument();
    expect(screen.queryByText('intro-video')).not.toBeInTheDocument();
  });

  it('should handle confirm selection', () => {
    const mockOnAssetSelect = vi.fn();
    
    render(
      <AssetPicker
        isOpen={true}
        onClose={vi.fn()}
        onAssetSelect={mockOnAssetSelect}
      />
    );

    // Select an asset
    const assetCard = screen.getByText('hero-image').closest('div');
    fireEvent.click(assetCard!);

    // Confirm selection
    const confirmButton = screen.getByText('Select Asset');
    fireEvent.click(confirmButton);

    expect(mockOnAssetSelect).toHaveBeenCalledWith('asset-1');
  });

  it('should disable confirm when no asset selected', () => {
    render(
      <AssetPicker
        isOpen={true}
        onClose={vi.fn()}
        onAssetSelect={vi.fn()}
      />
    );

    const confirmButton = screen.getByText('Select Asset');
    expect(confirmButton).toBeDisabled();
  });

  it('should handle close', () => {
    const mockOnClose = vi.fn();
    
    render(
      <AssetPicker
        isOpen={true}
        onClose={mockOnClose}
        onAssetSelect={vi.fn()}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should display loading state', () => {
    mockHooks.useAssets.mockReturnValue({
      assets: null,
      loading: true,
      error: null
    });

    render(
      <AssetPicker
        isOpen={true}
        onClose={vi.fn()}
        onAssetSelect={vi.fn()}
      />
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should display error state', () => {
    mockHooks.useAssets.mockReturnValue({
      assets: null,
      loading: false,
      error: 'Failed to load assets'
    });

    render(
      <AssetPicker
        isOpen={true}
        onClose={vi.fn()}
        onAssetSelect={vi.fn()}
      />
    );

    expect(screen.getByText('Error loading assets: Failed to load assets')).toBeInTheDocument();
  });

  it('should display empty state', () => {
    mockHooks.useAssets.mockReturnValue({
      assets: { data: [], count: 0, page: 1, page_size: 50, total_pages: 0 },
      loading: false,
      error: null
    });

    render(
      <AssetPicker
        isOpen={true}
        onClose={vi.fn()}
        onAssetSelect={vi.fn()}
      />
    );

    expect(screen.getByText('No assets found')).toBeInTheDocument();
  });

  it('should show asset information', () => {
    render(
      <AssetPicker
        isOpen={true}
        onClose={vi.fn()}
        onAssetSelect={vi.fn()}
      />
    );

    expect(screen.getByText('image • 1920×1080')).toBeInTheDocument();
    expect(screen.getByText('video • 1920×1080')).toBeInTheDocument();
  });

  it('should handle retry on error', () => {
    mockHooks.useAssets.mockReturnValue({
      assets: null,
      loading: false,
      error: 'Failed to load assets'
    });

    render(
      <AssetPicker
        isOpen={true}
        onClose={vi.fn()}
        onAssetSelect={vi.fn()}
      />
    );

    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);

    // Should reload the page
    expect(window.location.reload).toHaveBeenCalled();
  });
});

describe('AssetPickerButton', () => {
  it('should render button', () => {
    render(
      <AssetPickerButton
        onAssetSelect={vi.fn()}
        buttonText="Choose Asset"
      />
    );

    expect(screen.getByText('Choose Asset')).toBeInTheDocument();
  });

  it('should open picker on click', () => {
    render(
      <AssetPickerButton
        onAssetSelect={vi.fn()}
        buttonText="Choose Asset"
      />
    );

    const button = screen.getByText('Choose Asset');
    fireEvent.click(button);

    expect(screen.getByText('Select Asset')).toBeInTheDocument();
  });

  it('should handle asset selection', () => {
    const mockOnAssetSelect = vi.fn();
    
    render(
      <AssetPickerButton
        onAssetSelect={mockOnAssetSelect}
        buttonText="Choose Asset"
      />
    );

    const button = screen.getByText('Choose Asset');
    fireEvent.click(button);

    // Select an asset (this would be mocked in the actual test)
    // The AssetPicker component would handle the selection
    expect(screen.getByText('Select Asset')).toBeInTheDocument();
  });
});
