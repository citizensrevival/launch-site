I'll analyze your project structure and recommend a content management strategy that integrates well with your existing Supabase setup. Let me first examine your current architecture to understand the best approach.


## Recommended Content Management Strategy

### 1. **Database Schema Extension**

First, let's extend your Supabase schema to support content management with pages, layouts, and content blocks:

```sql
-- Content pages table
create table if not exists public.content_pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  layout text not null default 'single_column', -- 'single_column', 'pic_above_markdown_below', etc.
  properties jsonb not null default '{}'::jsonb, -- Page-specific properties (SEO, meta, etc.)
  meta jsonb default '{}'::jsonb,
  published boolean default false,
  sort_order integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Content blocks table (reusable across pages)
create table if not exists public.content_blocks (
  id uuid primary key default gen_random_uuid(),
  block_type text not null, -- 'markdown', 'image', 'image_carousel', 'column_content'
  content jsonb not null default '{}'::jsonb, -- Block content and layout data
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Page-block relationships (many-to-many)
create table if not exists public.page_blocks (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.content_pages(id) on delete cascade,
  block_id uuid not null references public.content_blocks(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique(page_id, block_id)
);

-- Content assets table
create table if not exists public.content_assets (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  original_name text not null,
  mime_type text not null,
  size_bytes integer not null,
  url text not null,
  alt_text text,
  metadata jsonb default '{}'::jsonb, -- Additional image metadata, dimensions, etc.
  created_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists content_pages_slug_idx on public.content_pages (slug);
create index if not exists content_pages_published_idx on public.content_pages (published);
create index if not exists content_pages_sort_idx on public.content_pages (sort_order);
create index if not exists content_pages_layout_idx on public.content_pages (layout);
create index if not exists content_blocks_type_idx on public.content_blocks (block_type);
create index if not exists page_blocks_page_idx on public.page_blocks (page_id);
create index if not exists page_blocks_sort_idx on public.page_blocks (sort_order);
create index if not exists content_assets_filename_idx on public.content_assets (filename);
create index if not exists content_assets_mime_type_idx on public.content_assets (mime_type);

-- RLS policies
alter table public.content_pages enable row level security;
alter table public.content_blocks enable row level security;
alter table public.page_blocks enable row level security;
alter table public.content_assets enable row level security;

-- Public can read published content
create policy "public can read published content" on public.content_pages
  for select to anon, authenticated
  using (published = true);

create policy "public can read published blocks" on public.content_blocks
  for select to anon, authenticated
  using (true); -- Blocks are reusable, so always readable

create policy "public can read page blocks" on public.page_blocks
  for select to anon, authenticated
  using (exists (select 1 from public.content_pages p where p.id = page_id and p.published = true));

-- Only admins can manage content
create policy "admins can manage pages" on public.content_pages
  for all to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

create policy "admins can manage blocks" on public.content_blocks
  for all to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

create policy "admins can manage page blocks" on public.page_blocks
  for all to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

create policy "admins can manage assets" on public.content_assets
  for all to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));
```

### 2. **Content Management Service**

Create a service similar to your `LeadsAdmin.ts`:

```typescript
// src/lib/ContentManager.ts
export type PageLayout = 
  | 'single_column'
  | 'pic_above_markdown_below'
  | 'pic_left_markdown_right' 
  | 'pic_right_markdown_left'
  | 'image_carousel'
  | 'two_columns'
  | 'three_columns';

// Page properties stored in JSONB
export interface PageProperties {
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  styling?: {
    background_color?: string;
    text_color?: string;
    custom_css?: string;
  };
  features?: {
    show_comments?: boolean;
    show_sharing?: boolean;
    show_related?: boolean;
  };
}

// Block content stored in JSONB
export interface BlockContent {
  // For markdown blocks
  content?: string; // Markdown content
  
  // For image blocks
  image?: ImageData;
  
  // For carousel blocks
  carousel?: CarouselData;
  
  // For column blocks
  columns?: ColumnData[];
  
  // Layout-specific properties
  layout?: {
    width?: string;
    alignment?: 'left' | 'center' | 'right';
    padding?: string;
    margin?: string;
  };
}

export interface ImageData {
  url: string;
  alt: string;
  caption?: string;
  link?: string;
  metadata?: Record<string, any>;
}

export interface CarouselData {
  images: ImageData[];
  autoplay?: boolean;
  interval?: number;
  show_indicators?: boolean;
  show_navigation?: boolean;
  transition?: 'slide' | 'fade';
}

export interface ColumnData {
  column_number: number;
  content: string; // Markdown
  image?: ImageData;
  sort_order: number;
}

export interface ContentPage {
  id: string;
  slug: string;
  title: string;
  layout: PageLayout;
  properties: PageProperties;
  meta: Record<string, any>;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ContentBlock {
  id: string;
  block_type: 'markdown' | 'image' | 'image_carousel' | 'column_content';
  content: BlockContent;
  meta: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PageBlock {
  id: string;
  page_id: string;
  block_id: string;
  sort_order: number;
  created_at: string;
}

export interface ContentAsset {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  url: string;
  alt_text: string;
  metadata: Record<string, any>;
  created_at: string;
}

export class ContentManager {
  private supabase: SupabaseClient;

  constructor(configProvider: ConfigProvider) {
    const config = configProvider.getSupabaseConfig();
    this.supabase = config.serviceRoleKey
      ? SupabaseClientFactory.createAdminClient(config)
      : SupabaseClientFactory.createClient(config);
  }

  // Page management
  async createPage(page: CreatePageInput) { /* ... */ }
  async getPageBySlug(slug: string) { /* ... */ }
  async updatePage(id: string, updates: UpdatePageInput) { /* ... */ }
  async deletePage(id: string) { /* ... */ }
  async listPages(options: PageListOptions) { /* ... */ }
  async reorderPages(pageIds: string[]) { /* ... */ }

  // Block management (reusable across pages)
  async createBlock(block: CreateBlockInput) { /* ... */ }
  async updateBlock(id: string, updates: UpdateBlockInput) { /* ... */ }
  async deleteBlock(id: string) { /* ... */ }
  async getBlockById(id: string) { /* ... */ }
  async listBlocks(options: BlockListOptions) { /* ... */ }

  // Page-block relationships
  async addBlockToPage(pageId: string, blockId: string, sortOrder: number) { /* ... */ }
  async removeBlockFromPage(pageId: string, blockId: string) { /* ... */ }
  async reorderPageBlocks(pageId: string, blockIds: string[]) { /* ... */ }
  async moveBlockToPage(blockId: string, fromPageId: string, toPageId: string, newSortOrder: number) { /* ... */ }
  async getPageBlocks(pageId: string) { /* ... */ }
  async getBlockPages(blockId: string) { /* ... */ }

  // Asset management
  async uploadAsset(file: File) { /* ... */ }
  async deleteAsset(id: string) { /* ... */ }
  async listAssets() { /* ... */ }
  async getAssetById(id: string) { /* ... */ }
}
```

### 3. **Admin Interface Components**

Extend your existing admin system with comprehensive content management:

```typescript
// src/components/admin/PagesManager.tsx
export default function PagesManager() {
  // Page list with drag & drop reordering
  // Create new page with layout selection
  // Edit page metadata (title, slug, layout, properties)
  // Page preview and publish/unpublish
  // Delete pages with confirmation
}

// src/components/admin/PageEditor.tsx
export default function PageEditor({ pageId }: { pageId: string }) {
  // Layout selector (dropdown with preview)
  // Page properties editor (SEO, styling, features)
  // Block management interface
  // Drag & drop block reordering
  // Add existing blocks to page
  // Create new blocks
  // Live preview of page content
  // Save/publish controls
}

// src/components/admin/BlocksManager.tsx
export default function BlocksManager() {
  // Block library with search/filter
  // Create new blocks
  // Edit existing blocks
  // Block usage tracking (which pages use each block)
  // Duplicate blocks
  // Delete blocks (with usage warnings)
}

// src/components/admin/BlockEditor.tsx
export default function BlockEditor({ 
  blockId 
}: { 
  blockId: string;
}) {
  // Block type selector
  // Content editor based on block type
  // Markdown editor with live preview
  // Image upload and selection
  // Carousel configuration
  // Column content editor
  // Block metadata editing
  // Block usage display
}

// src/components/admin/PageBlockManager.tsx
export default function PageBlockManager({ 
  pageId 
}: { 
  pageId: string;
}) {
  // List blocks on current page
  // Drag & drop reordering
  // Add existing blocks to page
  // Remove blocks from page
  // Move blocks between pages
  // Create new blocks
}

// src/components/admin/LayoutSelector.tsx
export default function LayoutSelector({ 
  currentLayout, 
  onLayoutChange 
}: { 
  currentLayout: PageLayout;
  onLayoutChange: (layout: PageLayout) => void;
}) {
  // Visual layout previews
  // Layout descriptions
  // Layout-specific configuration options
}

// src/components/admin/AssetManager.tsx
export default function AssetManager() {
  // File upload with drag & drop
  // Asset gallery with search/filter
  // Asset details and metadata editing (stored in JSONB)
  // Image optimization controls
  // Asset usage tracking
}

// src/components/admin/ContentPreview.tsx
export default function ContentPreview({ 
  pageId, 
  layout 
}: { 
  pageId: string;
  layout: PageLayout;
}) {
  // Real-time preview of page content
  // Layout-specific rendering
  // Mobile/desktop preview modes
  // Preview controls (refresh, fullscreen)
}
```

### 4. **Content Rendering System**

Create a flexible content rendering system that supports all layout types:

```typescript
// src/components/ContentRenderer.tsx
export function ContentRenderer({ slug }: { slug: string }) {
  // Fetch page and its blocks from Supabase
  // Render based on page layout
  // Handle all block types and layouts
  // Apply consistent styling
}

// src/components/layouts/SingleColumnLayout.tsx
export function SingleColumnLayout({ 
  page, 
  blocks 
}: { 
  page: ContentPage;
  blocks: ContentBlock[];
}) {
  // Render blocks in single column
  // Handle markdown, images, carousels, columns
  // Apply page properties (styling, etc.)
}

// src/components/layouts/PicAboveMarkdownBelowLayout.tsx
export function PicAboveMarkdownBelowLayout({ 
  page, 
  blocks 
}: { 
  page: ContentPage;
  blocks: ContentBlock[];
}) {
  // Find image block and content blocks
  // Image at top, markdown content below
  // Responsive image handling
}

// src/components/layouts/PicLeftMarkdownRightLayout.tsx
export function PicLeftMarkdownRightLayout({ 
  page, 
  blocks 
}: { 
  page: ContentPage;
  blocks: ContentBlock[];
}) {
  // Find image block and content blocks
  // Side-by-side layout
  // Responsive behavior (stack on mobile)
}

// src/components/layouts/PicRightMarkdownLeftLayout.tsx
export function PicRightMarkdownLeftLayout({ 
  page, 
  blocks 
}: { 
  page: ContentPage;
  blocks: ContentBlock[];
}) {
  // Find image block and content blocks
  // Side-by-side layout (reversed)
  // Responsive behavior (stack on mobile)
}

// src/components/layouts/ImageCarouselLayout.tsx
export function ImageCarouselLayout({ 
  page, 
  blocks 
}: { 
  page: ContentPage;
  blocks: ContentBlock[];
}) {
  // Find carousel block
  // Carousel with navigation
  // Image metadata display
  // Responsive carousel behavior
}

// src/components/layouts/TwoColumnsLayout.tsx
export function TwoColumnsLayout({ 
  page, 
  blocks 
}: { 
  page: ContentPage;
  blocks: ContentBlock[];
}) {
  // Find column blocks
  // Two-column responsive layout
  // Column content management
  // Mobile stacking
}

// src/components/layouts/ThreeColumnsLayout.tsx
export function ThreeColumnsLayout({ 
  page, 
  blocks 
}: { 
  page: ContentPage;
  blocks: ContentBlock[];
}) {
  // Find column blocks
  // Three-column responsive layout
  // Column content management
  // Mobile stacking
}

// src/components/blocks/MarkdownBlock.tsx
export function MarkdownBlock({ block }: { block: ContentBlock }) {
  return (
    <div className="prose prose-lg max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {block.content.content || ''}
      </ReactMarkdown>
    </div>
  );
}

// src/components/blocks/ImageBlock.tsx
export function ImageBlock({ block }: { block: ContentBlock }) {
  // Use image data from JSONB content
  // Responsive image with alt text
  // Image optimization
  // Click to enlarge functionality
}

// src/components/blocks/CarouselBlock.tsx
export function CarouselBlock({ block }: { block: ContentBlock }) {
  // Use carousel data from JSONB content
  // Image carousel with navigation
  // Caption and link support
  // Touch/swipe support
}

// src/components/blocks/ColumnContentBlock.tsx
export function ColumnContentBlock({ 
  block 
}: { 
  block: ContentBlock;
}) {
  // Use column data from JSONB content
  // Column-specific content rendering
  // Markdown and image support
  // Responsive column behavior
}
```

