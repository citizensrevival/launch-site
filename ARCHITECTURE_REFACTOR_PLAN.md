# Architecture Refactor Plan

## Overview

Refactor the entire codebase to align with the database schema as the source of truth, enforce proper architectural boundaries, organize by feature, and add comprehensive testing and validation.

## Key Principles

1. Database schema is immutable and the source of truth
2. All operations tested locally first
3. Dependency flow: `supabase client → service → hook → component`
4. Services are TypeScript classes with explicit modifiers and constructor injection
5. Features organized under `/src/admin/FEATURE` and `/src/public/FEATURE`
6. Shared code in `/src/core/`
7. All types have corresponding Zod schemas
8. Comprehensive unit and integration tests for all services and hooks
9. Tests mirror source structure
10. **NO MOCK OR EXAMPLE DATA** - all data from database
11. **NO HARDCODED VALUES** - all configuration from environment/database
12. **Store everything in Redux state** - persistent storage saturates Redux state
13. **Two separate Redux stores** - one for public, one for admin
14. **Permissions are a system feature** - not CMS-specific
15. **Analytics is public-only** - no admin analytics tracking

## Implementation Phases

### Phase 1: Foundation Setup (Core Infrastructure)

**1.1 Create New Directory Structure**

- Create `/src/core/` with subdirectories: `components/`, `contexts/`, `hooks/`, `services/`, `types/`, `schemas/`, `utils/`, `styles/`, `fonts/`
- Create feature directories under `/src/admin/`: `analytics/`, `cms/`, `leads/`, `system/`
- Create feature subdirs: `assets/`, `blocks/`, `menus/`, `pages/`, `staging/`, `audit/` under `/src/admin/cms/`
- Create subdirs under `/src/admin/system/`: `sites/`, `users/`, `permissions/`, `audit/`
- Create feature directories under `/src/public/`: `analytics/`, `cms/`, `leads/`
- Within each feature, create: `components/`, `hooks/`, `services/`, `schemas/`, `types/`, `pages/`, `contexts/` (if needed)
- Add `__tests__/` under each `hooks/`, `services/`, and `schemas/` directory

**1.2 Core Types & Supabase Client**

- Move `/src/lib/database.types.ts` → `/src/core/types/database.types.ts`
- Move `/src/shell/lib/supabase.ts` → `/src/core/supabase.ts`
- Create `/src/core/types/supabase.types.ts` for SupabaseClient interfaces
- Create `/src/core/services/BaseService.ts` - abstract base class for all services

**1.3 Core Contexts**

- Move `/src/shell/contexts/AuthContext.tsx` → `/src/core/contexts/AuthContext.tsx`
- Move `/src/shell/contexts/SiteContext.tsx` → `/src/core/contexts/SiteContext.tsx`
- Move `/src/shell/contexts/ThemeContext.tsx` → `/src/core/contexts/ThemeContext.tsx`
- Move `/src/shell/contexts/AnalyticsContext.tsx` → `/src/public/analytics/contexts/AnalyticsContext.tsx` (public only)
- Update contexts to use new service architecture

**1.4 Core Components & Assets**

- Move shared components from `/src/shell/` to `/src/core/components/`
- Move styles from `/src/shell/styles/` to `/src/core/styles/` (verify project configurations)
- Move fonts from `/src/shell/fonts/` to `/src/core/fonts/`
- Move `/src/shell/vite-env.d.ts` → `/src/core/vite-env.d.ts`

**1.5 Redux Store Setup**

- Create `/src/admin/store/` - admin Redux store
- Create `/src/public/store/` - public Redux store
- Move admin store from `/src/shell/store/` to `/src/admin/store/`
- Create public store structure
- Ensure persistent storage saturates Redux state
- Duplicate state between stores if necessary

### Phase 2: Edge Functions & Types

**2.1 Analytics Edge Functions**

