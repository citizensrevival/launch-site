# Refactor Inventory - Launch Site

## Current State Analysis

### Database Schema (Source of Truth)
Located in: `/src/lib/database.types.ts`

**Features Identified:**
1. **Analytics** - Tables: `analytics_events`, `analytics_pageviews`, `analytics_sessions`, `analytics_users`, `analytics_excluded_users`
2. **Leads** - Tables: `leads_submissions`
3. **CMS** - Tables: `cms_assets`, `cms_blocks`, `cms_menus`, `cms_pages` (with their version/publish tables)
4. **System** - Tables: `system_sites`, `system_users`, `system_user_permissions`, `system_audit_log`
5. **Staging** - Tables: `site_staging`, `staging_dependency`

### Current File Structure

#### `/supabase/functions/` (14 files)
**Edge Functions (Deployment Artifacts):**
- `_lib/db.ts` - Database utilities
- `_lib/identity.ts` - Identity utilities
- `_lib/validation.ts` - Validation utilities
- `ingest-batch/index.ts` - Analytics batch ingestion
- `ingest-end-session/index.ts` - Analytics session end
- `ingest-event/index.ts` - Analytics event tracking
- `ingest-heartbeat/index.ts` - Analytics heartbeat
- `ingest-pageview/index.ts` - Analytics pageview tracking
- `ingest-start-session/index.ts` - Analytics session start
- `ingest-update-session-context/index.ts` - Analytics session context
- `ingest-upsert-user/index.ts` - Analytics user upsert
- `process-asset-variants/index.ts` - CMS asset processing
- `resolveMenu/index.ts` - CMS menu resolution
- `resolvePage/index.ts` - CMS page resolution

**Action:** Keep in place, extract shared types to feature folders

#### `/src/lib/` (22 files + subdirs)
**TO BE ELIMINATED - Redistributed to features:**

**CMS Files:**
- `cms/auditClient.ts` → `/src/admin/cms/services/`
- `cms/auditHooks.ts` → `/src/admin/cms/hooks/`
- `cms/auditIntegration.ts` → `/src/admin/cms/services/`
- `cms/blockTypes.ts` → `/src/admin/cms/types/`
- `cms/client.ts` → `/src/admin/cms/services/`
- `cms/hooks.ts` → `/src/admin/cms/hooks/`
- `cms/hooks/sites.ts` → `/src/admin/cms/hooks/`
- `cms/interfaces/SupabaseClient.ts` → `/src/core/types/`
- `cms/menuClient.ts` → `/src/admin/cms/services/`
- `cms/migration/ContentMigration.ts` → `/src/admin/cms/services/`
- `cms/newSchemaClient.ts` → `/src/admin/cms/services/`
- `cms/newSchemaHooks.ts` → `/src/admin/cms/hooks/`
- `cms/permissionsClient.ts` → `/src/admin/cms/services/`
- `cms/permissionsHooks.tsx` → `/src/admin/cms/hooks/`
- `cms/resolver.ts` → `/src/public/cms/services/`
- `cms/resolverHooks.ts` → `/src/public/cms/hooks/`
- `cms/schemas.ts` → `/src/admin/cms/schemas/`
- `cms/services/PageService.ts` → `/src/admin/cms/services/`
- `cms/stagingClient.ts` → `/src/admin/cms/services/`
- `cms/stagingHooks.ts` → `/src/admin/cms/hooks/`
- `cms/types.ts` → `/src/admin/cms/types/`
- `cms/utils.ts` → `/src/admin/cms/utils/`

**Database Types:**
- `database.types.ts` → `/src/core/types/database.types.ts`

#### `/src/shell/` (44 files)
**TO BE ELIMINATED - Redistributed:**

**Core/Shared Components:**
- `Button.tsx` → `/src/core/components/`
- `FormattedDate.tsx` → `/src/core/components/`
- `IconLink.tsx` → `/src/core/components/`
- `Intro.tsx` → `/src/core/components/`
- `Layout.tsx` → `/src/core/components/`
- `LoadingScreen.tsx` → `/src/core/components/`
- `Logo.tsx` → `/src/core/components/`
- `Menu.tsx` → `/src/core/components/`
- `Section.tsx` → `/src/core/components/`
- `SimpleLayout.tsx` → `/src/core/components/`
- `ThemeToggle.tsx` → `/src/core/components/`
- `Tooltip.tsx` → `/src/core/components/`
- `SignUpForm.tsx` → `/src/public/components/` (or core if used by admin)
- `GetInvolvedDialog.tsx` → `/src/public/components/`
- `GetInvolvedForm.tsx` → `/src/public/components/`

