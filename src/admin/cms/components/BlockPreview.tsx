// Block Preview Component
// Visual previews for different block types in the CMS

import { Icon } from '@mdi/react';
import { 
  mdiViewDashboard,
  mdiViewGrid,
  mdiHandPointingRight,
  mdiFormatText,
  mdiImageText,
  mdiCard,
  mdiFormatListBulleted,
  mdiViewGridOutline,
  mdiImage
} from '@mdi/js';
import type { LocalizedContent } from '../../../lib/cms/types';

interface BlockPreviewProps {
  blockType: string;
  content: LocalizedContent<Record<string, unknown>>;
  layoutVariant: string;
  locale?: string;
  className?: string;
}

interface PreviewData {
  title?: string;
  subtitle?: string;
  description?: string;
  content?: string;
  cta_text?: string;
  cta_url?: string;
  button_text?: string;
  button_url?: string;
  background_color?: string;
  features?: string[];
  items?: string[];
  columns?: number;
  text_align?: string;
  text_size?: string;
  layout?: string;
  image_alt?: string;
  list_type?: string;
  gap?: string;
}

// Icon mapping for block types
const blockIcons: Record<string, string> = {
  hero: mdiViewDashboard,
  features: mdiViewGrid,
  cta: mdiHandPointingRight,
  text: mdiFormatText,
  'image-text': mdiImageText,
  card: mdiCard,
  list: mdiFormatListBulleted,
  grid: mdiViewGridOutline
};

// Hero Block Preview
function HeroBlockPreview({ data, layoutVariant }: { data: PreviewData; layoutVariant: string }) {
  const { title, subtitle, description, cta_text, cta_url, background_color } = data;
  
  return (
    <div 
      className="relative min-h-48 rounded-lg overflow-hidden"
      style={{ backgroundColor: background_color || '#1f2937' }}
    >
      <div className={`p-8 text-white ${layoutVariant === 'centered' ? 'text-center' : ''}`}>
        {title && (
          <h1 className="text-3xl font-bold mb-4">
            {title}
          </h1>
        )}
        {subtitle && (
          <h2 className="text-xl mb-4 opacity-90">
            {subtitle}
          </h2>
        )}
        {description && (
          <p className="text-lg mb-6 opacity-80">
            {description}
          </p>
        )}
        {cta_text && cta_url && (
          <a 
            href={cta_url}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {cta_text}
          </a>
        )}
      </div>
    </div>
  );
}

