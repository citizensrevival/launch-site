// CMS TypeScript Interfaces and Types
// This file contains all the TypeScript interfaces for the CMS system

export type PublishStatus = 'draft' | 'published' | 'archived' | 'staged';
export type LocaleString = string;
export type AssetKind = 'image' | 'video' | 'file';

// Generic type for i18n content
export type LocalizedContent<T> = Record<LocaleString, T>;

// Permission types
export type Permission = 
  | 'cms.pages.read' | 'cms.pages.write' | 'cms.pages.publish'
  | 'cms.blocks.read' | 'cms.blocks.write' | 'cms.blocks.publish'
  | 'cms.menus.read' | 'cms.menus.write' | 'cms.menus.publish'
  | 'cms.assets.read' | 'cms.assets.write' | 'cms.assets.publish'
  | 'analytics.read'
  | 'leads.read' | 'leads.write'
  | 'users.manage'
  | 'system.admin';

export interface UserPermissions {
  userId: string;
  permissions: Permission[];
  grantedAt: string;
  grantedBy?: string;
}

export type Visibility = {
  device?: Array<'mobile' | 'desktop'>;
  audience?: Array<'anon' | 'user' | 'admin'>;
  featureFlags?: string[];
  schedule?: { start?: string; end?: string };
};

// Asset interfaces
export interface AssetMeta {
  alt?: string;
  caption?: string;
  license?: string;
  tags?: string[];
  focal_point?: { x: number; y: number };
}

export interface ResolvedAsset {
  id: string;
  kind: AssetKind;
  url: string;
  width?: number;
  height?: number;
  durationMs?: number;
  meta: AssetMeta;
}

export interface AssetVariant {
  id: string;
  asset_id: string;
  variant_type: 'thumbnail' | 'small' | 'medium' | 'large' | 'original';
  storage_key: string;
  width: number;
  height: number;
  file_size: number;
  url: string;
}

export interface AssetEditOperation {
  operation: 'crop' | 'resize' | 'rotate';
  params: CropParams | ResizeParams | RotateParams;
}

export interface CropParams {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ResizeParams {
  width: number;
  height: number;
  maintainAspectRatio: boolean;
}

export interface RotateParams {
  degrees: 90 | 180 | 270;
}

export interface Asset {
  id: string;
  site_id: string;
  kind: AssetKind;
  storage_key: string;
  width?: number | null;
  height?: number | null;
  duration_ms?: number | null;
  checksum?: string | null;
  is_system: boolean;
  system_key?: string | null;
  created_at: string;
  created_by: string;
}

export interface AssetVersion {
  id: string;
  asset_id: string;
  version: number;
  meta: LocalizedContent<AssetMeta>;
  edit_operation?: AssetEditOperation;
  status: PublishStatus;
  created_at: string;
  created_by: string;
  updated_by?: string;
  updated_at?: string;
}

export interface AssetPublish {
  asset_id: string;
  version: number;
  published_by: string;
  published_at: string;
}

// Block interfaces
export interface BlockInstance {
  slot: string;
  order: number;
  block_id: string;
  instance_props?: Record<string, unknown>;
}

export interface ResolvedBlock {
  block_id: string;
  block_version_id: string;
  type: string;
  layout_variant: string;
  content: LocalizedContent<Record<string, unknown>>;
  assets: Array<{ role: string; asset: ResolvedAsset }>;
  instance_props?: Record<string, unknown>;
}

export interface Block {
  id: string;
  site_id: string;
  type: string;
  tag?: string | null;
  is_system: boolean;
  system_key?: string | null;
}

export interface BlockVersion {
  id: string;
  block_id: string;
  version: number;
  layout_variant: string;
  content: LocalizedContent<Record<string, unknown>>;
  assets: Array<{ role: string; asset_id: string }>;
  status: PublishStatus;
  created_at: string;
  created_by: string;
  updated_by?: string | null;
  updated_at?: string | null;
}

export interface BlockPublish {
  block_id: string;
  version: number;
  published_by: string;
  published_at: string;
}

// Page interfaces
export interface Page {
  id: string;
  site_id: string;
  slug: string;
  is_system: boolean;
  system_key?: string | null;
}

export interface PageVersion {
  id: string;
  page_id: string;
  version: number;
  title: LocalizedContent<string>;
  layout_variant?: string | null;
  seo: LocalizedContent<Record<string, unknown>>;
  nav_hints: {
    label: LocalizedContent<string>;
    badge: LocalizedContent<string>;
    order: number;
    hidden: boolean;
  };
  slots: Array<BlockInstance>;
  created_at: string;
  created_by: string;
  updated_by?: string | null;
  updated_at?: string | null;
}

export interface PagePublish {
  page_id: string;
  version: number;
  published_by: string;
  published_at: string;
}

export interface ResolvedPage {
  site_handle: string;
  slug: string;
  locale: LocaleString;
  version: number;
  title: string;
  layout_variant?: string;
  seo: Record<string, unknown>;
  nav_hints: Record<string, unknown>;
  slots: Record<string, ResolvedBlock[]>;
}

// Menu interfaces
export type MenuItemType = 'page' | 'external' | 'anchor' | 'separator' | 'group';

export interface MenuItemBase {
  id: string;
  type: MenuItemType;
  label?: LocalizedContent<string>;
  target?: '_self' | '_blank';
  rel?: Array<'nofollow' | 'noopener' | 'sponsored'>;
  badge?: LocalizedContent<{ text: string; tone: 'info' | 'success' | 'warning' }>;
  visibility?: Visibility;
  style_hint?: 'legal' | 'secondary';
  children?: MenuItem[];
}

export interface MenuItemPage extends MenuItemBase {
  type: 'page';
  page_id: string;
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

export interface Menu {
  id: string;
  site_id: string;
  handle: string;
  label: string;
  is_system: boolean;
  system_key?: string;
}

export interface MenuVersion {
  id: string;
  menu_id: string;
  version: number;
  items: LocalizedContent<MenuItem[]>;
  created_at: string;
  created_by: string;
  updated_by?: string;
  updated_at?: string;
}

export interface MenuPublish {
  menu_id: string;
  version: number;
  published_by: string;
  published_at: string;
}

export interface ResolvedMenu {
  handle: string;
  locale: LocaleString;
  version: number;
  items: MenuItem[];
}

// Site interface
export interface Site {
  id: string;
  handle: string;
  label: string;
  default_locale: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

// Publishing workflow interfaces
export interface PublishWorkflow {
  publishBlock(params: {
    blockId: string;
    version: number;
  }): Promise<PublishResult>;

