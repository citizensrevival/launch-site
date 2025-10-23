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
- ✅ **Phase 1.1**: Asset Upload (Basic) - COMPLETED
- ✅ **Phase 1.2**: Asset Variants Generation - COMPLETED
- ✅ **Phase 1.3**: Asset Optimization - COMPLETED
- ✅ **Phase 1.4**: Asset Editing - COMPLETED
- ✅ **Phase 2.1**: Page List & CRUD - COMPLETED
- ✅ **Phase 2.2**: Page Version Editor - COMPLETED
- ✅ **Phase 2.3**: Page Slots System - COMPLETED
- ✅ **Phase 2.4**: Page Version History - COMPLETED
- ✅ **Phase 3.1**: Block List & CRUD - COMPLETED
- ✅ **Phase 3.2**: Block Version Editor - COMPLETED
- ⏳ **Phase 6**: Testing Infrastructure - IN PROGRESS