// Features Block Preview
function FeaturesBlockPreview({ data }: { data: PreviewData; layoutVariant: string }) {
  const { title, subtitle, features = [], columns = 3 } = data;
  
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  }[columns] || 'grid-cols-3';
  
  return (
    <div className="p-6 bg-white rounded-lg border">
      {title && (
        <h2 className="text-2xl font-bold mb-4 text-center">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="text-gray-600 mb-6 text-center">
          {subtitle}
        </p>
      )}
      {features.length > 0 && (
        <div className={`grid ${gridCols} gap-4`}>
          {features.slice(0, columns * 2).map((feature, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-lg mb-3 flex items-center justify-center">
                <Icon path={mdiViewGrid} size={1} className="text-blue-600" />
              </div>
              <h3 className="font-medium mb-2">Feature {index + 1}</h3>
              <p className="text-sm text-gray-600">{feature}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// CTA Block Preview
function CtaBlockPreview({ data, layoutVariant }: { data: PreviewData; layoutVariant: string }) {
  const { title, description, button_text, button_url, background_color } = data;
  
  return (
    <div 
      className="p-8 rounded-lg text-white"
      style={{ backgroundColor: background_color || '#3b82f6' }}
    >
      <div className={`max-w-2xl ${layoutVariant === 'centered' ? 'mx-auto text-center' : ''}`}>
        {title && (
          <h2 className="text-2xl font-bold mb-4">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-lg mb-6 opacity-90">
            {description}
          </p>
        )}
        {button_text && button_url && (
          <a 
            href={button_url}
            className="inline-block bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            {button_text}
          </a>
        )}
      </div>
    </div>
  );
}

// Text Block Preview
function TextBlockPreview({ data }: { data: PreviewData; layoutVariant: string }) {
  const { content, text_align = 'left', text_size = 'base' } = data;
  
  const sizeClasses = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };
  
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify'
  };
  
  return (
    <div className="p-6 bg-white rounded-lg border">
      <div className={`${sizeClasses[text_size as keyof typeof sizeClasses]} ${alignClasses[text_align as keyof typeof alignClasses]}`}>
        {content ? (
          <div className="whitespace-pre-wrap">{content}</div>
        ) : (
          <p className="text-gray-400 italic">No content provided</p>
        )}
      </div>
    </div>
  );
}

// Image-Text Block Preview
function ImageTextBlockPreview({ data }: { data: PreviewData; layoutVariant: string }) {
  const { title, content, image_alt, layout = 'image-left' } = data;
  
  const isImageLeft = layout === 'image-left';
  const isImageTop = layout === 'image-top';
  
  return (
    <div className="p-6 bg-white rounded-lg border">
      <div className={`${isImageTop ? 'flex flex-col' : 'flex'} gap-6`}>
        {isImageLeft && (
          <div className="flex-shrink-0">
            <div className="w-32 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
              <Icon path={mdiImage} size={2} className="text-gray-400" />
            </div>
            {image_alt && (
              <p className="text-xs text-gray-500 mt-1">{image_alt}</p>
            )}
          </div>
        )}
        
        {isImageTop && (
          <div className="w-full">
            <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
              <Icon path={mdiImage} size={2} className="text-gray-400" />
            </div>
            {image_alt && (
              <p className="text-xs text-gray-500 mb-4">{image_alt}</p>
            )}
          </div>
        )}
        
        <div className="flex-1">
          {title && (
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
          )}
          {content && (
            <p className="text-gray-600">{content}</p>
          )}
        </div>
        
        {!isImageLeft && !isImageTop && (
          <div className="flex-shrink-0">
            <div className="w-32 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
              <Icon path={mdiImage} size={2} className="text-gray-400" />
            </div>
            {image_alt && (
              <p className="text-xs text-gray-500 mt-1">{image_alt}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Card Block Preview
function CardBlockPreview({ data }: { data: PreviewData; layoutVariant: string }) {
  const { title, content, image_alt, button_text, button_url } = data;
  
  return (
    <div className="p-6 bg-white rounded-lg border">
      <div className="max-w-sm">
        <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
          <Icon path={mdiImage} size={2} className="text-gray-400" />
        </div>
        {image_alt && (
          <p className="text-xs text-gray-500 mb-2">{image_alt}</p>
        )}
        
        {title && (
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
        )}
        
        {content && (
          <p className="text-gray-600 mb-4">{content}</p>
        )}
        
        {button_text && button_url && (
          <a 
            href={button_url}
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
          >
            {button_text}
          </a>
        )}
      </div>
    </div>
  );
}

// List Block Preview
function ListBlockPreview({ data }: { data: PreviewData; layoutVariant: string }) {
  const { title, items = [], list_type = 'bullet' } = data;
  
  return (
    <div className="p-6 bg-white rounded-lg border">
      {title && (
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
      )}
      
      {items.length > 0 ? (
        <ul className={`space-y-2 ${list_type === 'numbered' ? 'list-decimal list-inside' : 'list-disc list-inside'}`}>
          {items.slice(0, 5).map((item, index) => (
            <li key={index} className="text-gray-700">{item}</li>
          ))}
          {items.length > 5 && (
            <li className="text-gray-400 italic">... and {items.length - 5} more items</li>
          )}
        </ul>
      ) : (
        <p className="text-gray-400 italic">No items provided</p>
      )}
    </div>
  );
}

// Grid Block Preview
function GridBlockPreview({ data }: { data: PreviewData; layoutVariant: string }) {
  const { title, items = [], columns = 3, gap = 'md' } = data;
  
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  }[columns] || 'grid-cols-3';
  
  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };
  
  return (
    <div className="p-6 bg-white rounded-lg border">
      {title && (
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
      )}
      
      {items.length > 0 ? (
        <div className={`grid ${gridCols} ${gapClasses[gap as keyof typeof gapClasses]}`}>
          {items.slice(0, columns * 2).map((item, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded border text-sm">
              {item}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 italic">No items provided</p>
      )}
    </div>
  );
}

// Main Block Preview Component
export function BlockPreview({ 
  blockType, 
  content, 
  layoutVariant, 
  locale = 'en-US',
  className = '' 
}: BlockPreviewProps) {
  // Get content for the specified locale
  const localeContent = content[locale] || content['en-US'] || {};
  const data = localeContent as PreviewData;
  
  // Get block icon
  const blockIcon = blockIcons[blockType] || mdiViewGrid;
  
  const previewComponents = {
    hero: HeroBlockPreview,
    features: FeaturesBlockPreview,
    cta: CtaBlockPreview,
    text: TextBlockPreview,
    'image-text': ImageTextBlockPreview,
    card: CardBlockPreview,
    list: ListBlockPreview,
    grid: GridBlockPreview
  };
  
  const PreviewComponent = previewComponents[blockType as keyof typeof previewComponents];
  
  if (!PreviewComponent) {
    return (
      <div className={`p-6 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 ${className}`}>
        <div className="flex items-center gap-3 text-gray-500">
          <Icon path={blockIcon} size={1.5} />
          <div>
            <p className="font-medium">Unknown Block Type</p>
            <p className="text-sm">No preview available for "{blockType}"</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`block-preview ${className}`}>
      <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
        <Icon path={blockIcon} size={1} />
        <span className="font-medium capitalize">{blockType}</span>
        <span className="text-xs bg-gray-200 px-2 py-1 rounded">{layoutVariant}</span>
      </div>
      
      <PreviewComponent data={data} layoutVariant={layoutVariant} />
    </div>
  );
}

// Block Type Selector Component
interface BlockTypeSelectorProps {
  onSelect: (blockType: string) => void;
  selectedType?: string;
  className?: string;
}

export function BlockTypeSelector({ onSelect, selectedType, className = '' }: BlockTypeSelectorProps) {
  const blockTypes = [
    { type: 'hero', label: 'Hero Section', icon: mdiViewDashboard, category: 'content' },
    { type: 'features', label: 'Features', icon: mdiViewGrid, category: 'content' },
    { type: 'cta', label: 'Call to Action', icon: mdiHandPointingRight, category: 'interactive' },
    { type: 'text', label: 'Text Content', icon: mdiFormatText, category: 'content' },
    { type: 'image-text', label: 'Image & Text', icon: mdiImageText, category: 'media' },
    { type: 'card', label: 'Card', icon: mdiCard, category: 'content' },
    { type: 'list', label: 'List', icon: mdiFormatListBulleted, category: 'content' },
    { type: 'grid', label: 'Grid Layout', icon: mdiViewGridOutline, category: 'layout' }
  ];
  
  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      {blockTypes.map((blockType) => (
        <button
          key={blockType.type}
          onClick={() => onSelect(blockType.type)}
          className={`p-4 rounded-lg border-2 transition-all text-left ${
            selectedType === blockType.type
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <Icon path={blockType.icon} size={1.5} className="text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">{blockType.label}</p>
              <p className="text-xs text-gray-500 capitalize">{blockType.category}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
