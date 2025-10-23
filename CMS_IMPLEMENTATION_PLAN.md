# CMS Implementation Plan

## Overview
Implement the CMS system specified in `cms_full_requirements.md`, focusing on the admin portal first, then replacing public pages with the CMS rendering system.

## Implementation Order

## 🎯 Priority Focus: Admin Portal & Backend
**Current Priority**: Complete all admin portal, database, and backend functionality before moving to public rendering.

**Completed Admin/Backend Phases:**
- ✅ **Phase 1-6**: Asset Management, Pages, Blocks, Menus, Publishing, Testing - COMPLETED
- ✅ **Phase 7**: Supabase Edge Functions - COMPLETED
- 🔄 **Phase 10**: Database Object Organization - IN PROGRESS (Schema created, client functions and hooks implemented)

**Deferred Phases (Public Rendering):**
- ⏸️ **Phase 8**: Public Page Rendering System - DEFERRED
- ⏸️ **Phase 9**: Cohesive Editor Implementation - DEFERRED

## 📊 Implementation Progress Summary

### ✅ COMPLETED (8/10 Phases - 80% Complete)
**Admin Portal & Backend:**
- **Phase 1**: Asset Management (4/4 sub-phases) - Upload, variants, optimization, editing
- **Phase 2**: Pages Management (4/4 sub-phases) - CRUD, versioning, slots, history
- **Phase 3**: Blocks Management (4/4 sub-phases) - CRUD, versioning, types, asset management
- **Phase 4**: Menus Management (4/4 sub-phases) - CRUD, editing, visibility, publishing
- **Phase 5**: Publishing Workflow (6/6 sub-phases) - Versioning, individual publishing, hybrid staging, audit logging, permissions
- **Phase 6**: Testing Infrastructure (8/8 sub-phases) - Comprehensive unit testing, mocking, testability refactoring
- **Phase 7**: Supabase Edge Functions (3/3 sub-phases) - resolvePage, resolveMenu, client-side resolution
- **Phase 10**: Database Object Organization (6/6 sub-phases) - Schema created, client functions and hooks implemented, migration applied

### ⏸️ DEFERRED (2/10 Phases - 20% Deferred)
**Public Rendering:**
- **Phase 8**: Public Page Rendering System - Dynamic page renderer, block components, menu renderer
- **Phase 9**: Cohesive Editor Implementation - Unified editing experience with in-place content editing

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

#### 3.2 Block Version Editor ✅ COMPLETED
- [x] Create block version editor
- [x] Layout variant selector
- [x] Content editor (JSON structure, i18n support)
- [x] Asset reference management
- [x] Files: `src/admin/cms/components/BlockEditor.tsx`, `src/admin/cms/components/BlockContentEditor.tsx`

#### 3.3 Block Types & Templates ✅ COMPLETED
- [x] Define common block types (hero, features, CTA, text, image-text)
- [x] Create type-specific content schemas
- [x] Build visual block previews
- [x] Files: `src/lib/cms/blockTypes.ts`, `src/admin/cms/components/BlockPreview.tsx`
- [x] **COMMITTED**: feat(cms): Phase 3.3: Block Types & Templates - Complete implementation with 8 block types, schemas, and visual previews

#### 3.4 Block Asset Management ✅ COMPLETED
- [x] Link assets to blocks with roles (hero_image, thumbnail, gallery)
- [x] Asset picker component
- [x] Display linked assets
- [x] Files: `src/admin/cms/components/AssetPicker.tsx`, `src/admin/cms/components/BlockAssetManager.tsx`, `src/admin/cms/components/LinkedAssetsDisplay.tsx`
- [x] **COMMITTED**: feat(cms): Phase 3.4: Block Asset Management - Complete implementation with role-based asset linking, validation, and enhanced UX

### Phase 4: Menus Management ✅ COMPLETED
Build navigation menu system:

#### 4.1 Menu List & Basic CRUD ✅ COMPLETED
- [x] Display menus with site filtering
- [x] Create menu (handle, label, system_key)
- [x] Edit/delete menus
- [x] Files: `src/admin/cms/CmsMenus.tsx`, `src/admin/cms/components/MenuList.tsx`

#### 4.2 Simple Menu Editor ✅ COMPLETED
- [x] Menu item tree editor
- [x] Add/edit/delete menu items
- [x] Support types: page, external, anchor, separator, group
- [x] Configure label, target, rel attributes
- [x] Files: `src/admin/cms/components/MenuEditor.tsx`, `src/admin/cms/components/MenuItemEditor.tsx`