**Contexts:**
- `contexts/AnalyticsContext.tsx` → `/src/core/contexts/` (used by both)
- `contexts/AuthContext.tsx` → `/src/core/contexts/` (used by both)
- `contexts/SiteContext.tsx` → `/src/core/contexts/` (used by both)
- `contexts/ThemeContext.tsx` → `/src/core/contexts/` (used by both)

**Hooks:**
- `hooks/useAnalyticsPageview.ts` → `/src/core/hooks/`
- `hooks/useGetInvolvedDialog.ts` → `/src/public/hooks/`
- `hooks/useNavigationLoading.ts` → `/src/core/hooks/`

**Services (TO BE REFACTORED):**
- `lib/AnalyticsService.ts` → `/src/admin/analytics/services/AnalyticsService.ts`
- `lib/analyticsTracker.ts` → `/src/public/analytics/services/AnalyticsTracker.ts`
- `lib/analyticsTypes.ts` → `/src/admin/analytics/types/`
- `lib/LeadsAdmin.ts` → `/src/admin/leads/services/LeadsService.ts`
- `lib/LeadsPublic.ts` → `/src/public/leads/services/LeadsService.ts`
- `lib/SiteSettingsManager.ts` → `/src/admin/system/services/SiteSettingsService.ts`
- `lib/supabase.ts` → `/src/core/supabase.ts`
- `lib/types.ts` → Distribute to appropriate feature types
- `lib/database.types.ts` → DELETE (duplicate)
- `lib/index.ts` → DELETE

**Redux Store:**
- `store/` → `/src/core/store/` (if used by both) or `/src/admin/store/` (if admin-only)

**Styles:**
- `styles/` → `/src/core/styles/`

**Fonts:**
- `fonts/` → `/src/core/fonts/`

**Other:**
- `vite-env.d.ts` → `/src/core/vite-env.d.ts`

#### `/src/admin/` (60 files)
**Current Admin Features:**
- `analytics/` - 10 files (needs service/hooks refactor)
- `cms/` - 38 files (needs reorganization)
- `leads/` - 1 file (needs service/hooks)
- `settings/` - 2 files (needs service/hooks)

**Files to keep/reorganize:**
- `AdminDashboard.tsx` ✓
- `AdminLayout.tsx` ✓
- `AdminLoginForm.tsx` ✓
- `AdminRoute.tsx` ✓
- `TimeRangeToolbar.tsx` ✓
- `index.ts` ✓

#### `/src/public/` (10 files)
**Current Public Features:**
- `pages/` - 8 files
- `HomePage.tsx` ✓
- `TestPage.tsx` ✓

#### `/src/__tests__/` (15 files)
**Current Test Structure:**
- `client/` - Block client tests
- `components/` - Component tests
- `database/` - Schema validation tests
- `hooks/` - Hook tests
- `schemas/` - Schema tests
- `services/` - Service tests
- `staging/` - Staging tests
- `setup.ts` ✓

**Action:** Reorganize to mirror new source structure

### New Target Structure