- Review all 7 ingest functions: `ingest-batch`, `ingest-end-session`, `ingest-event`, `ingest-heartbeat`, `ingest-pageview`, `ingest-start-session`, `ingest-update-session-context`, `ingest-upsert-user`
- Extract request/response types to `/src/public/analytics/types/edge-functions.ts`
- Create Zod schemas in `/src/public/analytics/schemas/edge-functions.schemas.ts`
- Write comprehensive schema tests in `/src/public/analytics/schemas/__tests__/edge-functions.schemas.test.ts`
- Test with valid inputs, invalid inputs, edge cases, boundary conditions

**2.2 CMS Edge Functions**

- Review `process-asset-variants`, `resolveMenu`, `resolvePage`
- Extract types to appropriate feature folders:
  - Asset types → `/src/admin/cms/assets/types/edge-functions.ts`
  - Menu types → `/src/public/cms/types/menu.edge-functions.ts`
  - Page types → `/src/public/cms/types/page.edge-functions.ts`
- Create Zod schemas for each
- Write comprehensive tests

**2.3 Edge Function Integration Tests**

- Create integration test suite for each edge function
- Test against local Supabase (after `npm run db:reset`)
- Verify schema validation catches errors
- Document edge function contracts

### Phase 3: System Services (Foundation Layer)

**3.1 System Sites Service**

- Create `/src/admin/system/sites/types/site.types.ts` (from database schema)
- Create `/src/admin/system/sites/schemas/site.schemas.ts` (Zod schemas matching DB)
- Write schema tests in `/src/admin/system/sites/schemas/__tests__/site.schemas.test.ts`
- Create `/src/admin/system/sites/services/SiteService.ts`:
  - Constructor with dependency injection (supabase client)
  - Methods: `getSites()`, `getSiteById()`, `createSite()`, `updateSite()`, `deleteSite()`
  - All methods return typed results with error handling
- Write unit tests in `/src/admin/system/sites/services/__tests__/SiteService.test.ts`
- Write integration tests in `/src/admin/system/sites/services/__tests__/SiteService.integration.test.ts`

**3.2 System Users Service**

- Create types, schemas, schema tests
- Create `/src/admin/system/users/services/UserService.ts`:
  - Methods: `getUsers()`, `getUserById()`, `createUser()`, `updateUser()`, `deleteUser()`
- Write unit tests and integration tests

**3.3 System Permissions Service**

- Create `/src/admin/system/permissions/types/permissions.types.ts`
- Create `/src/admin/system/permissions/schemas/permissions.schemas.ts`
- Write schema tests
- Create `/src/admin/system/permissions/services/PermissionsService.ts`:
  - Methods: `getUserPermissions()`, `checkPermission()`, `hasPermission()`, `updatePermissions()`, `getPermissionGroups()`, `assignPermissionGroup()`
- Write unit tests and integration tests

**3.4 System Audit Log Service**

- Create types, schemas, schema tests
- Create `/src/admin/system/audit/services/AuditLogService.ts`:
  - Methods: `getAuditLogs()`, `getAuditLogsByEntity()`, `createAuditLog()`
- Write unit tests and integration tests

**3.5 System Hooks**

- Create `/src/admin/system/sites/hooks/useSites.ts` (uses SiteService)
- Create `/src/admin/system/sites/hooks/useSite.ts`
- Create `/src/admin/system/users/hooks/useUsers.ts`
- Create `/src/admin/system/users/hooks/useUser.ts`
- Create `/src/admin/system/permissions/hooks/usePermissions.ts`
- Create `/src/admin/system/permissions/hooks/usePermissionCheck.ts`
- Create `/src/admin/system/audit/hooks/useAuditLogs.ts`
- Write tests for all hooks in respective `__tests__/` directories

### Phase 4: Analytics Services (Public Only)

**4.1 Analytics Public Service**

