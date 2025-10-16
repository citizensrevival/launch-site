
Title: CMS Architecture, Database Schema, and Client API (Supabase + React/Next.js/React Native)

Summary:
This document specifies a production-ready content platform supporting SPAs/PWAs and headless delivery. It covers: data model, Supabase/Postgres schema (DDL), TypeScript client interfaces, Zod validators, sample Supabase Edge Functions for resolution, and suggested RLS policies. It also encodes the menu system and versioning/publishing semantics for all objects (pages, blocks, menus, assets).

---

Section: Core Principles
- All entities are immutable once versioned; publish moves pointers.
- Reuse via references: pages reference blocks; blocks reference assets; menus reference pages/URLs.
- Resolved read APIs return hydrated, render-ready JSON (low-latency clients).
- JSONB used for well-bounded trees (page slots, menu items, rules).

---

Section: Postgres / Supabase DDL

```sql

create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- Multi-tenant site
create table if not exists site (
  id uuid primary key default gen_random_uuid(),
  handle text unique not null,
  label text not null,
  default_locale text not null default 'en-US',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger trg_site_updated before update on site
for each row execute function touch_updated_at();

-- Common enums
do $$ begin
  create type publish_status as enum ('draft','staged','published','archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type asset_kind as enum ('image','video','file');
exception when duplicate_object then null; end $$;

-- PAGES
create table if not exists page (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references site(id) on delete cascade,
  slug text not null,
  unique (site_id, slug)
);

create table if not exists page_version (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references page(id) on delete cascade,
  version int not null,
  title text not null,
  locale text not null default 'en-US',
  template text not null,
  seo jsonb not null default '{}'::jsonb,
  nav_hints jsonb not null default '{}'::jsonb,
  slots jsonb not null default '[]'::jsonb,
  status publish_status not null default 'draft',
  created_at timestamptz not null default now(),
  created_by uuid not null,
  unique (page_id, version)
);

create table if not exists page_publish (
  page_id uuid not null references page(id) on delete cascade,
  locale text not null default 'en-US',
  version int not null,
  published_at timestamptz not null default now(),
  primary key (page_id, locale)
);

-- BLOCKS (reusable)
create table if not exists block (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references site(id) on delete cascade,
  type text not null,
  tag text
);

create table if not exists block_version (
  id uuid primary key default gen_random_uuid(),
  block_id uuid not null references block(id) on delete cascade,
  version int not null,
  layout_variant text not null,
  content jsonb not null,
  assets jsonb not null default '[]'::jsonb,
  status publish_status not null default 'draft',
  created_at timestamptz not null default now(),
  created_by uuid not null,
  unique (block_id, version)
);

create table if not exists block_publish (
  block_id uuid not null references block(id) on delete cascade,
  version int not null,
  published_at timestamptz not null default now(),
  primary key (block_id)
);

-- MENUS
create table if not exists menu (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references site(id) on delete cascade,
  handle text not null,
  label text not null,
  unique (site_id, handle)
);

create table if not exists menu_version (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references menu(id) on delete cascade,
  version int not null,
  locale text not null default 'en-US',
  items jsonb not null default '[]'::jsonb,
  rules jsonb not null default '[]'::jsonb,
  status publish_status not null default 'draft',
  created_at timestamptz not null default now(),
  created_by uuid not null,
  unique (menu_id, version, locale)
);

create table if not exists menu_publish (
  menu_id uuid not null references menu(id) on delete cascade,
  locale text not null default 'en-US',
  version int not null,
  published_at timestamptz not null default now(),
  primary key (menu_id, locale)
);

-- ASSETS
create table if not exists asset (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references site(id) on delete cascade,
  kind asset_kind not null,
  storage_key text not null,
  width int, height int, duration_ms int,
  checksum text,
  created_at timestamptz not null default now(),
  created_by uuid not null
);

create table if not exists asset_version (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references asset(id) on delete cascade,
  version int not null,
  meta jsonb not null default '{}'::jsonb,
  status publish_status not null default 'draft',
  created_at timestamptz not null default now(),
  created_by uuid not null,
  unique (asset_id, version)
);

create table if not exists asset_publish (
  asset_id uuid not null references asset(id) on delete cascade,
  version int not null,
  published_at timestamptz not null default now(),
  primary key (asset_id)
);

-- OPTIONAL USAGE TRACKING
create table if not exists asset_usage (
  site_id uuid not null references site(id) on delete cascade,
  asset_id uuid not null references asset(id) on delete cascade,
  used_by_type text not null,
  used_by_id uuid not null,
  primary key (asset_id, used_by_type, used_by_id)
);

-- Indexes
create index if not exists idx_page_site_slug on page(site_id, slug);
create index if not exists idx_page_ver_page on page_version(page_id);
create index if not exists idx_block_site on block(site_id);
create index if not exists idx_block_ver_block on block_version(block_id);
create index if not exists idx_asset_site on asset(site_id);
create index if not exists idx_asset_ver_asset on asset_version(asset_id);
```


