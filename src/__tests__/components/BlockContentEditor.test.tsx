// Unit tests for BlockContentEditor component
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BlockContentEditor } from '../../admin/cms/components/BlockContentEditor';
import type { LocalizedContent } from '../../lib/cms/types';

describe('BlockContentEditor', () => {
  const mockContent: LocalizedContent<Record<string, unknown>> = {
    'en-US': {
      title: 'Hero Title',
      subtitle: 'Hero Subtitle',
      description: 'Hero Description'
    },
    'es-US': {
      title: 'Título Hero',
      subtitle: 'Subtítulo Hero',
      description: 'Descripción Hero'
    }
  };

  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with content', () => {
    render(
      <BlockContentEditor
        content={mockContent}
        onChange={mockOnChange}
        layoutVariant="hero"
      />
    );

    expect(screen.getByText('Content Editor')).toBeInTheDocument();
    expect(screen.getByText('Layout: hero')).toBeInTheDocument();
  });

  it('should display locale tabs', () => {
    render(
      <BlockContentEditor
        content={mockContent}
        onChange={mockOnChange}
        layoutVariant="hero"
      />
    );

    expect(screen.getByText('en-US')).toBeInTheDocument();
    expect(screen.getByText('es-US')).toBeInTheDocument();
  });

  it('should switch between visual and JSON tabs', () => {
    render(
      <BlockContentEditor
        content={mockContent}
        onChange={mockOnChange}
        layoutVariant="hero"
      />
    );

    const jsonTab = screen.getByText('JSON');
    fireEvent.click(jsonTab);

    expect(screen.getByDisplayValue(JSON.stringify(mockContent, null, 2))).toBeInTheDocument();
  });

  it('should handle locale switching', () => {
    render(
      <BlockContentEditor
        content={mockContent}
        onChange={mockOnChange}
        layoutVariant="hero"
      />
    );

    const esTab = screen.getByText('es-US');
    fireEvent.click(esTab);

    // Should show Spanish content
    expect(screen.getByDisplayValue('Título Hero')).toBeInTheDocument();
  });

  it('should handle field changes', () => {
    render(
      <BlockContentEditor
        content={mockContent}
        onChange={mockOnChange}
        layoutVariant="hero"
      />
    );

    const titleInput = screen.getByDisplayValue('Hero Title');
    fireEvent.change(titleInput, { target: { value: 'New Hero Title' } });

    expect(mockOnChange).toHaveBeenCalledWith({
      'en-US': {
        title: 'New Hero Title',
        subtitle: 'Hero Subtitle',
        description: 'Hero Description'
      },
      'es-US': {
        title: 'Título Hero',
        subtitle: 'Subtítulo Hero',
        description: 'Descripción Hero'
      }
    });
  });

  it('should handle JSON editing', () => {
    render(
      <BlockContentEditor
        content={mockContent}
        onChange={mockOnChange}
        layoutVariant="hero"
      />
    );

    const jsonTab = screen.getByText('JSON');
    fireEvent.click(jsonTab);

    const jsonTextarea = screen.getByDisplayValue(JSON.stringify(mockContent, null, 2));
    const newContent = { 'en-US': { title: 'New Title' } };
    
    fireEvent.change(jsonTextarea, { 
      target: { value: JSON.stringify(newContent, null, 2) } 
    });

    expect(mockOnChange).toHaveBeenCalledWith(newContent);
  });

  it('should validate JSON syntax', () => {
    render(
      <BlockContentEditor
        content={mockContent}
        onChange={mockOnChange}
        layoutVariant="hero"
      />
    );

    const jsonTab = screen.getByText('JSON');
    fireEvent.click(jsonTab);

    const jsonTextarea = screen.getByDisplayValue(JSON.stringify(mockContent, null, 2));
    fireEvent.change(jsonTextarea, { target: { value: 'invalid json' } });

    expect(screen.getByText(/invalid json/i)).toBeInTheDocument();
  });

  it('should show layout-specific fields for hero variant', () => {
    render(
      <BlockContentEditor
        content={mockContent}
        onChange={mockOnChange}
        layoutVariant="hero"
      />
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Subtitle')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Call to Action Text')).toBeInTheDocument();
    expect(screen.getByText('Call to Action URL')).toBeInTheDocument();
  });

  it('should show layout-specific fields for card variant', () => {
    render(
      <BlockContentEditor
        content={mockContent}
        onChange={mockOnChange}
        layoutVariant="card"
      />
    );

    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Content')).toBeInTheDocument();
    expect(screen.getByText('Image Alt Text')).toBeInTheDocument();
  });

  it('should show layout-specific fields for list variant', () => {
    render(
      <BlockContentEditor
        content={mockContent}
        onChange={mockOnChange}
        layoutVariant="list"
      />
    );

    expect(screen.getByText('List Items')).toBeInTheDocument();
    expect(screen.getByText('List Type')).toBeInTheDocument();
  });

  it('should handle array field changes', () => {
    const contentWithArray = {
      'en-US': {
        title: 'List Title',
        items: ['Item 1', 'Item 2']
      }
    };

    render(
      <BlockContentEditor
        content={contentWithArray}
        onChange={mockOnChange}
        layoutVariant="list"
      />
    );

    // Check if array items are displayed
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('should handle select field changes', () => {
    render(
      <BlockContentEditor
        content={mockContent}
        onChange={mockOnChange}
        layoutVariant="list"
      />
    );

    const listTypeSelect = screen.getByDisplayValue('');
    fireEvent.change(listTypeSelect, { target: { value: 'numbered' } });

    expect(listTypeSelect).toHaveValue('numbered');
  });

  it('should handle color field changes', () => {
    render(
      <BlockContentEditor
        content={mockContent}
        onChange={mockOnChange}
        layoutVariant="hero"
      />
    );

    const colorInput = screen.getByDisplayValue('#000000');
    fireEvent.change(colorInput, { target: { value: '#ff0000' } });

    expect(colorInput).toHaveValue('#ff0000');
  });

  it('should handle number field changes', () => {
    render(
      <BlockContentEditor
        content={mockContent}
        onChange={mockOnChange}
        layoutVariant="grid"
      />
    );

    const columnsInput = screen.getByDisplayValue('');
    fireEvent.change(columnsInput, { target: { value: '3' } });

    expect(columnsInput).toHaveValue(3);
  });

  it('should show required field indicators', () => {
    render(
      <BlockContentEditor
        content={mockContent}
        onChange={mockOnChange}
        layoutVariant="hero"
      />
    );

    const requiredFields = screen.getAllByText('*');
    expect(requiredFields.length).toBeGreaterThan(0);
  });

  it('should handle empty content', () => {
    render(
      <BlockContentEditor
        content={{}}
        onChange={mockOnChange}
        layoutVariant="hero"
      />
    );

    expect(screen.getByText('No content available')).toBeInTheDocument();
  });
});