#### 4.3 Menu Item Visibility ✅ COMPLETED
- [x] Configure visibility rules (device, audience, feature flags, schedule)
- [x] Badge configuration
- [x] Style hints
- [x] Files: `src/admin/cms/components/MenuItemVisibilityEditor.tsx`

#### 4.4 Menu Rules (Optional/Future)
- [ ] Dynamic menu item generation based on rules
- [ ] Auto-include pages by path prefix, tag, section
- [ ] Sorting and capping options
- [ ] Files: `src/admin/cms/components/MenuRuleEditor.tsx` (skip for now, implement if needed)
- [x] **COMMITTED**: feat(cms): Phase 4: Menus Management - Complete implementation with tree editor, visibility rules, and comprehensive menu management
- [x] **ENHANCED**: Added menu publishing functionality with publish/unpublish buttons
- [x] **OPTIMIZED**: Removed redundant status column from menu_version table (status tracked via menu_publish table)

### Phase 5: Publishing Workflow ✅ COMPLETE
Implement versioning and publishing with hybrid approach:

#### 5.1 Version Management UI ✅ COMPLETE
- [x] Create new versions for pages/blocks/menus
- [x] Version selector dropdown
- [ ] Status badges (draft, published, archived) - Status column removed from schema
- [x] Files: `src/admin/cms/components/VersionSelector.tsx` (integrated into existing editors)

#### 5.2 Individual Entity Publishing ✅ COMPLETE
- [x] Publish button with confirmation
- [x] Update publish tables (page_publish, block_publish, menu_publish)
- [x] Unpublish operation
- [x] Show publish status and timestamp
- [x] Files: Add to existing editors

#### 5.3 Hybrid Publishing System ✅ COMPLETED
- [x] **Database Schema Updates**:
  - [x] Add 'staged' to publish_status enum: `ALTER TYPE publish_status ADD VALUE 'staged';`
  - [x] Create site_staging table for site-level staging
  - [x] Add staging_status columns to version tables
  - [x] Create staging dependency tracking table
- [x] **Individual Entity Staging**:
  - [x] Implement stageEntity() function for pages, blocks, menus, assets
  - [x] Add staging status tracking
  - [x] Create staging preview capabilities
- [x] **Site-Level Staging**:
  - [x] Implement stageSite() function
  - [x] Add site_staging table management
  - [x] Create atomic staging workflow
- [x] **Staging Management UI**:
  - [x] Create staging dashboard
  - [x] Add staging controls to existing editors
  - [x] Implement staging status indicators
- [x] **Dependency Management**:
  - [x] Add dependency checking for staged content
  - [x] Create dependency visualization
  - [x] Implement dependency resolution
- [x] Files: `src/lib/cms/stagingClient.ts`, `src/lib/cms/stagingHooks.ts`, `src/admin/cms/StagingManager.tsx`, `src/admin/cms/StagingDashboard.tsx`, `src/admin/cms/components/StagingControls.tsx`, `src/admin/cms/components/StagingPreview.tsx`, `src/admin/cms/components/StagingIntegration.tsx`, `supabase/migrations/20250117000021_add_staging_support.sql`

#### 5.4 Staging Workflow Features ✅ COMPLETED
- [x] Stage individual entities (pages, blocks, menus, assets)
- [x] Stage entire site at once
- [x] Preview staged content
- [x] Publish all staged content atomically
- [x] Rollback staging changes
- [x] Files: `src/admin/cms/components/StagingControls.tsx`, `src/admin/cms/components/StagingPreview.tsx`, `src/admin/cms/components/StagingIntegration.tsx`

#### 5.5 Audit Logging ✅ COMPLETED
- [x] Log all CMS operations using `log_cms_audit` function
- [x] Display audit log in CmsAudit page
- [x] Filter by entity type, entity ID, user, date
- [x] Statistics dashboard with operation analytics
- [x] Export capabilities (CSV/JSON)
- [x] Batch operation logging
- [x] Files: `src/lib/cms/auditClient.ts`, `src/lib/cms/auditHooks.ts`, `src/lib/cms/auditIntegration.ts`, `src/admin/cms/CmsAudit.tsx`