### 5. **Dynamic Content Integration**

Replace hardcoded content in your components with dynamic content management:

```typescript
// src/hooks/useContent.ts
export function useContent(slug: string) {
  const [page, setPage] = useState<ContentPage | null>(null);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch page and its blocks from Supabase
    // Handle loading states and errors
  }, [slug]);

  return { page, blocks, loading, error };
}

// src/hooks/usePageList.ts
export function usePageList() {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all published pages
    // Handle sorting and filtering
  }, []);

  return { pages, loading };
}

// src/hooks/useBlocks.ts
export function useBlocks() {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all blocks
    // Handle sorting and filtering
  }, []);

  return { blocks, loading };
}

// Updated HomePage.tsx
export default function HomePage() {
  const { page, blocks, loading, error } = useContent('home-page');
  
  if (loading) return <LoadingScreen />;
  if (error) return <div>Error loading content: {error}</div>;
  if (!page) return <div>Page not found</div>;
  
  return (
    <Layout>
      <ContentRenderer slug="home-page" />
    </Layout>
  );
}

// New dynamic page component
export default function DynamicPage({ slug }: { slug: string }) {
  const { page, blocks, loading, error } = useContent(slug);
  
  if (loading) return <LoadingScreen />;
  if (error) return <div>Error loading content: {error}</div>;
  if (!page) return <div>Page not found</div>;
  
  return (
    <Layout>
      <ContentRenderer slug={slug} />
    </Layout>
  );
}
```

### 6. **Asset Management Strategy**

For assets, I recommend:

1. **Supabase Storage** for file storage
2. **CDN integration** for performance
3. **Image optimization** with Supabase's built-in transforms
4. **Asset metadata** tracking in your database

### 7. **Page Layout System**

The system supports predefined layouts that users can choose from:

```typescript
export type PageLayout = 
  | 'single_column'              // Basic single column layout
  | 'pic_above_markdown_below'   // Image above, markdown content below
  | 'pic_left_markdown_right'    // Image on left, markdown on right
  | 'pic_right_markdown_left'    // Image on right, markdown on left
  | 'image_carousel'             // Array of images with metadata for carousel
  | 'two_columns'                // Two columns with content lists
  | 'three_columns'              // Three columns with content lists
  // Additional layouts can be added later
```

### 8. **Content Management Features**

The system provides comprehensive content management capabilities:

- **Page Creation**: Users can create new pages with custom slugs and titles
- **Layout Selection**: Choose from predefined layouts with visual previews
- **Content Blocks**: Add and manage different types of content blocks
- **Content Movement**: Move content blocks between pages and control order
- **Drag & Drop**: Intuitive drag-and-drop interface for reordering
- **Live Preview**: Real-time preview of content changes
- **Asset Management**: Upload, organize, and manage images and files
- **Publishing Control**: Draft/publish workflow for content

### 9. **Implementation Benefits**

This improved approach provides:

- ✅ **Reusable blocks**: Content blocks can be used across multiple pages
- ✅ **Content mobility**: Move entire sections between pages easily
- ✅ **Flexible schema**: 3 tables (pages, blocks, page_blocks) with JSONB storage
- ✅ **Easy maintenance**: Simple relationships with JSONB flexibility
- ✅ **Admin-friendly**: Non-technical users can edit content
- ✅ **Flexible layouts**: Predefined layouts with easy customization
- ✅ **Block library**: Create and manage reusable content blocks
- ✅ **Version control**: Track content changes and history
- ✅ **Performance**: Cached content with Supabase
- ✅ **Extensibility**: Easy to add new layout types and content structures
- ✅ **SEO-friendly**: Server-side rendering support
- ✅ **Asset management**: Centralized file handling with optimization
- ✅ **User experience**: Intuitive drag-and-drop interface
- ✅ **Type safety**: Full TypeScript support for all content structures

### 10. **Migration Strategy**

1. **Phase 1**: Set up database schema (3 tables: pages, blocks, page_blocks + assets)
2. **Phase 2**: Create ContentManager service with block and page operations
3. **Phase 3**: Build admin interface components (PagesManager, BlocksManager, PageEditor)
4. **Phase 4**: Implement layout rendering components for all layout types
5. **Phase 5**: Replace hardcoded content with dynamic content system
6. **Phase 6**: Add asset management and optimization features
7. **Phase 7**: Implement advanced features (preview, drafts, content movement)
8. **Phase 8**: Add new layout types and content structures as needed

### 11. **Key Features Summary**

- **Reusable Blocks**: Content blocks can be used across multiple pages
- **Page Management**: Create, edit, delete, and reorder pages
- **Block Library**: Create and manage reusable content blocks
- **Layout System**: 7 predefined layouts with visual previews
- **Content Movement**: Move blocks between pages with drag & drop
- **Block Reusability**: Use the same content block on multiple pages
- **Asset Management**: Upload, organize, and optimize images with metadata
- **Live Preview**: Real-time preview of content changes
- **Publishing Control**: Draft/publish workflow
- **Responsive Design**: All layouts work on mobile and desktop
- **Type Safety**: Full TypeScript support for all content structures
- **Extensibility**: Easy to add new layout types and content structures
- **Easy Maintenance**: Simple relationships with JSONB flexibility

### 12. **Database Structure Example**

**Page Properties (JSONB in content_pages.properties):**
```json
{
  "seo": {
    "title": "Welcome to Aztec Citizens Revival",
    "description": "Three days of neighbors, music, and local flavor",
    "keywords": ["aztec", "new mexico", "community", "festival"]
  },
  "styling": {
    "background_color": "#f8fafc",
    "text_color": "#1f2937",
    "custom_css": ".hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }"
  },
  "features": {
    "show_comments": true,
    "show_sharing": true,
    "show_related": false
  }
}
```

**Block Content (JSONB in content_blocks.content):**
```json
{
  "content": "# Welcome to our site\n\nThis is some markdown content.",
  "layout": {
    "width": "100%",
    "alignment": "center",
    "padding": "2rem",
    "margin": "1rem 0"
  }
}
```

**Image Block Content:**
```json
{
  "image": {
    "url": "/assets/image.jpg",
    "alt": "Description",
    "caption": "Image caption",
    "link": "https://example.com",
    "metadata": {
      "width": 800,
      "height": 600,
      "format": "jpeg"
    }
  },
  "layout": {
    "width": "50%",
    "alignment": "left"
  }
}
```

**Carousel Block Content:**
```json
{
  "carousel": {
    "images": [
      {
        "url": "/assets/img1.jpg",
        "alt": "Image 1",
        "caption": "Caption 1",
        "link": "https://example.com/1"
      },
      {
        "url": "/assets/img2.jpg", 
        "alt": "Image 2",
        "caption": "Caption 2",
        "link": "https://example.com/2"
      }
    ],
    "autoplay": true,
    "interval": 5000,
    "show_indicators": true,
    "show_navigation": true,
    "transition": "slide"
  }
}
```

This structure allows for:
- **Reusable blocks** across multiple pages
- **Flexible content** with layout properties
- **Easy content movement** between pages
- **Type-safe** content management
- **Extensible** content structures

Would you like me to start implementing any specific part of this strategy? I can begin with the database schema, the content management service, or the admin interface components.