```
/src/
  ├── core/                          # Shared by both admin and public
  │   ├── components/               # Shared UI components
  │   ├── contexts/                 # Shared contexts (Auth, Theme, Site, Analytics)
  │   ├── hooks/                    # Shared hooks
  │   ├── services/                 # Base service classes
  │   ├── store/                    # Redux store (if shared)
  │   ├── styles/                   # Global styles
  │   ├── fonts/                    # Font files
  │   ├── types/                    # Core types
  │   │   ├── database.types.ts
  │   │   └── supabase.types.ts
  │   ├── schemas/                  # Core Zod schemas
  │   ├── utils/                    # Shared utilities
  │   ├── supabase.ts              # Supabase client singleton
  │   └── vite-env.d.ts
  │
  ├── admin/                        # Admin dashboard
  │   ├── analytics/
  │   │   ├── components/
  │   │   ├── hooks/
  │   │   │   ├── useAnalyticsData.ts
  │   │   │   ├── useAnalyticsOverview.ts
  │   │   │   ├── useEventsData.ts
  │   │   │   ├── useReferrersData.ts
  │   │   │   ├── useSessionsData.ts
  │   │   │   ├── useUsersData.ts
  │   │   │   └── __tests__/
  │   │   ├── services/
  │   │   │   ├── AnalyticsService.ts
  │   │   │   └── __tests__/
  │   │   ├── schemas/
  │   │   │   └── __tests__/
  │   │   ├── types/
  │   │   ├── pages/                # Analytics page components
  │   │   └── index.ts
  │   │
  │   ├── cms/
  │   │   ├── assets/
  │   │   │   ├── components/
  │   │   │   ├── hooks/
  │   │   │   │   └── __tests__/
  │   │   │   ├── services/
  │   │   │   │   ├── AssetService.ts
  │   │   │   │   └── __tests__/
  │   │   │   ├── schemas/
  │   │   │   │   └── __tests__/
  │   │   │   └── types/
  │   │   ├── blocks/
  │   │   │   ├── components/
  │   │   │   ├── hooks/
  │   │   │   │   └── __tests__/
  │   │   │   ├── services/
  │   │   │   │   ├── BlockService.ts
  │   │   │   │   └── __tests__/
  │   │   │   ├── schemas/
  │   │   │   │   └── __tests__/
  │   │   │   └── types/
  │   │   ├── menus/
  │   │   │   ├── components/
  │   │   │   ├── hooks/
  │   │   │   │   └── __tests__/
  │   │   │   ├── services/
  │   │   │   │   ├── MenuService.ts
  │   │   │   │   └── __tests__/
  │   │   │   ├── schemas/
  │   │   │   │   └── __tests__/
  │   │   │   └── types/
  │   │   ├── pages/
  │   │   │   ├── components/
  │   │   │   ├── hooks/
  │   │   │   │   └── __tests__/
  │   │   │   ├── services/
  │   │   │   │   ├── PageService.ts
  │   │   │   │   └── __tests__/
  │   │   │   ├── schemas/
  │   │   │   │   └── __tests__/
  │   │   │   └── types/
  │   │   ├── staging/
  │   │   │   ├── components/
  │   │   │   ├── hooks/
  │   │   │   │   └── __tests__/
  │   │   │   ├── services/
  │   │   │   │   ├── StagingService.ts
  │   │   │   │   └── __tests__/
  │   │   │   ├── schemas/
  │   │   │   │   └── __tests__/
  │   │   │   └── types/
  │   │   ├── audit/
  │   │   │   ├── hooks/
  │   │   │   │   └── __tests__/
  │   │   │   ├── services/
  │   │   │   │   ├── AuditService.ts
  │   │   │   │   └── __tests__/
  │   │   │   ├── schemas/
  │   │   │   │   └── __tests__/
  │   │   │   └── types/
  │   │   ├── permissions/
  │   │   │   ├── components/
  │   │   │   ├── hooks/
  │   │   │   │   └── __tests__/
  │   │   │   ├── services/
  │   │   │   │   ├── PermissionsService.ts
  │   │   │   │   └── __tests__/
  │   │   │   ├── schemas/
  │   │   │   │   └── __tests__/
  │   │   │   └── types/
  │   │   ├── components/           # Shared CMS components
  │   │   ├── pages/                # CMS page components
  │   │   └── index.ts
  │   │
  │   ├── leads/
  │   │   ├── components/
  │   │   ├── hooks/
  │   │   │   ├── useLeads.ts
  │   │   │   └── __tests__/
  │   │   ├── services/
  │   │   │   ├── LeadsService.ts
  │   │   │   └── __tests__/
  │   │   ├── schemas/
  │   │   │   └── __tests__/
  │   │   ├── types/
  │   │   ├── pages/
  │   │   └── index.ts
  │   │
  │   ├── system/
  │   │   ├── sites/
  │   │   │   ├── hooks/
  │   │   │   │   └── __tests__/
  │   │   │   ├── services/
  │   │   │   │   ├── SiteService.ts
  │   │   │   │   └── __tests__/
  │   │   │   ├── schemas/
  │   │   │   │   └── __tests__/
  │   │   │   └── types/
  │   │   ├── users/
  │   │   │   ├── components/
  │   │   │   ├── hooks/
  │   │   │   │   └── __tests__/
  │   │   │   ├── services/
  │   │   │   │   ├── UserService.ts
  │   │   │   │   └── __tests__/
  │   │   │   ├── schemas/
  │   │   │   │   └── __tests__/
  │   │   │   ├── types/
  │   │   │   └── pages/
  │   │   ├── audit/
  │   │   │   ├── hooks/
  │   │   │   │   └── __tests__/
  │   │   │   ├── services/
  │   │   │   │   ├── AuditLogService.ts
  │   │   │   │   └── __tests__/
  │   │   │   ├── schemas/
  │   │   │   │   └── __tests__/
  │   │   │   └── types/
  │   │   └── index.ts
  │   │
  │   ├── components/               # Shared admin components
  │   ├── contexts/                 # Admin-specific contexts (if any)
  │   ├── store/                    # Admin Redux store (if admin-only)
  │   ├── AdminDashboard.tsx
  │   ├── AdminLayout.tsx
  │   ├── AdminLoginForm.tsx
  │   ├── AdminRoute.tsx
  │   └── index.ts
  │
  ├── public/                       # Public website
  │   ├── analytics/
  │   │   ├── services/
  │   │   │   ├── AnalyticsTracker.ts
  │   │   │   └── __tests__/
  │   │   ├── schemas/
  │   │   │   └── __tests__/
  │   │   └── types/
  │   │
  │   ├── cms/
  │   │   ├── hooks/
  │   │   │   ├── useResolvedPage.ts
  │   │   │   ├── useResolvedMenu.ts
  │   │   │   └── __tests__/
  │   │   ├── services/
  │   │   │   ├── PageResolver.ts
  │   │   │   ├── MenuResolver.ts
  │   │   │   └── __tests__/
  │   │   ├── schemas/
  │   │   │   └── __tests__/
  │   │   └── types/
  │   │
  │   ├── leads/
  │   │   ├── components/
  │   │   ├── hooks/
  │   │   │   ├── useLeadSubmission.ts
  │   │   │   └── __tests__/
  │   │   ├── services/
  │   │   │   ├── LeadsService.ts
  │   │   │   └── __tests__/
  │   │   ├── schemas/
  │   │   │   └── __tests__/
  │   │   └── types/
  │   │
  │   ├── components/               # Public UI components
  │   ├── pages/                    # Public page components
  │   ├── HomePage.tsx
  │   └── index.ts
  │
  ├── App.tsx
  └── index.tsx

/supabase/
  ├── functions/                    # Edge functions (deployment artifacts)
  │   ├── _lib/                    # Shared edge function utilities
  │   ├── ingest-*/                # Analytics ingestion functions
  │   ├── process-asset-variants/  # CMS asset processing
  │   ├── resolveMenu/             # CMS menu resolution
  │   └── resolvePage/             # CMS page resolution
  ├── migrations/                   # Database migrations
  └── config.toml
```