#### 5.6 Permissions Integration ✅ COMPLETED
- [x] Check permissions before operations (cms:page:create, cms:block:edit, etc.)
- [x] Display permission errors
- [x] Manage user permissions in CmsUsers
- [x] Permission-based UI protection with guard components
- [x] Granular permission checking for all CMS operations
- [x] User permission management interface
- [x] Files: `src/lib/cms/permissionsClient.ts`, `src/lib/cms/permissionsHooks.ts`, `src/admin/cms/CmsUsers.tsx`, `src/admin/cms/components/PermissionGuard.tsx`

### Phase 6: Testing Infrastructure ✅ COMPLETE
Set up comprehensive unit testing for all CMS logic:

#### 6.1 Testing Setup ✅ COMPLETE
- [x] Install testing dependencies (Vitest, @testing-library/react, msw)
- [x] Configure test environment and mocking
- [x] Set up test database and fixtures
- [x] Create test utilities and helpers
- [x] Files: `vitest.config.ts`, `src/__tests__/setup.ts`, `src/__tests__/utils/`

#### 6.2 Schema Testing ✅ COMPLETE
- [x] Test all Zod schemas with valid/invalid data
- [x] Test edge cases (null, undefined, empty strings, invalid types)
- [x] Test schema transformations and validations
- [x] Test type inference and compatibility
- [x] Files: `src/__tests__/schemas/`

#### 6.3 Client Function Testing ✅ COMPLETE
- [x] Test all client functions with mocked Supabase
- [x] Test error handling and edge cases
- [x] Test data transformation and validation
- [x] Test authentication and permissions
- [x] Files: `src/__tests__/client/`

#### 6.4 Hook Testing ✅ COMPLETE
- [x] Test all custom hooks with mocked dependencies
- [x] Test state management and side effects
- [x] Test error states and loading states
- [x] Test hook composition and reusability
- [x] Files: `src/__tests__/hooks/`

#### 6.5 Context Testing ✅ COMPLETE
- [x] Test all context providers with mocked state
- [x] Test context value updates and propagation
- [x] Test context composition and nesting
- [x] Test context error handling
- [x] Files: `src/__tests__/contexts/`

#### 6.6 Utility Function Testing ✅ COMPLETE
- [x] Test all utility functions with various inputs
- [x] Test data transformation and validation
- [x] Test edge cases and error conditions
- [x] Test function composition and reusability
- [x] Files: `src/__tests__/utils/`

#### 6.7 Retrofit Existing Code Tests ✅ COMPLETE
- [x] Add tests for existing client functions (`src/lib/cms/client.ts`)
- [x] Add tests for existing hooks (`src/lib/cms/hooks.ts`)
- [x] Add tests for existing schemas (`src/lib/cms/schemas.ts`)
- [x] Add tests for existing utility functions (`src/lib/cms/utils.ts`)
- [x] Refactor existing code to be more testable (dependency injection)
- [x] Files: `src/__tests__/retrofit/`

#### 6.8 Refactoring for Testability ✅ COMPLETE
- [x] Create `SupabaseClient` interface for dependency injection
- [x] Refactor client functions to accept client as parameter
- [x] Create factory functions for client creation
- [x] Add error handling interfaces and implementations
- [x] Create validation service interfaces
- [x] Files: `src/lib/cms/interfaces/`, `src/lib/cms/services/`

### Phase 7: Supabase Edge Functions ✅ COMPLETE
Create resolution functions for published content:

#### 7.1 Resolve Page Function ✅ COMPLETE
- [x] Implement `resolvePage` Edge Function per requirements spec
- [x] Fetch published page with all referenced blocks and assets
- [x] Return hydrated ResolvedPage JSON
- [x] Files: `supabase/functions/resolvePage/index.ts`

#### 7.2 Resolve Menu Function ✅ COMPLETE
- [x] Implement `resolveMenu` Edge Function per requirements spec
- [x] Fetch published menu with item tree
- [x] Resolve page references
- [x] Files: `supabase/functions/resolveMenu/index.ts`

#### 7.3 Client-side Resolution (Alternative) ✅ COMPLETE
- [x] Implement client-side resolution functions for preview mode
- [x] Use same logic as Edge Functions but run in browser
- [x] React hooks for content resolution
- [x] Files: `src/lib/cms/resolver.ts`, `src/lib/cms/resolverHooks.ts`

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

### Phase 9: Cohesive Editor Implementation
Build the unified content editing experience as specified in `CMS_COHESIVE_EDITOR.md`:

#### 9.1 Cohesive Page Editor Layout ❌ NOT IMPLEMENTED
- [ ] Create unified page editor with top bar, right panel, bottom bar, and content area
- [ ] Implement top bar with page info, version selector, and toolbar
- [ ] Build right panel for context-sensitive editing (blocks, assets, library)
- [ ] Create bottom bar for metadata display
- [ ] Design middle content area for in-place editing
- [ ] Files: `src/admin/cms/CohesivePageEditor.tsx`, `src/admin/cms/components/CohesiveEditorLayout.tsx`

#### 9.2 In-Place Content Editing ❌ NOT IMPLEMENTED
- [ ] Implement drag-and-drop for content blocks
- [ ] Create in-place editing for blocks (styled to look like final output)
- [ ] Add drag-and-drop for assets into blocks
- [ ] Build block reordering and nesting
- [ ] Files: `src/admin/cms/components/InPlaceEditor.tsx`, `src/admin/cms/components/BlockDragDrop.tsx`

#### 9.3 Context-Sensitive Right Panel ❌ NOT IMPLEMENTED
- [ ] Block editor panel (version selector, layout, attributes)
- [ ] Asset editor panel (version selector, variants, editing)
- [ ] Content library panel (blocks and assets for drag-and-drop)
- [ ] Dynamic panel switching based on selection
- [ ] Files: `src/admin/cms/components/ContextPanel.tsx`, `src/admin/cms/components/BlockEditorPanel.tsx`

#### 9.4 Menu and Auxiliary Pages Integration ❌ NOT IMPLEMENTED
- [ ] Add menu outline component to admin navigation
- [ ] Implement menu item editing with drag-and-drop
- [ ] Create auxiliary pages component
- [ ] Add navigation between cohesive editor and menu/auxiliary pages
- [ ] Files: `src/admin/cms/components/MenuOutline.tsx`, `src/admin/cms/components/AuxiliaryPages.tsx`

#### 9.5 Publishing Integration ❌ NOT IMPLEMENTED
- [ ] Integrate individual publishing into cohesive editor
- [ ] Add staging workflow controls
- [ ] Implement dependency visualization
- [ ] Create publishing workflow selection (individual vs. staging)
- [ ] Files: `src/admin/cms/components/CohesivePublishing.tsx`

#### 9.6 Real-Time Preview ❌ NOT IMPLEMENTED
- [ ] Implement live preview of content changes
- [ ] Add preview mode toggle
- [ ] Create preview rendering system
- [ ] Handle staged vs. published content preview
- [ ] Files: `src/admin/cms/components/LivePreview.tsx`, `src/admin/cms/hooks/usePreview.ts`

### Phase 10: Database Object Organization
Implement properly named database objects with prefixes for better organization and clarity:

#### 10.1 Analytics Objects Implementation ❌ NOT IMPLEMENTED
- [ ] **Tables**:
  - [ ] Create `analytics_users` table
  - [ ] Create `analytics_sessions` table
  - [ ] Create `analytics_pageviews` table
  - [ ] Create `analytics_events` table
  - [ ] Create `analytics_excluded_users` table
- [ ] **Functions**: Create analytics-related functions with `analytics_` prefix
- [ ] **Edge Functions**: Create analytics edge functions with `analytics_` prefix
  - [ ] `analytics_ingest_batch`
  - [ ] `analytics_ingest_end_session`
  - [ ] `analytics_ingest_event`
  - [ ] `analytics_ingest_heartbeat`
  - [ ] `analytics_ingest_pageview`
  - [ ] `analytics_ingest_start_session`
  - [ ] `analytics_ingest_update_session_context`
  - [ ] `analytics_ingest_upsert_user`

#### 10.2 Leads Objects Implementation ❌ NOT IMPLEMENTED
- [ ] **Tables**:
  - [ ] Create `leads_submissions` table
  - [ ] Create `system_admins` table (moved to system category)
- [ ] **Functions**: Create leads-related functions with `leads_` prefix

#### 10.3 System Objects Implementation ❌ NOT IMPLEMENTED
- [ ] **Tables**:
  - [ ] Create `system_sites` table
  - [ ] Create `system_user_permissions` table
  - [ ] Create `system_audit_log` table
- [ ] **Functions**: Create system-related functions with `system_` prefix