- Create `/src/public/analytics/types/tracker.types.ts`
- Create `/src/public/analytics/schemas/tracker.schemas.ts`
- Write schema tests
- Create `/src/public/analytics/services/AnalyticsTracker.ts`:
  - Refactor `/src/shell/lib/analyticsTracker.ts`
  - Constructor with supabase client injection
  - Methods: `trackPageView()`, `trackEvent()`, `startSession()`, `endSession()`, `updateSessionContext()`
- Write unit tests and integration tests

**4.2 Analytics Public Hooks**

- Create `/src/public/analytics/hooks/useAnalyticsTracking.ts`
- Create `/src/public/analytics/hooks/usePageView.ts`
- Create `/src/public/analytics/hooks/useEventTracking.ts`
- Create `/src/public/analytics/hooks/useSessionTracking.ts`
- Write tests for all hooks

**4.3 Analytics Public Context**

- Create `/src/public/analytics/contexts/AnalyticsContext.tsx`:
  - Move from `/src/shell/contexts/AnalyticsContext.tsx`
  - Update to use new service architecture
  - Store all analytics state in Redux
  - Persistent storage saturates Redux state

### Phase 5: Leads Services

**5.1 Leads Admin Service**

- Create `/src/admin/leads/types/leads.types.ts`
- Create `/src/admin/leads/schemas/leads.schemas.ts` (matching database schema)
- Write schema tests
- Create `/src/admin/leads/services/LeadsService.ts`:
  - Refactor `/src/shell/lib/LeadsAdmin.ts`
  - Constructor with supabase client injection
  - Methods: `searchLeads()`, `countTotalLeads()`, `countByLeadKind()`, `getDashboardCounts()`, `getLeadById()`, `updateLead()`, `deleteLead()`, `exportLeadsToCSV()`, `getLeadStats()`
- Write comprehensive unit tests
- Write integration tests

**5.2 Leads Public Service**

- Create `/src/public/leads/types/leads.types.ts`
- Create `/src/public/leads/schemas/leads.schemas.ts`
- Write schema tests
- Create `/src/public/leads/services/LeadsService.ts`:
  - Refactor `/src/shell/lib/LeadsPublic.ts`
  - Constructor with supabase client injection
  - Methods: `createLead()`, `emailExists()`, `getLeadById()`
- Write unit tests and integration tests

**5.3 Leads Hooks**

- Create `/src/admin/leads/hooks/useLeads.ts`
- Create `/src/admin/leads/hooks/useLeadSearch.ts`
- Create `/src/admin/leads/hooks/useLeadStats.ts`
- Create `/src/admin/leads/hooks/useLeadExport.ts`
- Create `/src/public/leads/hooks/useLeadSubmission.ts`
- Write tests for all hooks

### Phase 6: CMS Assets

**6.1 CMS Assets Service**

- Create `/src/admin/cms/assets/types/asset.types.ts`
- Create `/src/admin/cms/assets/schemas/asset.schemas.ts`
- Write schema tests covering: asset metadata, variants, versions, publish states
- Create `/src/admin/cms/assets/services/AssetService.ts`:
  - Consolidate logic from `/src/lib/cms/client.ts` (asset-related)
  - Constructor with supabase client injection
  - Methods: `getAssets()`, `getAssetById()`, `createAsset()`, `updateAsset()`, `deleteAsset()`, `getAssetVersions()`, `createAssetVersion()`, `publishAsset()`, `getAssetVariants()`, `createAssetVariant()`, `deleteAssetVariant()`, `getAssetUsage()`, `trackAssetUsage()`
- Write unit tests and integration tests

**6.2 CMS Assets Hooks**

- Create `/src/admin/cms/assets/hooks/useAssets.ts`
- Create `/src/admin/cms/assets/hooks/useAsset.ts`
- Create `/src/admin/cms/assets/hooks/useAssetVersions.ts`
- Create `/src/admin/cms/assets/hooks/useAssetPublish.ts`
- Create `/src/admin/cms/assets/hooks/useAssetVariants.ts`
- Create `/src/admin/cms/assets/hooks/useAssetUsage.ts`
- Write tests for all hooks