Section: JSON Shapes

BlockInstance in page_version.slots:
```json

{
  "slot": "main",
  "order": 1,
  "block_id": "uuid",
  "follow_latest": true,
  "pinned_block_version_id": null,
  "instance_props": {}
}
```

MenuItem in menu_version.items:
```json

{
  "id": "string-or-uuid",
  "type": "page|external|anchor|separator|group",
  "label": "Products",
  "page_id": "uuid-when-type-page",
  "url": "/#integrations-when-external-or-anchor",
  "target": "_self",
  "rel": ["nofollow","noopener"],
  "badge": {"text":"New","tone":"info"},
  "children": [],
  "visibility": {
    "device": ["mobile","desktop"],
    "audience": ["anon","user","admin"],
    "featureFlags": ["nav-v2"],
    "schedule": {"start":"2025-10-01T00:00:00Z","end":null}
  },
  "styleHint": "legal"
}
```

MenuRule example:
```json

{
  "name": "Docs subtree",
  "include": {"pathPrefix": "/docs", "tag": "docs"},
  "exclude": {"slugs": ["/docs/legacy"]},
  "sort": "priority",
  "cap": 50,
  "placement": {"parentItemId": null, "position": "end"},
  "labelFrom": "page.nav.defaultLabel"
}
```

Section: TypeScript Interfaces (Client API)
```ts

export type PublishStatus = 'draft' | 'staged' | 'published' | 'archived';
export type LocaleString = string;

export type Visibility = {
  device?: Array<'mobile' | 'desktop'>;
  audience?: Array<'anon' | 'user' | 'admin'>;
  featureFlags?: string[];
  schedule?: { start?: string; end?: string };
};

export interface AssetMeta {
  alt?: string;
  caption?: string;
  license?: string;
  tags?: string[];
  focal_point?: { x: number; y: number };
}

export interface ResolvedAsset {
  id: string;
  kind: 'image' | 'video' | 'file';
  url: string;
  width?: number;
  height?: number;
  durationMs?: number;
  meta: AssetMeta;
}

export interface BlockInstance {
  slot: string;
  order: number;
  blockId: string;
  followLatest?: boolean;
  pinnedBlockVersionId?: string | null;
  instanceProps?: Record<string, unknown>;
}

export interface ResolvedBlock {
  blockId: string;
  blockVersionId: string;
  type: string;
  layoutVariant: string;
  content: Record<string, unknown>;
  assets: Array<{ role: string; asset: ResolvedAsset }>;
  instanceProps?: Record<string, unknown>;
}

export interface ResolvedPage {
  siteHandle: string;
  slug: string;
  locale: LocaleString;
  version: number;
  title: string;
  template: string;
  seo: Record<string, unknown>;
  slots: Record<string, ResolvedBlock[]>;
}

export type MenuItemType = 'page' | 'external' | 'anchor' | 'separator' | 'group';

export interface MenuItemBase {
  id: string;
  type: MenuItemType;
  label?: string;
  target?: '_self' | '_blank';
  rel?: Array<'nofollow' | 'noopener' | 'sponsored'>;
  badge?: { text: string; tone: 'info' | 'success' | 'warning' };
  visibility?: Visibility;
  styleHint?: 'legal' | 'secondary';
  children?: MenuItem[];
}

export interface MenuItemPage extends MenuItemBase {
  type: 'page';
  pageId: string;
}

export interface MenuItemExternal extends MenuItemBase {
  type: 'external' | 'anchor';
  url: string;
}

export interface MenuItemSeparator extends MenuItemBase {
  type: 'separator';
}

export interface MenuItemGroup extends MenuItemBase {
  type: 'group';
}

export type MenuItem =
  | MenuItemPage
  | MenuItemExternal
  | MenuItemSeparator
  | MenuItemGroup;

export interface MenuRule {
  name: string;
  include?: { pathPrefix?: string; tag?: string; section?: string };
  exclude?: { slugs?: string[] };
  sort?: 'alpha' | 'priority' | 'lastUpdated';
  cap?: number;
  placement?: { parentItemId?: string | null; position?: 'start' | 'end' };
  labelFrom?: 'page.title' | 'page.nav.defaultLabel';
}

export interface ResolvedMenu {
  handle: string;
  locale: LocaleString;
  version: number;
  items: MenuItem[];
}

export interface CMSApi {
  getResolvedPage(params: {
    siteHandle: string;
    slug: string;
    locale?: LocaleString;
    mode?: 'published' | 'draft';
  }): Promise<ResolvedPage | null>;

  getResolvedMenu(params: {
    siteHandle: string;
    handle: string;
    locale?: LocaleString;
    mode?: 'published' | 'draft';
  }): Promise<ResolvedMenu | null>;
}
```