#### 10.4 CMS Objects Implementation ❌ NOT IMPLEMENTED
- [ ] **Tables**:
  - [ ] Create `cms_pages` table
  - [ ] Create `cms_page_versions` table
  - [ ] Create `cms_page_publishes` table
  - [ ] Create `cms_blocks` table
  - [ ] Create `cms_block_versions` table
  - [ ] Create `cms_block_publishes` table
  - [ ] Create `cms_menus` table
  - [ ] Create `cms_menu_versions` table
  - [ ] Create `cms_menu_publishes` table
  - [ ] Create `cms_assets` table
  - [ ] Create `cms_asset_versions` table
  - [ ] Create `cms_asset_publishes` table
  - [ ] Create `cms_asset_variants` table
  - [ ] Create `cms_asset_usage` table
- [ ] **Functions**: Create CMS-related functions with `cms_` prefix
- [ ] **Edge Functions**: Create CMS edge functions with `cms_` prefix
  - [ ] `cms_process_asset_variants`

#### 10.5 Implementation Strategy ❌ NOT IMPLEMENTED
- [ ] **Create New Schema**:
  - [ ] Create new migration with properly named tables from the start
  - [ ] Set up all foreign key relationships with new table names
  - [ ] Create RLS policies with new table names
  - [ ] Create all client code with new table names
  - [ ] Generate TypeScript types and interfaces
- [ ] **Client Code Implementation**:
  - [ ] Implement all Supabase client calls with new table names
  - [ ] Create all TypeScript interfaces and types
  - [ ] Build all React components with new table names
  - [ ] Create all hooks and utility functions
- [ ] **Testing Strategy**:
  - [ ] Test all functionality with new table names
  - [ ] Verify all foreign key relationships work
  - [ ] Test all client code with new names
  - [ ] Verify RLS policies work with new names
- [ ] Files: `supabase/migrations/create_properly_named_schema.sql`, `src/lib/database.types.ts`, `src/lib/cms/`

#### 10.6 Documentation Creation ❌ NOT IMPLEMENTED
- [ ] Create documentation with properly named objects from the start
- [ ] Create API documentation with new object names
- [ ] Create client code examples with new names
- [ ] Create database schema documentation
- [ ] Files: `README.md`, `CMS_IMPLEMENTATION_PLAN.md`, `src/lib/cms/`

## Success Criteria
- ✅ Can upload, organize, and manage assets with variants
- ✅ Can create, edit, version, and publish pages
- ✅ Can create reusable blocks and reference them in pages
- ✅ Can build navigation menus with various item types
- ✅ All operations are audited and permission-controlled
- ✅ **Hybrid Publishing**: Can publish individual entities OR stage entire site
- ✅ **Staging Workflow**: Complete site preview and atomic publishing
- ✅ **Dependency Management**: Visualize and manage content dependencies
- ✅ **Audit Logging**: Comprehensive audit trail for all operations
- ✅ **Permissions System**: Granular permission control and user management
- ✅ **Edge Functions**: Published content is resolved via Edge Functions
- ✅ **Database Organization**: All database objects properly prefixed and organized
- ❌ Public site renders CMS content dynamically
- ❌ Existing pages migrated to CMS without losing functionality
- ❌ **Cohesive Editor**: Unified editing experience with in-place content editing

## Hybrid Publishing Architecture

### Publishing Approach Decision
Based on analysis of the current schema and requirements, the CMS implements a **hybrid publishing approach** that provides both individual entity publishing and site-level staging:

#### Individual Entity Publishing (Current Implementation)
- **Granular Control**: Publish specific pages, blocks, or assets independently
- **Content Reuse**: Blocks and assets can be published and reused across pages
- **Incremental Updates**: Update single entities without affecting the entire site
- **Risk Mitigation**: Changes to one entity don't break the whole site
- **Content Team Workflow**: Different team members can work on different content types

#### Site-Level Staging (Phase 5.3-5.4)
- **Consistency Guarantee**: All content is tested together before going live
- **Atomic Updates**: Either everything publishes or nothing does
- **Quality Control**: Complete site preview before publishing
- **Major Releases**: Ideal for comprehensive site updates and redesigns

#### Hybrid Benefits
- **Flexibility**: Choose the right approach for each situation
- **Content Team Efficiency**: Quick individual updates + comprehensive staging for major releases
- **Risk Management**: Can do both incremental updates and major overhauls safely
- **User Experience**: Content creators can choose their preferred workflow

### Cohesive Editor Architecture

#### Unified Editing Experience
The cohesive editor (Phase 9) provides a single interface for managing all content:

- **Top Bar**: Page info, version selector, toolbar (save, publish, preview, etc.)
- **Right Panel**: Context-sensitive editing (blocks, assets, library)
- **Bottom Bar**: Metadata display for selected content
- **Middle Area**: In-place content editing with drag-and-drop

#### Key Features
- **In-Place Editing**: Content looks like the final output while editing
- **Context-Sensitive Panels**: Right panel changes based on selection
- **Drag-and-Drop**: Blocks and assets can be moved and reordered
- **Real-Time Preview**: See changes as you make them
- **Dependency Visualization**: Understand how content relates

### Database Organization Architecture

#### Naming Convention Benefits
The database object renaming (Phase 10) provides several key benefits:

#### **Analytics Objects** (`analytics_` prefix)
- **Clear Separation**: Analytics data is clearly separated from content and system data
- **Performance**: Analytics queries are isolated and can be optimized independently
- **Scaling**: Analytics tables can be moved to separate databases if needed
- **Security**: Analytics data can have different access controls and retention policies

#### **Leads Objects** (`leads_` prefix)
- **Lead Management**: All lead-related functionality is clearly identified
- **CRM Integration**: Easier to integrate with external CRM systems
- **Data Privacy**: Lead data can have specific privacy controls and GDPR compliance

#### **System Objects** (`system_` prefix)
- **Core Infrastructure**: System tables are clearly identified as core infrastructure
- **Admin Functions**: System administration is separated from content management
- **Security**: System objects can have elevated security requirements

#### **CMS Objects** (`cms_` prefix)
- **Content Management**: All content-related tables are clearly identified
- **Content Workflow**: CMS functionality is isolated and can be optimized
- **Content Security**: Content data can have specific access controls
- **Content Scaling**: CMS can be scaled independently from other systems

#### **Direct Implementation Benefits**
- **Clean Start**: No legacy naming conventions to work around
- **Consistent Naming**: All objects follow the same naming pattern from the beginning
- **Simplified Development**: No need to maintain backward compatibility
- **Better Organization**: Clear separation of concerns from day one

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
- **🚨 CRITICAL: NEVER deploy to remote Supabase - LOCAL DEVELOPMENT ONLY**
- Ensure all Supabase features are re-deployed locally after each phase completion; never remotely
- Ensure there are no console errors before completion

## 🚨 DEPLOYMENT SAFETY - CRITICAL

### ⚠️ NEVER DEPLOY TO REMOTE SUPABASE
This project is configured for **LOCAL DEVELOPMENT ONLY**. Any deployment to remote Supabase could cause data loss or corruption.

### 🛡️ Safety Measures in Place
- **Blocked Commands**: `npm run db:migrate` is blocked (was `supabase db push`)
- **Safe Commands**: Use `npm run db:reset` for local database operations
- **Safety Script**: `./scripts/prevent-remote-deployment.sh` for pre-deployment checks
- **Configuration**: All Supabase URLs point to `127.0.0.1` (local only)

### ✅ Safe Development Workflow
```bash
# Start local development
npm start

# Reset database (applies all migrations)
npm run db:reset

# Generate types
npm run db:generate

# Open Supabase Studio
npm run db:studio
```

### ❌ NEVER USE
- `npm run db:migrate` (blocked)
- `supabase db push` (deploys to remote)
- `supabase link` (links to remote)
- `supabase deploy` (deploys to remote)

**See `DEPLOYMENT_SAFETY.md` for complete safety guide.**

## RLS and Permissions Troubleshooting Guide

### Common Issues and Solutions

#### 1. 403 Forbidden Errors on New Tables
**Problem**: When creating new CMS tables, RLS policies often block operations with 403 errors.

**Root Causes**:
- RLS policies are too restrictive
- `has_permission` function not working correctly
- User permissions not properly set in `user_permissions` table
- Policy conditions are too complex

**Solutions**:
1. **Immediate Fix**: Create a migration to simplify RLS policies
   ```sql
   -- Drop overly restrictive policies
   DROP POLICY IF EXISTS "complex_policy_name" ON table_name;
   
   -- Create simple policy for authenticated users
   CREATE POLICY "table_name_allow_authenticated" ON table_name
     FOR ALL USING (auth.uid() IS NOT NULL);
   ```