## Files to Delete
- `/src/lib/` (entire directory after redistribution)
- `/src/shell/` (entire directory after redistribution)
- `/src/shell/lib/database.types.ts` (duplicate)
- `/src/shell/lib/index.ts`

## Feature Breakdown

### 1. Analytics
**Admin:**
- Service: AnalyticsService (query/aggregate analytics data)
- Hooks: useAnalyticsData, useAnalyticsOverview, useEventsData, etc.
- Components: Charts, tables, dashboards

**Public:**
- Service: AnalyticsTracker (track events/pageviews)
- No direct UI components (tracking only)

**Edge Functions:**
- ingest-* functions (7 files)

### 2. Leads
**Admin:**
- Service: LeadsService (search, filter, export leads)
- Hooks: useLeads, useLeadSearch
- Components: Lead table, filters, export

**Public:**
- Service: LeadsService (submit leads)
- Hooks: useLeadSubmission
- Components: Lead forms

### 3. CMS
**Admin:**
- Assets: AssetService, hooks, components
- Blocks: BlockService, hooks, components
- Menus: MenuService, hooks, components
- Pages: PageService, hooks, components
- Staging: StagingService, hooks, components
- Audit: AuditService, hooks, components
- Permissions: PermissionsService, hooks, components

**Public:**
- Services: PageResolver, MenuResolver
- Hooks: useResolvedPage, useResolvedMenu

**Edge Functions:**
- process-asset-variants
- resolveMenu
- resolvePage

### 4. System
**Admin:**
- Sites: SiteService, hooks
- Users: UserService, hooks, components
- Audit: AuditLogService, hooks

## Implementation Priority

### Phase 1: Core Foundation
1. Create new directory structure
2. Move/refactor core files (supabase client, types, contexts)
3. Create base service class
4. Create core schemas

### Phase 2: Edge Functions
1. Review edge function types
2. Extract types to feature folders
3. Create Zod schemas for edge function inputs/outputs
4. Write comprehensive tests

### Phase 3: Services (Bottom-Up)
**Order by dependencies:**
1. System Services (sites, users, audit log)
2. Analytics Services (admin + public)
3. Leads Services (admin + public)
4. CMS Services (assets, blocks, menus, pages, staging, audit, permissions)

For each service:
- Define TypeScript interfaces/types
- Create Zod schemas with tests
- Implement service class with dependency injection
- Write unit tests
- Write integration tests

### Phase 4: Hooks
For each feature:
- Implement React hooks that use services
- Write unit tests
- Write integration tests

### Phase 5: Components
For each feature:
- Update components to use hooks
- Remove direct service/supabase usage
- Verify no infinite loops
- Manual testing only (no automated tests)

### Phase 6: Cleanup
1. Delete old directories
2. Update imports across codebase
3. Run linter and fix issues
4. Final integration test pass

