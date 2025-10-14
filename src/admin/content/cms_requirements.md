# Content Management System Architecture and Schema Requirements

## Overview

This document describes the requirements, architecture, and database
schema for a structured, design-safe Content Management feature
supporting: - Page and block creation - Reusable and referenceable
content blocks - Managed assets with metadata - Referential updates
(changes propagate) - Structured menus - Versioning and publishing for
all objects - Compatible with Supabase, GitHub Pages, React, React
Native, and Next.js

------------------------------------------------------------------------

## Page and Block Layouts

### Page Layouts

1.  **Landing / Marketing**
    -   Hero → Feature grid → Social proof → CTA → Footer
2.  **Article / Blog Post**
    -   Title → Meta → Body → Related posts → Comments
3.  **Documentation / Knowledge Base**
    -   Sidebar → Content → Version switcher → Navigation
4.  **Catalog / Listing**
    -   Filter bar → Grid/List → Pagination
5.  **Detail (Product / Case Study)**
    -   Media gallery → Key facts → Description → Related
6.  **Feature Page**
    -   Alternating media-text sections → CTA
7.  **Pricing**
    -   Plan cards → Comparison → FAQ → CTA
8.  **Gallery / Portfolio**
    -   Masonry grid → Lightbox → Filters
9.  **Search Results**
    -   Query box → Results → Facets → Empty state
10. **Utility / System Page**

-   Title → Body → Actions

### Content Block Layouts

-   **Rich Text**
-   **Hero**
-   **Section Header**
-   **Callout / Note**
-   **Feature Card**
-   **Card Grid**
-   **Media + Text (Split)**
-   **Timeline / Steps**
-   **FAQ (Accordion)**
-   **Testimonial**
-   **Logo Wall**
-   **Stat / KPI**
-   **Pricing Table**
-   **Comparison Table**
-   **Data Table**
-   **Image**
-   **Video**
-   **Gallery / Carousel**
-   **Code Block**
-   **Embed**
-   **CTA**
-   **Form (Lite)**
-   **Breadcrumbs / Pagination**

------------------------------------------------------------------------

## Authoring Environment Organization

### Primary Hubs

**Pages** -- hierarchical site map view with drag-drop slots for
blocks.\
**Blocks** -- reusable content library organized by type or tags.\
**Assets** -- central media repository with metadata editing.

### Navigation

  Section    Purpose
  ---------- -------------------------------------------
  Pages      Manage page structure and metadata
  Blocks     Manage reusable content components
  Assets     Manage media files and metadata
  Settings   Global configuration, menus, SEO defaults

### Workflows

-   **Page editing:** Choose template → Add blocks → Edit content →
    Preview → Publish.
-   **Reusable blocks:** Create once → Reference on multiple pages →
    Update propagates.
-   **Assets:** Upload once → Reuse in blocks → Metadata updates
    propagate.

------------------------------------------------------------------------

## Menu Management

### Principle

Menus are **first-class objects**, separate from pages.\
Pages provide **navigation hints**, but menus define structure,
ordering, and visibility.

### Menu Data Model

``` ts
type Menu = {
  id: string;
  handle: 'top' | 'footer' | string;
  label: string;
  items: MenuItem[];
  rules?: MenuRule[];
  version: number;
  status: 'draft' | 'published';
};

type MenuItem = {
  id: string;
  type: 'page' | 'external' | 'anchor' | 'separator' | 'group';
  label: string;
  pageRef?: string;
  url?: string;
  children?: MenuItem[];
  visibility?: {
    device?: ('mobile' | 'desktop')[];
    audience?: ('anon' | 'user' | 'admin')[];
  };
};
```

Menus control ordering, hierarchy, and allow external/non-page links.\
Each page may appear in multiple menus.

------------------------------------------------------------------------

## Database Schema (Postgres / Supabase)

-   Versioning through separate `_version` tables and `_publish`
    pointers
-   JSONB fields for flexible content (`slots`, `items`, `rules`)
-   Referential consistency via `uuid` references
-   Publishing by updating pointer rows

Includes: - `site` - `page`, `page_version`, `page_publish` - `block`,
`block_version`, `block_publish` - `menu`, `menu_version`,
`menu_publish` - `asset`, `asset_version`, `asset_publish`

------------------------------------------------------------------------

## JSON Shapes

### BlockInstance

``` json
{
  "slot": "main",
  "order": 1,
  "block_id": "uuid",
  "follow_latest": true,
  "instance_props": {}
}
```

### MenuItem

``` json
{
  "id": "uuid",
  "type": "page",
  "label": "Home",
  "page_id": "uuid",
  "children": []
}
```

------------------------------------------------------------------------

## TypeScript Interfaces

Interfaces mirror the versioned database entities and resolved API
payloads.

-   `ResolvedPage`
-   `ResolvedBlock`
-   `ResolvedMenu`
-   `MenuItem`
-   `ResolvedAsset`
-   `CMSApi`

Each supports draft vs published modes, locale awareness, and resolved
relationships.

------------------------------------------------------------------------

## Publishing Workflow

1.  Draft saved as new `_version` record.
2.  Publish action updates the `_publish` pointer.
3.  Previous versions remain immutable for rollback.
4.  Referenced entities (blocks, assets) follow latest published version
    by default.

------------------------------------------------------------------------

## SPA / PWA Integration

-   Static export for GitHub Pages via pre-fetch of published JSON
    payloads.
-   React Native offline cache via AsyncStorage keyed by
    `(site, slug, locale, version)`.
-   Supabase Edge Functions resolve published content trees.

------------------------------------------------------------------------

## Summary

**Design goals:** - Maintain strict layout control while empowering
content editing. - Provide strong versioning, references, and
predictable publishing. - Support both static and dynamic delivery. -
Keep schema normalized but pragmatic (JSONB for structured subtrees).