2. **Debug Permission System**:
   ```sql
   -- Check if user has permissions
   SELECT has_permission(auth.uid(), 'cms.blocks.publish');
   
   -- Check user permissions
   SELECT permissions FROM user_permissions WHERE user_id = auth.uid();
   ```

3. **Temporary Client-side Fix**: Comment out permission checks in client functions
   ```typescript
   // const canPublish = await hasPermission('cms.blocks.publish');
   // if (!canPublish) throw new Error('Insufficient permissions');
   ```

#### 2. Permission System Issues
**Problem**: The `has_permission` function or RPC calls fail.

**Solutions**:
1. **Check RPC Function**: Ensure `has_permission` function exists and works
2. **Verify User Permissions**: Check `user_permissions` table has correct data
3. **Test RPC Call**: Use Supabase Studio to test RPC functions
4. **Fallback**: Use simple RLS policies instead of complex permission checks

#### 3. New Table RLS Setup Checklist
When creating new CMS tables, follow this checklist:

**Before Creating Table**:
- [ ] Plan RLS policies (simple vs complex)
- [ ] Decide on permission requirements
- [ ] Create migration file for table + policies

**After Creating Table**:
- [ ] Test basic CRUD operations
- [ ] Test with authenticated user
- [ ] Test permission-based operations
- [ ] Create fallback simple policies if needed

**Example Migration Template**:
```sql
-- Create table
CREATE TABLE new_cms_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- other columns
);

-- Enable RLS
ALTER TABLE new_cms_table ENABLE ROW LEVEL SECURITY;

-- Create simple policies first (for testing)
CREATE POLICY "new_table_allow_authenticated" ON new_cms_table
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Add complex policies later if needed
-- CREATE POLICY "new_table_permission_based" ON new_cms_table
--   FOR INSERT WITH CHECK (has_permission(auth.uid(), 'cms.new_table.write'));
```

#### 4. Debugging RLS Issues
**Step-by-step debugging**:

1. **Check Authentication**:
   ```typescript
   const { data: { user } } = await supabase.auth.getUser();
   console.log('User authenticated:', !!user);
   ```

2. **Test Simple Operations**:
   ```typescript
   // Test basic select first
   const { data, error } = await supabase.from('table_name').select('*');
   console.log('Select test:', { data, error });
   ```

3. **Test RLS Policies**:
   ```sql
   -- In Supabase Studio SQL editor
   SELECT * FROM table_name; -- Should work if RLS allows
   ```

4. **Check Policy Conditions**:
   ```sql
   -- Test policy conditions
   SELECT auth.uid() IS NOT NULL; -- Should return true
   SELECT has_permission(auth.uid(), 'permission.name'); -- Test specific permission
   ```

#### 5. Prevention Strategies
**For Future Development**:

1. **Start Simple**: Always create simple RLS policies first
2. **Test Early**: Test CRUD operations immediately after table creation
3. **Use Fallbacks**: Have simple policies as fallbacks for complex ones
4. **Document Patterns**: Keep a template for common RLS patterns
5. **Monitor Logs**: Check browser console and Supabase logs for RLS errors

**Recommended RLS Policy Pattern**:
```sql
-- Simple policy for authenticated users (for testing)
CREATE POLICY "table_authenticated" ON table_name
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Complex policy for production (when ready)
CREATE POLICY "table_permission_based" ON table_name
  FOR INSERT WITH CHECK (has_permission(auth.uid(), 'cms.table.write'))
  FOR UPDATE USING (has_permission(auth.uid(), 'cms.table.write'))
  FOR DELETE USING (has_permission(auth.uid(), 'cms.table.delete'))
  FOR SELECT USING (has_permission(auth.uid(), 'cms.table.read'));
```

#### 6. Emergency Fixes
**When RLS blocks everything**:

1. **Temporarily Disable RLS**:
   ```sql
   ALTER TABLE problematic_table DISABLE ROW LEVEL SECURITY;
   ```

2. **Create Permissive Policy**:
   ```sql
   CREATE POLICY "allow_all" ON problematic_table
     FOR ALL USING (true);
   ```

3. **Remove All Policies**:
   ```sql
   DROP POLICY IF EXISTS "policy_name" ON table_name;
   ```

**Remember**: These are temporary fixes for development. Always implement proper security for production.


### New CMS Feature Development Workflow
**To prevent RLS and permission issues when adding new CMS features:**

#### Phase 1: Database Setup
1. **Create Migration File**:
   ```bash
   # Create new migration
   touch supabase/migrations/YYYYMMDDHHMMSS_new_feature.sql
   ```

