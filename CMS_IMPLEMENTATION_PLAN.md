# CMS Implementation Plan

## Overview
Implement the CMS system specified in `cms_full_requirements.md`, focusing on the admin portal first, then replacing public pages with the CMS rendering system.

## Implementation Order

### Phase 1: Asset Management
Build the asset management system incrementally:

#### 1.1 Asset Upload (Basic) ✅ COMPLETED
- [x] Create asset upload UI in `CmsAssets.tsx`
- [x] Implement file selection, drag-and-drop
- [x] Upload to Supabase Storage
- [x] Create asset and asset_version records
- [x] Display uploaded assets in a grid/list view
- [x] Files: `src/admin/cms/CmsAssets.tsx`, `src/lib/cms/client.ts`
- [x] **COMMITTED**: 640b92f - feat(cms): Phase 1.1: Asset Upload (Basic)

#### 1.2 Asset Variants Generation 🔄 IN PROGRESS
- [ ] Implement automatic variant generation for images
- [ ] Create `asset_variant` table entries (thumbnails, small, medium, large)
- [ ] Use Supabase Edge Function or client-side processing
- [ ] Update asset display to use variants
- [ ] Files: `supabase/functions/process-asset/*`, `src/lib/cms/client.ts`

#### 1.3 Asset Optimization
- [ ] Add image compression during upload
- [ ] Implement WebP conversion
- [ ] Add file size limits and validation
- [ ] Display file sizes and optimization stats
- [ ] Files: `src/lib/cms/imageProcessing.ts`, `src/admin/cms/CmsAssets.tsx`

#### 1.4 Asset Editing
- [ ] Add basic image editing UI (crop, resize, rotate)
- [ ] Store edit operations in `asset_version.edit_operation`
- [ ] Create new asset versions for edits
- [ ] Preview edited assets before saving
- [ ] Files: `src/admin/cms/components/AssetEditor.tsx`

### Phase 2: Pages Management
Build the page management system:

#### 2.1 Page List & CRUD
- [ ] Display pages in a table with filters (status, system pages, slug search)
- [ ] Create "New Page" form (slug, system_key, is_system flag)
- [ ] Implement edit/delete operations
- [ ] Show page versions count
- [ ] Files: `src/admin/cms/CmsPages.tsx`, `src/admin/cms/components/PageList.tsx`

#### 2.2 Page Version Editor
- [ ] Create page version editor UI
- [ ] Support i18n title editing (JSON structure)
- [ ] Layout variant selector
- [ ] SEO metadata editor (title, description, keywords)
- [ ] Nav hints editor
- [ ] Files: `src/admin/cms/components/PageEditor.tsx`, `src/admin/cms/components/PageMetadataEditor.tsx`

#### 2.3 Page Slots System
- [ ] Implement slot management UI
- [ ] Add blocks to page slots with drag-and-drop ordering
- [ ] Configure block instances (follow_latest vs pinned version)
- [ ] Instance props override editor
- [ ] Files: `src/admin/cms/components/PageSlotEditor.tsx`, `src/admin/cms/components/BlockInstanceConfig.tsx`

#### 2.4 Page Version History
- [ ] Display all versions of a page
- [ ] Show version diff/comparison
- [ ] Restore previous versions (creates new version)
- [ ] Files: `src/admin/cms/components/PageVersionHistory.tsx`

### Phase 3: Blocks Management
Build reusable content blocks:

#### 3.1 Block List & CRUD
- [ ] Display blocks with filtering (type, tag, system blocks)
- [ ] Create "New Block" form (type, tag, system_key)
- [ ] Implement edit/delete operations
- [ ] Show usage count (where block is used)
- [ ] Files: `src/admin/cms/CmsBlocks.tsx`, `src/admin/cms/components/BlockList.tsx`

#### 3.2 Block Version Editor
- [ ] Create block version editor
- [ ] Layout variant selector
- [ ] Content editor (JSON structure, i18n support)
- [ ] Asset reference management
- [ ] Files: `src/admin/cms/components/BlockEditor.tsx`, `src/admin/cms/components/BlockContentEditor.tsx`

#### 3.3 Block Types & Templates
- [ ] Define common block types (hero, features, CTA, text, image-text)
- [ ] Create type-specific content schemas
- [ ] Build visual block previews
- [ ] Files: `src/lib/cms/blockTypes.ts`, `src/admin/cms/components/BlockPreview.tsx`

#### 3.4 Block Asset Management
- [ ] Link assets to blocks with roles (hero_image, thumbnail, gallery)
- [ ] Asset picker component
- [ ] Display linked assets
- [ ] Files: `src/admin/cms/components/AssetPicker.tsx`

### Phase 4: Menus Management
Build navigation menu system:

#### 4.1 Menu List & Basic CRUD
- [ ] Display menus with site filtering
- [ ] Create menu (handle, label, system_key)
- [ ] Edit/delete menus
- [ ] Files: `src/admin/cms/CmsMenus.tsx`, `src/admin/cms/components/MenuList.tsx`

#### 4.2 Simple Menu Editor
- [ ] Menu item tree editor
- [ ] Add/edit/delete menu items
- [ ] Support types: page, external, anchor, separator, group
- [ ] Configure label, target, rel attributes
- [ ] Files: `src/admin/cms/components/MenuEditor.tsx`, `src/admin/cms/components/MenuItemEditor.tsx`