  publishPage(params: {
    pageId: string;
    version: number;
  }): Promise<PublishResult>;

  publishMenu(params: {
    menuId: string;
    version: number;
  }): Promise<PublishResult>;
}

export interface PublishResult {
  success: boolean;
  published_files: string[];
  errors?: string[];
}

// Staging system interfaces
export interface SiteStaging {
  id: string;
  site_id: string;
  name: string;
  description?: string;
  created_at: string;
  created_by: string;
  staged_at: string;
  staged_by: string;
}

export interface StagingDependency {
  id: string;
  staging_id: string;
  entity_type: 'page' | 'block' | 'menu' | 'asset';
  entity_id: string;
  version: number;
  dependency_type: 'direct' | 'indirect' | 'asset';
  dependency_entity_type?: string;
  dependency_entity_id?: string;
  dependency_version?: number;
  created_at: string;
}

export interface StagingWorkflow {
  createStaging(params: {
    siteId: string;
    name: string;
    description?: string;
  }): Promise<ApiResponse<SiteStaging>>;

  stageEntity(params: {
    entityType: 'page' | 'block' | 'menu' | 'asset';
    entityId: string;
    version: number;
    stagingId: string;
  }): Promise<ApiResponse<boolean>>;

  stageSite(params: {
    siteId: string;
    name: string;
    description?: string;
  }): Promise<ApiResponse<SiteStaging>>;

  publishStagedContent(stagingId: string): Promise<ApiResponse<boolean>>;

  rollbackStaging(stagingId: string): Promise<ApiResponse<boolean>>;

  getStagingDependencies(stagingId: string): Promise<ApiResponse<StagingDependency[]>>;
}

export interface StagingResult {
  success: boolean;
  staging_id?: string;
  staged_entities: number;
  errors?: string[];
}

// Audit log interface
export interface AuditLogEntry {
  id: string;
  user_id: string;
  user_permissions: Permission[];
  action: 'create' | 'update' | 'publish' | 'unpublish' | 'delete' | 'rollback';
  entity_type: 'page' | 'block' | 'menu' | 'asset';
  entity_id: string;
  version?: number;
  changes?: Record<string, unknown>;
  occurred_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Content management types
export interface ContentFilters {
  status?: PublishStatus;
  type?: string;
  kind?: AssetKind;
  kinds?: AssetKind[]; // Multi-select kind filter
  is_system?: boolean;
  created_by?: string;
  search?: string;
}

export interface ContentSort {
  field: string;
  direction: 'asc' | 'desc';
}

// Image processing types
export interface ImageProcessingOptions {
  format?: 'webp' | 'jpeg' | 'png';
  quality?: number;
  width?: number;
  height?: number;
  maintain_aspect_ratio?: boolean;
}

export interface ImageUploadResult {
  asset_id: string;
  storage_key: string;
  variants: AssetVariant[];
  url: string;
}

// Developer API types
export interface DeveloperApi {
  getPublishedPageByKey(systemKey: string, locale?: string): Promise<ResolvedPage | null>;
  getPublishedBlockByKey(systemKey: string, locale?: string): Promise<ResolvedBlock | null>;
  getPublishedAssetByKey(systemKey: string): Promise<ResolvedAsset | null>;
  getPublishedMenuByKey(systemKey: string, locale?: string): Promise<ResolvedMenu | null>;
}