2. **Start with Simple RLS Policies**:
   ```sql
   -- Create table
   CREATE TABLE new_cms_table (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     -- columns
   );
   
   -- Enable RLS
   ALTER TABLE new_cms_table ENABLE ROW LEVEL SECURITY;
   
   -- Simple policy for testing
   CREATE POLICY "new_table_allow_authenticated" ON new_cms_table
     FOR ALL USING (auth.uid() IS NOT NULL);
   ```

3. **Test Database Operations**:
   ```bash
   npm run db:reset
   npm run db:generate
   ```

#### Phase 2: Client Functions
1. **Create Basic CRUD Functions**:
   ```typescript
   // Start with simple functions, no permission checks
   export async function createNewItem(data: any) {
     const { data: { user } } = await supabase.auth.getUser();
     if (!user) throw new Error('User not authenticated');
     
     // Simple insert, no permission checks initially
     const { data, error } = await supabase
       .from('new_cms_table')
       .insert(data)
       .select()
       .single();
     
     if (error) throw error;
     return { data, error: null };
   }
   ```

2. **Test Client Functions**:
   - Test in browser console
   - Check for 403 errors
   - Verify data is inserted correctly

#### Phase 3: React Components
1. **Create Basic Components**:
   - Start with simple forms
   - No complex permission logic
   - Basic CRUD operations

2. **Test Component Integration**:
   - Test create, read, update, delete
   - Check for console errors
   - Verify data flow

#### Phase 4: Add Security (Optional)
1. **Add Permission Checks** (only after basic functionality works):
   ```typescript
   // Add permission checks after basic functionality is working
   const canCreate = await hasPermission('cms.new_table.write');
   if (!canCreate) throw new Error('Insufficient permissions');
   ```

2. **Add Complex RLS Policies** (only after basic functionality works):
   ```sql
   -- Add complex policies after basic functionality is working
   DROP POLICY "new_table_allow_authenticated" ON new_cms_table;
   
   CREATE POLICY "new_table_permission_based" ON new_cms_table
     FOR INSERT WITH CHECK (has_permission(auth.uid(), 'cms.new_table.write'))
     FOR UPDATE USING (has_permission(auth.uid(), 'cms.new_table.write'))
     FOR DELETE USING (has_permission(auth.uid(), 'cms.new_table.delete'))
     FOR SELECT USING (has_permission(auth.uid(), 'cms.new_table.read'));
   ```

#### Phase 5: Testing & Refinement
1. **Test All Operations**:
   - Create, read, update, delete
   - Test with different user permissions
   - Test error scenarios

2. **Add Unit Tests**:
   - Test client functions
   - Test React components
   - Test permission logic

3. **Documentation**:
   - Update this implementation plan
   - Document any new patterns
   - Add troubleshooting notes

#### Emergency Recovery
**If RLS blocks everything**:
1. **Quick Fix**: Disable RLS temporarily
   ```sql
   ALTER TABLE problematic_table DISABLE ROW LEVEL SECURITY;
   ```

2. **Simple Fix**: Create permissive policy
   ```sql
   CREATE POLICY "allow_all" ON problematic_table
     FOR ALL USING (true);
   ```

3. **Test and Iterate**: Get basic functionality working first, then add security

## Current Status

### ✅ COMPLETED PHASES (Admin Portal & Backend)
- ✅ **Phase 1**: Asset Management (4/4 sub-phases) - COMPLETED
- ✅ **Phase 2**: Pages Management (4/4 sub-phases) - COMPLETED  
- ✅ **Phase 3**: Blocks Management (4/4 sub-phases) - COMPLETED
- ✅ **Phase 4**: Menus Management (4/4 sub-phases) - COMPLETED
- ✅ **Phase 5**: Publishing Workflow (6/6 sub-phases) - COMPLETED
- ✅ **Phase 6**: Testing Infrastructure (8/8 sub-phases) - COMPLETED
- ✅ **Phase 7**: Supabase Edge Functions (3/3 sub-phases) - COMPLETED

### ✅ COMPLETED (Admin Portal & Backend)
- ✅ **Phase 10**: Database Object Organization - COMPLETED

### ⏸️ DEFERRED (Public Rendering)
- ⏸️ **Phase 8**: Public Page Rendering System - DEFERRED
- ⏸️ **Phase 9**: Cohesive Editor Implementation - DEFERRED