Section: Zod Schemas
```ts

import { z } from 'zod';

export const zVisibility = z.object({
  device: z.array(z.enum(['mobile','desktop'])).optional(),
  audience: z.array(z.enum(['anon','user','admin'])).optional(),
  featureFlags: z.array(z.string()).optional(),
  schedule: z.object({ start: z.string().optional(), end: z.string().optional() }).optional()
});

export const zResolvedAsset = z.object({
  id: z.string().uuid(),
  kind: z.enum(['image','video','file']),
  url: z.string(),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
  durationMs: z.number().int().optional(),
  meta: z.object({
    alt: z.string().optional(),
    caption: z.string().optional(),
    license: z.string().optional(),
    tags: z.array(z.string()).optional(),
    focal_point: z.object({x: z.number(), y: z.number()}).optional()
  })
});

export const zResolvedBlock = z.object({
  blockId: z.string().uuid(),
  blockVersionId: z.string().uuid(),
  type: z.string(),
  layoutVariant: z.string(),
  content: z.record(z.unknown()),
  assets: z.array(z.object({
    role: z.string(),
    asset: zResolvedAsset
  })),
  instanceProps: z.record(z.unknown()).optional()
});

export const zResolvedPage = z.object({
  siteHandle: z.string(),
  slug: z.string(),
  locale: z.string(),
  version: z.number().int(),
  title: z.string(),
  template: z.string(),
  seo: z.record(z.unknown()),
  slots: z.record(z.array(zResolvedBlock))
});

export const zMenuItem: z.ZodType<any> = z.lazy(() =>
  z.union([
    z.object({
      id: z.string(),
      type: z.literal('page'),
      label: z.string().optional(),
      target: z.enum(['_self','_blank']).optional(),
      rel: z.array(z.enum(['nofollow','noopener','sponsored'])).optional(),
      badge: z.object({text: z.string(), tone: z.enum(['info','success','warning'])}).optional(),
      visibility: zVisibility.optional(),
      styleHint: z.enum(['legal','secondary']).optional(),
      pageId: z.string().uuid(),
      children: z.array(zMenuItem).optional()
    }),
    z.object({
      id: z.string(),
      type: z.enum(['external','anchor']),
      label: z.string().optional(),
      target: z.enum(['_self','_blank']).optional(),
      rel: z.array(z.enum(['nofollow','noopener','sponsored'])).optional(),
      badge: z.object({text: z.string(), tone: z.enum(['info','success','warning'])}).optional(),
      visibility: zVisibility.optional(),
      styleHint: z.enum(['legal','secondary']).optional(),
      url: z.string(),
      children: z.array(zMenuItem).optional()
    }),
    z.object({
      id: z.string(),
      type: z.literal('separator'),
      label: z.string().optional(),
      children: z.array(zMenuItem).optional()
    }),
    z.object({
      id: z.string(),
      type: z.literal('group'),
      label: z.string().optional(),
      children: z.array(zMenuItem).optional()
    })
  ])
);

export const zResolvedMenu = z.object({
  handle: z.string(),
  locale: z.string(),
  version: z.number().int(),
  items: z.array(zMenuItem)
});
```

