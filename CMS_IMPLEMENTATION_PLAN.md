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

#### 1.2 Asset Variants Generation ✅ COMPLETED
- [x] Implement automatic variant generation for images
- [x] Create `asset_variant` table entries (thumbnails, small, medium, large)
- [x] Use Supabase Edge Function (preferred) or client-side processing
- [x] Update asset display to use variants
- [x] Files: `supabase/functions/process-asset-variants/*`, `src/lib/cms/client.ts`, `src/admin/cms/AssetDetails.tsx`
- [x] **COMMITTED**: a8a2e53 - feat(cms): Phase 1.2: Asset Variants Generation

#### 1.3 Asset Optimization ✅ COMPLETED
- [x] Add image compression during upload (85% quality, max 5MB)
- [x] Add file size limits and validation (50MB max per file)
- [x] Display file sizes and optimization stats
- [x] Generate JPEG variants (thumbnail, small, medium, large)
- [ ] Implement WebP conversion (deferred - imagescript doesn't support WebP encoding or decoding in Deno)
- [x] Files: `src/admin/cms/UploadDialog.tsx`, `supabase/functions/process-asset-variants/index.ts`, `src/admin/cms/AssetDetails.tsx`
- [x] **COMMITTED**: 4831c5e - feat(cms): Phase 1.3: Asset Optimization
- [x] **COMMITTED**: 4f3cf94 - fix(cms): Remove WebP encoding (not supported)
- [x] **COMMITTED**: 3ef23be - docs: Update Phase 1.3 to reflect WebP deferral
- [x] **COMMITTED**: e572129 - feat(cms): Implement client-side WebP conversion (reverted)

**Note on WebP**: WebP conversion was attempted but is not supported by the `imagescript@1.2.15` library used in Deno Edge Functions. The library cannot encode OR decode WebP format. Alternative approaches would require:
- Using a different image processing library (e.g., `wasm-imagemagick` or `sharp` via Node.js)
- Server-side processing with a different runtime
- Client-side only approach (original as WebP, but no variants possible)

For now, JPEG compression provides excellent results (30-40% size reduction) and maintains full compatibility with variant generation.

#### 1.4 Asset Editing ✅ COMPLETED
- [x] Add basic image editing UI (crop, resize, rotate)
- [x] Store edit operations in `asset_version.edit_operation`
- [x] Create new asset versions for edits (as new assets with edit_operation metadata)
- [x] Preview edited assets before saving
- [x] Reset the Database locally, Deploy all edge functions locally
- [x] Files: `src/admin/cms/components/AssetEditor.tsx`, `src/lib/cms/client.ts`, `src/lib/cms/hooks.ts`
- [x] **COMMITTED**: 4a1530f - feat(cms): Phase 1.4: Asset Editing - Complete implementation

### Phase 2: Pages Management
Build the page management system:

#### 2.1 Page List & CRUD ✅ COMPLETED
- [x] Display pages in a table with filters (status, system pages, slug search)
- [x] Create "New Page" form (slug, system_key, is_system flag)
- [x] Implement edit/delete operations
- [x] Show page versions count (placeholder for now, will be implemented with version history)
- [x] Files: `src/admin/cms/CmsPages.tsx` (integrated dialogs)
- [x] **COMMITTED**: (pending deployment)

#### 2.2 Page Version Editor ✅ COMPLETED
- [x] Create page version editor UI
- [x] Support i18n title editing (JSON structure)
- [x] Layout variant selector
- [x] SEO metadata editor (title, description, keywords)
- [x] Nav hints editor
- [x] Files: `src/admin/cms/PageVersionEditor.tsx`, `src/admin/cms/CmsPages.tsx`, `src/lib/cms/hooks.ts`
- [x] **COMMITTED**: 5ef5c94 - feat(cms): Phase 2.2: Page Version Editor - Complete implementation

#### 2.3 Page Slots System ✅ COMPLETED
- [x] Implement slot management UI
- [x] Add blocks to page slots with drag-and-drop ordering
- [x] Configure block instances (follow_latest vs pinned version)
- [x] Instance props override editor
- [x] Files: `src/admin/cms/components/PageSlotEditor.tsx`, `src/admin/cms/components/BlockInstanceConfig.tsx`
- [x] **COMMITTED**: feat(cms): Phase 2.3: Page Slots System - Complete implementation with drag-and-drop, UUID validation, and utility functions

#### 2.4 Page Version History ✅ COMPLETED
- [x] Display all versions of a page
- [x] Show version diff/comparison
- [x] Restore previous versions (creates new version)
- [x] Files: `src/admin/cms/components/PageVersionHistory.tsx`
- [x] **COMMITTED**: feat(cms): Phase 2.4: Page Version History - Complete implementation with diff comparison and restore functionality

### Phase 3: Blocks Management
Build reusable content blocks:

#### 3.1 Block List & CRUD ✅ COMPLETED
- [x] Display blocks with filtering (type, tag, system blocks)
- [x] Create "New Block" form (type, tag, system_key)
- [x] Implement edit/delete operations
- [x] Show usage count (where block is used)
- [x] Files: `src/admin/cms/CmsBlocks.tsx`, `src/admin/cms/components/BlockList.tsx`

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

### Phase 6: Testing Infrastructure
Set up comprehensive unit testing for all CMS logic:

#### 6.1 Testing Setup
- [ ] Install testing dependencies (Vitest, @testing-library/react, msw)
- [ ] Configure test environment and mocking
- [ ] Set up test database and fixtures
- [ ] Create test utilities and helpers
- [ ] Files: `vitest.config.ts`, `src/__tests__/setup.ts`, `src/__tests__/utils/`

#### 6.2 Schema Testing
- [ ] Test all Zod schemas with valid/invalid data
- [ ] Test edge cases (null, undefined, empty strings, invalid types)
- [ ] Test schema transformations and validations
- [ ] Test type inference and compatibility
- [ ] Files: `src/__tests__/schemas/`

#### 6.3 Client Function Testing
- [ ] Test all client functions with mocked Supabase
- [ ] Test error handling and edge cases
- [ ] Test data transformation and validation
- [ ] Test authentication and permissions
- [ ] Files: `src/__tests__/client/`

#### 6.4 Hook Testing
- [ ] Test all custom hooks with mocked dependencies
- [ ] Test state management and side effects
- [ ] Test error states and loading states
- [ ] Test hook composition and reusability
- [ ] Files: `src/__tests__/hooks/`

#### 6.5 Context Testing
- [ ] Test all context providers with mocked state
- [ ] Test context value updates and propagation
- [ ] Test context composition and nesting
- [ ] Test context error handling
- [ ] Files: `src/__tests__/contexts/`

#### 6.6 Utility Function Testing
- [ ] Test all utility functions with various inputs
- [ ] Test data transformation and validation
- [ ] Test edge cases and error conditions
- [ ] Test function composition and reusability
- [ ] Files: `src/__tests__/utils/`

#### 6.7 Retrofit Existing Code Tests
- [ ] Add tests for existing client functions (`src/lib/cms/client.ts`)
- [ ] Add tests for existing hooks (`src/lib/cms/hooks.ts`)
- [ ] Add tests for existing schemas (`src/lib/cms/schemas.ts`)
- [ ] Add tests for existing utility functions (`src/lib/cms/utils.ts`)
- [ ] Refactor existing code to be more testable (dependency injection)
- [ ] Files: `src/__tests__/retrofit/`

#### 6.8 Refactoring for Testability
- [ ] Create `SupabaseClient` interface for dependency injection
- [ ] Refactor client functions to accept client as parameter
- [ ] Create factory functions for client creation
- [ ] Add error handling interfaces and implementations
- [ ] Create validation service interfaces
- [ ] Files: `src/lib/cms/interfaces/`, `src/lib/cms/services/`

### Phase 7: Supabase Edge Functions
Create resolution functions for published content:

#### 7.1 Resolve Page Function
- [ ] Implement `resolvePage` Edge Function per requirements spec
- [ ] Fetch published page with all referenced blocks and assets
- [ ] Return hydrated ResolvedPage JSON
- [ ] Files: `supabase/functions/resolvePage/index.ts`

#### 7.2 Resolve Menu Function
- [ ] Implement `resolveMenu` Edge Function per requirements spec
- [ ] Fetch published menu with item tree
- [ ] Resolve page references
- [ ] Files: `supabase/functions/resolveMenu/index.ts`

#### 7.3 Client-side Resolution (Alternative)
- [ ] Implement client-side resolution functions for preview mode
- [ ] Use same logic as Edge Functions but run in browser
- [ ] Files: `src/lib/cms/resolver.ts`

### Phase 8: Public Page Rendering System
Replace hardcoded pages with CMS-driven rendering:

#### 8.1 Dynamic Page Renderer
- [ ] Create `CmsPage` component that fetches and renders resolved pages
- [ ] Slot renderer that maps slots to component areas
- [ ] Block renderer that maps block types to React components
- [ ] Files: `src/public/CmsPage.tsx`, `src/public/renderers/SlotRenderer.tsx`, `src/public/renderers/BlockRenderer.tsx`

#### 8.2 Block Component Library
- [ ] Build React components for each block type
- [ ] Map block type strings to components
- [ ] Handle block content and assets
- [ ] Files: `src/public/blocks/HeroBlock.tsx`, `src/public/blocks/FeaturesBlock.tsx`, etc.

#### 8.3 Menu Renderer
- [ ] Create `CmsMenu` component for rendering resolved menus
- [ ] Handle nested menu items
- [ ] Implement visibility filtering client-side
- [ ] Files: `src/shell/CmsMenu.tsx`

#### 8.4 Migration of Existing Pages
- [ ] Migrate HomePage content to CMS
- [ ] Create corresponding blocks for existing sections
- [ ] Set up system pages with system_key
- [ ] Update routes to use CMS rendering
- [ ] Files: Update `src/App.tsx`, migrate content via admin UI or migration script

#### 8.5 SEO & Metadata
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

## Architecture Principles

### Composable Design
- **Dependency Injection**: Use constructor injection and factory patterns
- **Pure Functions**: Prefer pure functions over class methods
- **Interface Segregation**: Create focused, single-purpose interfaces
- **Composition over Inheritance**: Use composition and mixins
- **Testable Dependencies**: All external dependencies should be mockable

### Code Organization
- **Separation of Concerns**: Business logic separate from UI logic
- **Single Responsibility**: Each function/class has one clear purpose
- **Open/Closed Principle**: Open for extension, closed for modification
- **Interface Contracts**: Define clear contracts between layers
- **Error Boundaries**: Isolate error handling and recovery

### Testing Strategy
- **Test-First Development**: Write tests before implementing features
- **Mock External Dependencies**: Mock Supabase, APIs, and external services
- **Test Edge Cases**: Test null, undefined, empty, and invalid inputs
- **Schema Validation**: Test all Zod schemas with comprehensive test data
- **Type Safety**: Test TypeScript interfaces and type guards

## Notes
- Work incrementally, testing each feature before moving to the next
- Focus on admin portal (Phases 1-5) before public rendering (Phase 8)
- Testing infrastructure (Phase 6) should be implemented early
- Supabase Edge Functions (Phase 7) can be developed in parallel with Phase 8
- Keep simple menu editor, expand to rules only if needed
- All changes should maintain existing analytics and lead capture functionality
- All progress should be tracked in this document
- Ensure all code follows the rules of React; especially hooks
- Ensure all Supabase features are re-deployed locally after each phase completion; never remotely
- Ensure there are no console errors before completion

### Testing Workflow
After each implementation step:
1. Write unit tests for new logic
2. Run tests: `npm test`
3. Implement feature with test-first approach
4. Kill all Vite servers: `pkill -f "vite" && npm run db:stop`
5. Redeploy Supabase: `npm run db:reset` (if needed) or `npm run db:generate`
6. Start development server: `npm start`
7. Test the implemented feature
8. Commit changes to git
9. Move to next step

## Current Status
- ✅ **Phase 1.1**: Asset Upload (Basic) - COMPLETED
- ✅ **Phase 1.2**: Asset Variants Generation - COMPLETED
- ✅ **Phase 1.3**: Asset Optimization - COMPLETED
- ✅ **Phase 1.4**: Asset Editing - COMPLETED
- ✅ **Phase 2.1**: Page List & CRUD - COMPLETED
- ✅ **Phase 2.2**: Page Version Editor - COMPLETED
- ✅ **Phase 2.3**: Page Slots System - COMPLETED
- ✅ **Phase 2.4**: Page Version History - COMPLETED
- ✅ **Phase 3.1**: Block List & CRUD - COMPLETED
- ⏳ **Phase 6**: Testing Infrastructure - IN PROGRESS