### Phase 7: CMS Blocks

**7.1 CMS Blocks Service**

- Create `/src/admin/cms/blocks/types/block.types.ts`
- Create `/src/admin/cms/blocks/schemas/block.schemas.ts`
- Write schema tests for block content, layout variants, assets, versions
- Create `/src/admin/cms/blocks/services/BlockService.ts`:
  - Consolidate from `/src/lib/cms/client.ts`, `/src/lib/cms/newSchemaClient.ts`
  - Constructor with supabase client injection
  - Methods: `getBlocks()`, `getBlockById()`, `createBlock()`, `updateBlock()`, `deleteBlock()`, `getBlockVersions()`, `createBlockVersion()`, `publishBlock()`, `getBlockAssets()`, `updateBlockAssets()`
- Write unit tests and integration tests

**7.2 CMS Blocks Hooks**

- Create `/src/admin/cms/blocks/hooks/useBlocks.ts`
- Create `/src/admin/cms/blocks/hooks/useBlock.ts`
- Create `/src/admin/cms/blocks/hooks/useBlockVersions.ts`
- Create `/src/admin/cms/blocks/hooks/useBlockPublish.ts`
- Create `/src/admin/cms/blocks/hooks/useBlockAssets.ts`
- Write tests for all hooks

### Phase 8: CMS Menus

**8.1 CMS Menus Admin Service**

- Create `/src/admin/cms/menus/types/menu.types.ts`
- Create `/src/admin/cms/menus/schemas/menu.schemas.ts`
- Write schema tests for menu structure, items, visibility rules, versions
- Create `/src/admin/cms/menus/services/MenuService.ts`:
  - Consolidate from `/src/lib/cms/menuClient.ts`
  - Constructor with supabase client injection
  - Methods: `getMenus()`, `getMenuById()`, `createMenu()`, `updateMenu()`, `deleteMenu()`, `getMenuVersions()`, `createMenuVersion()`, `publishMenu()`, `updateMenuItems()`
- Write unit tests and integration tests

**8.2 CMS Menus Public Service**

- Create `/src/public/cms/types/menu.types.ts`
- Create `/src/public/cms/schemas/menu.schemas.ts`
- Write schema tests
- Create `/src/public/cms/services/MenuResolver.ts`:
  - Refactor from `/src/lib/cms/resolver.ts` (menu-related)
  - Constructor with supabase client injection
  - Methods: `resolveMenu()`, `resolveMenuByHandle()`, `resolveSystemMenu()`
- Write unit tests and integration tests

**8.3 CMS Menus Hooks**

- Create `/src/admin/cms/menus/hooks/useMenus.ts`
- Create `/src/admin/cms/menus/hooks/useMenu.ts`
- Create `/src/admin/cms/menus/hooks/useMenuVersions.ts`
- Create `/src/admin/cms/menus/hooks/useMenuPublish.ts`
- Create `/src/public/cms/hooks/useResolvedMenu.ts`
- Write tests for all hooks

### Phase 9: CMS Pages

**9.1 CMS Pages Admin Service**

- Create `/src/admin/cms/pages/types/page.types.ts`
- Create `/src/admin/cms/pages/schemas/page.schemas.ts`
- Write schema tests for page structure, slots, SEO, nav hints, versions
- Create `/src/admin/cms/pages/services/PageService.ts`:
  - Refactor from `/src/lib/cms/services/PageService.ts`
  - Constructor with supabase client injection
  - Methods: `getPages()`, `getPageById()`, `createPage()`, `updatePage()`, `deletePage()`, `getPageVersions()`, `createPageVersion()`, `publishPage()`, `getPageSlots()`, `updatePageSlots()`
- Write unit tests and integration tests

**9.2 CMS Pages Public Service**