Section: Supabase Edge Function (TypeScript) – Resolve Page
```ts

// supabase/functions/resolvePage/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Mode = 'published' | 'draft';

serve(async (req) => {
  const url = new URL(req.url);
  const siteHandle = url.searchParams.get('siteHandle')!;
  const slug = url.searchParams.get('slug')!;
  const locale = url.searchParams.get('locale') || 'en-US';
  const mode = (url.searchParams.get('mode') || 'published') as Mode;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!
  );

  const { data: site, error: es } = await supabase
    .from('site').select('id').eq('handle', siteHandle).single();
  if (es || !site) return new Response('site not found', { status: 404 });

  const { data: page, error: ep } = await supabase
    .from('page').select('id').eq('site_id', site.id).eq('slug', slug).single();
  if (ep || !page) return new Response('page not found', { status: 404 });

  let version: number | null = null;
  if (mode === 'published') {
    const { data: pub } = await supabase
      .from('page_publish').select('version')
      .eq('page_id', page.id).eq('locale', locale).maybeSingle();
    version = pub?.version ?? null;
  } else {
    const { data: ver } = await supabase
      .from('page_version')
      .select('version,status')
      .eq('page_id', page.id).eq('locale', locale)
      .order('version', { ascending: false }).limit(1).maybeSingle();
    version = ver?.version ?? null;
  }
  if (!version) return new Response('no version', { status: 404 });

  const { data: pv } = await supabase
    .from('page_version')
    .select('title, template, seo, slots')
    .eq('page_id', page.id).eq('version', version).single();

  const slots = pv.slots as any[];
  const resolvedSlots: Record<string, any[]> = {};
  for (const inst of slots.sort((a,b) => a.order - b.order)) {
    const { data: block } = await supabase
      .from('block').select('id, type').eq('id', inst.block_id).single();

    if (inst.follow_latest) {
      const { data: pub } = await supabase
        .from('block_publish').select('version').eq('block_id', block.id).maybeSingle();
      if (!pub?.version) continue;
      const { data: bv } = await supabase
        .from('block_version').select('id,layout_variant,content,assets')
        .eq('block_id', block.id).eq('version', pub.version).single();
      const assets = await resolveAssets(supabase, bv.assets);
      pushResolved(resolvedSlots, inst.slot, {
        blockId: block.id,
        blockVersionId: bv.id,
        type: block.type,
        layoutVariant: bv.layout_variant,
        content: bv.content,
        assets,
        instanceProps: inst.instance_props || {}
      });
    } else {
      const { data: bv } = await supabase
        .from('block_version').select('id,layout_variant,content,assets')
        .eq('id', inst.pinned_block_version_id).maybeSingle();
      if (!bv) continue;
      const assets = await resolveAssets(supabase, bv.assets);
      pushResolved(resolvedSlots, inst.slot, {
        blockId: block.id,
        blockVersionId: bv.id,
        type: block.type,
        layoutVariant: bv.layout_variant,
        content: bv.content,
        assets,
        instanceProps: inst.instance_props || {}
      });
    }
  }

  const body = JSON.stringify({
    siteHandle,
    slug,
    locale,
    version,
    title: pv.title,
    template: pv.template,
    seo: pv.seo,
    slots: resolvedSlots
  });

  return new Response(body, { headers: { 'content-type': 'application/json' } });
});

function pushResolved(bag: Record<string, any[]>, slot: string, item: any) {
  bag[slot] ||= []; bag[slot].push(item);
}

async function resolveAssets(supabase: any, assetRefs: any[]) {
  const out: any[] = [];
  for (const ref of assetRefs || []) {
    const { data: pub } = await supabase
      .from('asset_publish').select('version').eq('asset_id', ref.asset_id).maybeSingle();
    if (!pub?.version) continue;
    const { data: av } = await supabase
      .from('asset_version').select('id, meta, asset_id').eq('asset_id', ref.asset_id)
      .eq('version', pub.version).maybeSingle();
    if (!av) continue;
    const { data: a } = await supabase
      .from('asset').select('id, kind, storage_key, width, height, duration_ms')
      .eq('id', av.asset_id).single();
    const url = storageKeyToCdn(a.storage_key);
    out.push({
      role: ref.role || 'default',
      asset: {
        id: a.id, kind: a.kind, url,
        width: a.width, height: a.height, durationMs: a.duration_ms,
        meta: av.meta
      }
    });
  }
  return out;
}

function storageKeyToCdn(key: string) {
  const base = Deno.env.get('ASSET_CDN_BASE') || '/storage/v1/object/public';
  return `${base}/${key}`;
}
```