#### 4.3 Menu Item Visibility
- [ ] Configure visibility rules (device, audience, feature flags, schedule)
- [ ] Badge configuration
- [ ] Style hints
- [ ] Files: `src/admin/cms/components/MenuItemVisibilityEditor.tsx`

#### 4.4 Menu Rules (Optional/Future)
- [ ] Dynamic menu item generation based on rules
- [ ] Auto-include pages by path prefix, tag, section
- [ ] Sorting and capping options
- [ ] Files: `src/admin/cms/components/MenuRuleEditor.tsx` (skip for now, implement if needed)

### Phase 5: Publishing Workflow
Implement versioning and publishing:

#### 5.1 Version Management UI
- [ ] Create new versions for pages/blocks/menus
- [ ] Version selector dropdown
- [ ] Status badges (draft, published, archived)
- [ ] Files: `src/admin/cms/components/VersionSelector.tsx`

#### 5.2 Publish/Unpublish Operations
- [ ] Publish button with confirmation
- [ ] Update publish tables (page_publish, block_publish, menu_publish)
- [ ] Unpublish operation
- [ ] Show publish status and timestamp
- [ ] Files: Add to existing editors

#### 5.3 Audit Logging
- [ ] Log all CMS operations using `log_cms_audit` function
- [ ] Display audit log in CmsAudit page
- [ ] Filter by entity type, entity ID, user, date
- [ ] Files: `src/admin/cms/CmsAudit.tsx`, `src/admin/cms/components/AuditLogTable.tsx`

#### 5.4 Permissions Integration
- [ ] Check permissions before operations (cms:page:create, cms:block:edit, etc.)
- [ ] Display permission errors
- [ ] Manage user permissions in CmsUsers
- [ ] Files: `src/admin/cms/CmsUsers.tsx`, update existing components

### Phase 6: Supabase Edge Functions
Create resolution functions for published content:

#### 6.1 Resolve Page Function
- [ ] Implement `resolvePage` Edge Function per requirements spec
- [ ] Fetch published page with all referenced blocks and assets
- [ ] Return hydrated ResolvedPage JSON
- [ ] Files: `supabase/functions/resolvePage/index.ts`

#### 6.2 Resolve Menu Function
- [ ] Implement `resolveMenu` Edge Function per requirements spec
- [ ] Fetch published menu with item tree
- [ ] Resolve page references
- [ ] Files: `supabase/functions/resolveMenu/index.ts`

#### 6.3 Client-side Resolution (Alternative)
- [ ] Implement client-side resolution functions for preview mode
- [ ] Use same logic as Edge Functions but run in browser
- [ ] Files: `src/lib/cms/resolver.ts`

### Phase 7: Public Page Rendering System
Replace hardcoded pages with CMS-driven rendering:

#### 7.1 Dynamic Page Renderer
- [ ] Create `CmsPage` component that fetches and renders resolved pages
- [ ] Slot renderer that maps slots to component areas
- [ ] Block renderer that maps block types to React components
- [ ] Files: `src/public/CmsPage.tsx`, `src/public/renderers/SlotRenderer.tsx`, `src/public/renderers/BlockRenderer.tsx`

#### 7.2 Block Component Library
- [ ] Build React components for each block type
- [ ] Map block type strings to components
- [ ] Handle block content and assets
- [ ] Files: `src/public/blocks/HeroBlock.tsx`, `src/public/blocks/FeaturesBlock.tsx`, etc.

#### 7.3 Menu Renderer
- [ ] Create `CmsMenu` component for rendering resolved menus
- [ ] Handle nested menu items
- [ ] Implement visibility filtering client-side
- [ ] Files: `src/shell/CmsMenu.tsx`

#### 7.4 Migration of Existing Pages
- [ ] Migrate HomePage content to CMS
- [ ] Create corresponding blocks for existing sections
- [ ] Set up system pages with system_key
- [ ] Update routes to use CMS rendering
- [ ] Files: Update `src/App.tsx`, migrate content via admin UI or migration script

#### 7.5 SEO & Metadata
- [ ] Render SEO tags from page metadata
- [ ] OpenGraph tags
- [ ] Structured data (JSON-LD)
- [ ] Files: `src/public/components/PageHead.tsx`

## Success Criteria
- ✅ Can upload, organize, and manage assets with variants
- ✅ Can create, edit, version, and publish pages
- ✅ Can create reusable blocks and reference them in pages
- ✅ Can build navigation menus with various item types
- ✅ All operations are audited and permission-controlled
- ✅ Published content is resolved via Edge Functions
- ✅ Public site renders CMS content dynamically
- ✅ Existing pages migrated to CMS without losing functionality

## Notes
- Work incrementally, testing each feature before moving to the next
- Focus on admin portal (Phases 1-5) before public rendering (Phase 7)
- Supabase Edge Functions (Phase 6) can be developed in parallel with Phase 7
- Keep simple menu editor, expand to rules only if needed
- All changes should maintain existing analytics and lead capture functionality

## Testing Workflow
After each implementation step:
1. Kill all Vite servers: `pkill -f "vite" && npm run db:stop`
2. Redeploy Supabase: `npm run db:reset` (if needed) or `npm run db:generate`
3. Start development server: `npm start`
4. Test the implemented feature
5. Commit changes to git
6. Move to next step

## Current Status
- ✅ **Phase 1.1**: Asset Upload (Basic) - COMPLETED
- 🔄 **Phase 1.2**: Asset Variants Generation - IN PROGRESS
- ⏳ **Phase 1.3**: Asset Optimization - PENDING
- ⏳ **Phase 1.4**: Asset Editing - PENDING