- Create `/src/public/cms/types/page.types.ts`
- Create `/src/public/cms/schemas/page.schemas.ts`
- Write schema tests
- Create `/src/public/cms/services/PageResolver.ts`:
  - Refactor from `/src/lib/cms/resolver.ts` (page-related)
  - Constructor with supabase client injection
  - Methods: `resolvePage()`, `resolvePageBySlug()`, `resolveSystemPage()`
- Write unit tests and integration tests

**9.3 CMS Pages Hooks**

- Create `/src/admin/cms/pages/hooks/usePages.ts`
- Create `/src/admin/cms/pages/hooks/usePage.ts`
- Create `/src/admin/cms/pages/hooks/usePageVersions.ts`
- Create `/src/admin/cms/pages/hooks/usePagePublish.ts`
- Create `/src/admin/cms/pages/hooks/usePageSlots.ts`
- Create `/src/public/cms/hooks/useResolvedPage.ts`
- Write tests for all hooks

### Phase 10: CMS Staging

**10.1 CMS Staging Service**

- Create `/src/admin/cms/staging/types/staging.types.ts`
- Create `/src/admin/cms/staging/schemas/staging.schemas.ts`
- Write schema tests for staging structure, dependencies, entity staging
- Create `/src/admin/cms/staging/services/StagingService.ts`:
  - Consolidate from `/src/lib/cms/stagingClient.ts`
  - Constructor with supabase client injection
  - Methods: `getStagings()`, `getStagingById()`, `createStaging()`, `stageSite()`, `stageEntity()`, `getStagingDependencies()`, `publishStaging()`, `rollbackStaging()`, `deleteStaging()`
- Write unit tests and integration tests

**10.2 CMS Staging Hooks**

- Create `/src/admin/cms/staging/hooks/useStagings.ts`
- Create `/src/admin/cms/staging/hooks/useStaging.ts`
- Create `/src/admin/cms/staging/hooks/useStagingDependencies.ts`
- Create `/src/admin/cms/staging/hooks/useStagingPublish.ts`
- Write tests for all hooks

### Phase 11: CMS Audit

**11.1 CMS Audit Service**

- Create `/src/admin/cms/audit/types/audit.types.ts`
- Create `/src/admin/cms/audit/schemas/audit.schemas.ts`
- Write schema tests
- Create `/src/admin/cms/audit/services/AuditService.ts`:
  - Consolidate from `/src/lib/cms/auditClient.ts`, `/src/lib/cms/auditIntegration.ts`
  - Constructor with supabase client injection
  - Methods: `getAuditLogs()`, `getAuditLogsByEntity()`, `trackChange()`
- Write unit tests and integration tests

**11.2 CMS Audit Hooks**

- Create `/src/admin/cms/audit/hooks/useAuditLogs.ts`
- Write tests for all hooks

### Phase 12: Components & UI Layer

**12.1 Update Admin Components**

- Update all admin components to use new hooks (no direct service/supabase calls)
- Move components to appropriate feature directories
- Ensure proper separation: component → hook → service → supabase
- Review for infinite loops in useEffect dependencies
- Review for proper React best practices (keys, memoization, etc.)
- Store all component state in Redux (admin store)

**12.2 Update Public Components**

- Update all public components to use new hooks
- Move components to appropriate feature directories
- Ensure proper separation
- Review for infinite loops and best practices
- Store all component state in Redux (public store)

**12.3 Update Contexts**

- Refactor contexts to use new service architecture
- Ensure contexts don't directly call supabase (use services)
- Update context providers throughout app
- Ensure persistent storage saturates Redux state

### Phase 13: Integration & Cleanup

**13.1 Update Imports**

- Update all imports to reflect new structure
- Remove old import paths from `/src/lib/` and `/src/shell/`
- Update tsconfig paths if needed

**13.2 Delete Old Directories**

- Delete `/src/lib/` (after verifying all code moved)
- Delete `/src/shell/` (after verifying all code moved)
- Delete duplicate/obsolete files