Section: Supabase Edge Function – Resolve Menu
```ts

// supabase/functions/resolveMenu/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const url = new URL(req.url);
  const siteHandle = url.searchParams.get('siteHandle')!;
  const handle = url.searchParams.get('handle')!;
  const locale = url.searchParams.get('locale') || 'en-US';
  const mode = (url.searchParams.get('mode') || 'published') as 'published' | 'draft';

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!
  );

  const { data: site } = await supabase.from('site').select('id').eq('handle', siteHandle).single();
  const { data: menu } = await supabase.from('menu').select('id').eq('site_id', site.id).eq('handle', handle).single();

  let version: number | null = null;
  if (mode === 'published') {
    const { data: pub } = await supabase.from('menu_publish')
      .select('version').eq('menu_id', menu.id).eq('locale', locale).maybeSingle();
    version = pub?.version ?? null;
  } else {
    const { data: ver } = await supabase.from('menu_version')
      .select('version').eq('menu_id', menu.id).eq('locale', locale)
      .order('version', { ascending: false }).limit(1).maybeSingle();
    version = ver?.version ?? null;
  }
  if (!version) return new Response('no menu version', { status: 404 });

  const { data: mv } = await supabase.from('menu_version')
    .select('items, rules').eq('menu_id', menu.id).eq('version', version).single();

  const items = await resolveItems(supabase, mv.items || [], locale);
  return new Response(JSON.stringify({ handle, locale, version, items }), {
    headers: { 'content-type': 'application/json' }
  });
});

async function resolveItems(supabase: any, items: any[], locale: string) {
  const walk = async (nodes: any[]): Promise<any[]> => {
    const out: any[] = [];
    for (const n of nodes) {
      if (n.type === 'page' && n.page_id) {
        const { data: pub } = await supabase.from('page_publish')
          .select('version').eq('page_id', n.page_id).eq('locale', locale).maybeSingle();
        if (!pub?.version) continue;
      }
      const children = n.children ? await walk(n.children) : [];
      out.push({ ...n, children });
    }
    return out;
  };
  return await walk(items);
}
```

Section: RLS Policy Sketch (adapt to your auth model)
```sql

alter table site enable row level security;
alter table page enable row level security;
alter table page_version enable row level security;
alter table page_publish enable row level security;
alter table block enable row level security;
alter table block_version enable row level security;
alter table block_publish enable row level security;
alter table menu enable row level security;
alter table menu_version enable row level security;
alter table menu_publish enable row level security;
alter table asset enable row level security;
alter table asset_version enable row level security;
alter table asset_publish enable row level security;

create policy "read_published_pages" on page_version
  for select using (status = 'published');

create policy "read_published_blocks" on block_version
  for select using (status = 'published');

create policy "read_published_assets" on asset_version
  for select using (status = 'published');
```

Section: Seed Example
```sql

insert into site (handle, label) values ('acme', 'Acme Inc.') returning id;
-- Assume :sid is the returned site id

insert into block (site_id, type, tag) values (:sid, 'hero', 'homepage') returning id;

insert into block_version (block_id, version, layout_variant, content, created_by)
values (:block_id, 1, 'media_left', '{"headline":"Hello","body":"World"}', '00000000-0000-0000-0000-000000000000');
insert into block_publish (block_id, version) values (:block_id, 1);

insert into page (site_id, slug) values (:sid, '/') returning id;

insert into page_version (page_id, version, title, template, slots, created_by)
values (:page_id, 1, 'Home', 'landing',
       '[{"slot":"main","order":1,"block_id":":block_id","follow_latest":true}]',
       '00000000-0000-0000-0000-000000000000');

insert into page_publish (page_id, locale, version) values (:page_id, 'en-US', 1);
```

Section: Build & Delivery Notes

- GitHub Pages: during build, fetch all published pages/menus from Edge Functions and write to /public/data/*.json. PWA hydrates from these files first and refreshes in background.
- React Native: cache resolved payloads keyed by (site, slug, locale, version) with AsyncStorage/SQLite and sync on connectivity.