**13.3 Linting & Type Checking**

- Run ESLint and fix all errors
- Run TypeScript compiler and fix all errors
- Ensure no unused imports or variables

**13.4 Final Integration Tests**

- Run `npm run db:reset` to reset local database
- Run full integration test suite in dependency order
- Verify all services work end-to-end
- Test edge function integrations

**13.5 Documentation**

- Update README.md with new architecture
- Document service architecture and patterns
- Document testing strategy
- Create migration guide for future changes

## Testing Strategy

### Unit Tests

- All Zod schemas: valid inputs, invalid inputs, edge cases, boundary conditions, nefarious inputs
- All services: mock supabase client, test each method independently
- All hooks: mock services, test hook behavior and state management

### Integration Tests

- Run against local Supabase after `npm run db:reset`
- Test services in dependency order (seed data if needed)
- Test complete workflows (create → read → update → delete)
- Test edge cases and error conditions
- Reset database between test suites

### Security Review

- Review all service methods for SQL injection vulnerabilities
- Verify RLS policies are respected
- Check input validation is comprehensive
- Verify no sensitive data leaks in responses
- Test with malicious inputs

### Performance Review

- Check for N+1 queries
- Verify proper pagination
- Check for unnecessary database calls
- Review service method efficiency

## Key Files & Patterns

### Service Pattern

```typescript
// /src/admin/FEATURE/services/FeatureService.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/core/types/database.types';
import { FeatureSchema } from '../schemas/feature.schemas';
import type { Feature, CreateFeatureInput } from '../types/feature.types';

export class FeatureService {
  private readonly supabase: SupabaseClient<Database>;

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase;
  }

  public async getFeatures(): Promise<Result<Feature[]>> {
    // Implementation with error handling, validation
  }
}
```

### Hook Pattern

```typescript
// /src/admin/FEATURE/hooks/useFeatures.ts
import { useQuery } from '@tanstack/react-query';
import { FeatureService } from '../services/FeatureService';
import { supabase } from '@/core/supabase';

const featureService = new FeatureService(supabase);

export function useFeatures() {
  return useQuery({
    queryKey: ['features'],
    queryFn: () => featureService.getFeatures(),
  });
}
```

### Schema Pattern

```typescript
// /src/admin/FEATURE/schemas/feature.schemas.ts
import { z } from 'zod';

export const FeatureSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  created_at: z.string().datetime(),
  // ... match database schema exactly
});

export const CreateFeatureInputSchema = FeatureSchema.omit({
  id: true,
  created_at: true,
});
```

### Redux Store Pattern

```typescript
// /src/admin/store/slices/featureSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FeatureState {
  items: Feature[];
  loading: boolean;
  error: string | null;
}

const initialState: FeatureState = {
  items: [],
  loading: false,
  error: null,
};

export const featureSlice = createSlice({
  name: 'feature',
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<Feature[]>) => {
      state.items = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});
```

## Success Criteria

- [ ] No files remain in `/src/lib/` or `/src/shell/`
- [ ] All services use constructor injection
- [ ] All components only use hooks (no direct service/supabase calls)
- [ ] All hooks only use services (no direct supabase calls)
- [ ] All services have 100% test coverage
- [ ] All hooks have comprehensive tests
- [ ] All Zod schemas have comprehensive tests
- [ ] All integration tests pass after `npm run db:reset`
- [ ] No linting errors
- [ ] No TypeScript errors
- [ ] Security review completed
- [ ] Performance review completed
- [ ] Documentation updated
- [ ] Two separate Redux stores (admin and public)
- [ ] Persistent storage saturates Redux state
- [ ] No mock or example data anywhere
- [ ] No hardcoded values
- [ ] Analytics is public-only (no admin analytics)
- [ ] Permissions are system-level feature
- [ ] Project configurations are correct for styles
- [ ] Package dependencies unchanged
