// CMS Content Migration Script
// This script helps migrate existing hard-coded content into the CMS

import { supabase } from '../../../shell/lib/supabase';
import type { Site, Page, Block, Asset, PageVersion, BlockVersion, AssetVersion } from '../types';

export interface MigrationOptions {
  siteHandle: string;
  siteLabel: string;
  defaultLocale?: string;
}

export interface AssetImportData {
  systemKey: string;
  filePath: string;
  isSystem: boolean;
  meta: {
    alt?: Record<string, string>;
    caption?: Record<string, string>;
    tags?: string[];
  };
}

export interface BlockImportData {
  systemKey: string;
  type: string;
  isSystem: boolean;
  content: Record<string, any>;
  assets?: Array<{ role: string; assetSystemKey: string }>;
}

export interface PageImportData {
  systemKey: string;
  slug: string;
  isSystem: boolean;
  title: Record<string, string>;
  seo?: Record<string, any>;
  navHints?: Record<string, any>;
  blocks: Array<{ slot: string; order: number; blockSystemKey: string }>;
}

export class ContentMigration {
  private siteId: string | null = null;

  async migrate(options: MigrationOptions): Promise<void> {
    console.log('Starting content migration...');
    
    // 1. Create or get site
    this.siteId = await this.createOrGetSite(options);
    console.log(`Site created/found: ${this.siteId}`);

    // 2. Import assets
    const assets = await this.importAssets();
    console.log(`Imported ${assets.length} assets`);

    // 3. Import blocks
    const blocks = await this.importBlocks(assets);
    console.log(`Imported ${blocks.length} blocks`);

    // 4. Import pages
    const pages = await this.importPages(blocks);
    console.log(`Imported ${pages.length} pages`);

    console.log('Content migration completed successfully!');
  }

  private async createOrGetSite(options: MigrationOptions): Promise<string> {
    const { data: existingSite } = await supabase
      .from('site')
      .select('id')
      .eq('handle', options.siteHandle)
      .single();

    if (existingSite) {
      return existingSite.id;
    }

    const { data: newSite, error } = await supabase
      .from('site')
      .insert({
        handle: options.siteHandle,
        label: options.siteLabel,
        default_locale: options.defaultLocale || 'en-US'
      })
      .select('id')
      .single();

    if (error) throw error;
    return newSite.id;
  }

  private async importAssets(): Promise<Asset[]> {
    const assetsToImport: AssetImportData[] = [
      {
        systemKey: 'logo-primary',
        filePath: '/public/images/purple_logo_splash.png',
        isSystem: true,
        meta: {
          alt: { 'en-US': 'Aztec Citizens Revival Logo', 'es-MX': 'Logo de Aztec Citizens Revival' },
          caption: { 'en-US': 'Main logo for Aztec Citizens Revival' },
          tags: ['logo', 'branding']
        }
      },
      {
        systemKey: 'logo-transparent',
        filePath: '/public/images/transparent_logo_splash.png',
        isSystem: true,
        meta: {
          alt: { 'en-US': 'Aztec Citizens Revival Logo (Transparent)', 'es-MX': 'Logo de Aztec Citizens Revival (Transparente)' },
          caption: { 'en-US': 'Transparent version of the logo' },
          tags: ['logo', 'branding', 'transparent']
        }
      },
      {
        systemKey: 'friday-main-street',
        filePath: '/public/images/aztec-nm-main-street.jpg',
        isSystem: true,
        meta: {
          alt: { 'en-US': 'Friday Main Street Event', 'es-MX': 'Evento del Viernes en Main Street' },
          caption: { 'en-US': 'Community gathering on Main Street' },
          tags: ['event', 'friday', 'main-street']
        }
      },
      {
        systemKey: 'saturday-riverside-park',
        filePath: '/public/images/aztec-nm-riverside-park.jpg',
        isSystem: true,
        meta: {
          alt: { 'en-US': 'Saturday Riverside Park Event', 'es-MX': 'Evento del Sábado en Riverside Park' },
          caption: { 'en-US': 'Family activities at Riverside Park' },
          tags: ['event', 'saturday', 'riverside-park']
        }
      },
      {
        systemKey: 'sunday-community-center',
        filePath: '/public/images/aztec-nm-community-center.jpg',
        isSystem: true,
        meta: {
          alt: { 'en-US': 'Sunday Community Center Event', 'es-MX': 'Evento del Domingo en el Centro Comunitario' },
          caption: { 'en-US': 'Community center activities' },
          tags: ['event', 'sunday', 'community-center']
        }
      }
    ];

    const importedAssets: Asset[] = [];

    for (const assetData of assetsToImport) {
      try {
        // Create asset record
        const { data: asset, error: assetError } = await supabase
          .from('asset')
          .insert({
            site_id: this.siteId!,
            kind: 'image',
            storage_key: assetData.filePath.replace('/public', ''),
            is_system: assetData.isSystem,
            system_key: assetData.systemKey,
            created_by: '00000000-0000-0000-0000-000000000000' // System user
          })
          .select()
          .single();

        if (assetError) throw assetError;

        // Create asset version
        const { data: assetVersion, error: versionError } = await supabase
          .from('asset_version')
          .insert({
            asset_id: asset.id,
            version: 1,
            meta: assetData.meta,
            status: 'published',
            created_by: '00000000-0000-0000-0000-000000000000'
          })
          .select()
          .single();

        if (versionError) throw versionError;

        // Publish asset
        await supabase
          .from('asset_publish')
          .insert({
            asset_id: asset.id,
            version: 1,
            published_by: '00000000-0000-0000-0000-000000000000'
          });

        importedAssets.push(asset);
        console.log(`Imported asset: ${assetData.systemKey}`);
      } catch (error) {
        console.error(`Failed to import asset ${assetData.systemKey}:`, error);
      }
    }

    return importedAssets;
  }

  private async importBlocks(assets: Asset[]): Promise<Block[]> {
    const blocksToImport: BlockImportData[] = [
      {
        systemKey: 'homepage-hero',
        type: 'hero',
        isSystem: true,
        content: {
          'en-US': {
            headline: 'What is Aztec Citizens Revival?',
            body: 'Aztec Citizens Revival is a homegrown weekend of community, culture, and connection in the heart of Aztec, New Mexico.',
            ctaText: 'Get Involved',
            ctaLink: '/volunteers'
          },
          'es-MX': {
            headline: '¿Qué es Aztec Citizens Revival?',
            body: 'Aztec Citizens Revival es un fin de semana de comunidad, cultura y conexión en el corazón de Aztec, Nuevo México.',
            ctaText: 'Participar',
            ctaLink: '/volunteers'
          }
        },
        assets: [{ role: 'hero-image', assetSystemKey: 'logo-primary' }]
      },
      {
        systemKey: 'event-friday',
        type: 'event-card',
        isSystem: true,
        content: {
          'en-US': {
            title: 'Friday Main Street',
            description: 'Join us on Main Street for community activities and local vendors.',
            time: '5:00 PM - 9:00 PM',
            location: 'Main Street, Aztec'
          },
          'es-MX': {
            title: 'Viernes en Main Street',
            description: 'Únete a nosotros en Main Street para actividades comunitarias y vendedores locales.',
            time: '5:00 PM - 9:00 PM',
            location: 'Main Street, Aztec'
          }
        },
        assets: [{ role: 'event-image', assetSystemKey: 'friday-main-street' }]
      },
      {
        systemKey: 'event-saturday',
        type: 'event-card',
        isSystem: true,
        content: {
          'en-US': {
            title: 'Saturday Riverside Park',
            description: 'Family fun day at Riverside Park with activities for all ages.',
            time: '10:00 AM - 4:00 PM',
            location: 'Riverside Park, Aztec'
          },
          'es-MX': {
            title: 'Sábado en Riverside Park',
            description: 'Día de diversión familiar en Riverside Park con actividades para todas las edades.',
            time: '10:00 AM - 4:00 PM',
            location: 'Riverside Park, Aztec'
          }
        },
        assets: [{ role: 'event-image', assetSystemKey: 'saturday-riverside-park' }]
      },
      {
        systemKey: 'event-sunday',
        type: 'event-card',
        isSystem: true,
        content: {
          'en-US': {
            title: 'Sunday Community Center',
            description: 'Community gathering and celebration at the Community Center.',
            time: '2:00 PM - 6:00 PM',
            location: 'Community Center, Aztec'
          },
          'es-MX': {
            title: 'Domingo en el Centro Comunitario',
            description: 'Reunión y celebración comunitaria en el Centro Comunitario.',
            time: '2:00 PM - 6:00 PM',
            location: 'Centro Comunitario, Aztec'
          }
        },
        assets: [{ role: 'event-image', assetSystemKey: 'sunday-community-center' }]
      }
    ];

    const importedBlocks: Block[] = [];

    for (const blockData of blocksToImport) {
      try {
        // Create block record
        const { data: block, error: blockError } = await supabase
          .from('block')
          .insert({
            site_id: this.siteId!,
            type: blockData.type,
            is_system: blockData.isSystem,
            system_key: blockData.systemKey
          })
          .select()
          .single();

        if (blockError) throw blockError;

        // Resolve asset references
        const assetRefs = blockData.assets?.map(assetRef => {
          const asset = assets.find(a => a.system_key === assetRef.assetSystemKey);
          return { role: assetRef.role, asset_id: asset?.id || '' };
        }).filter(ref => ref.asset_id) || [];

        // Create block version
        const { data: blockVersion, error: versionError } = await supabase
          .from('block_version')
          .insert({
            block_id: block.id,
            version: 1,
            layout_variant: 'default',
            content: blockData.content,
            assets: assetRefs,
            status: 'published',
            created_by: '00000000-0000-0000-0000-000000000000'
          })
          .select()
          .single();

        if (versionError) throw versionError;

        // Publish block
        await supabase
          .from('block_publish')
          .insert({
            block_id: block.id,
            version: 1,
            published_by: '00000000-0000-0000-0000-000000000000'
          });

        importedBlocks.push(block);
        console.log(`Imported block: ${blockData.systemKey}`);
      } catch (error) {
        console.error(`Failed to import block ${blockData.systemKey}:`, error);
      }
    }

    return importedBlocks;
  }

  private async importPages(blocks: Block[]): Promise<Page[]> {
    const pagesToImport: PageImportData[] = [
      {
        systemKey: 'homepage',
        slug: '/',
        isSystem: true,
        title: {
          'en-US': 'Home',
          'es-MX': 'Inicio'
        },
        seo: {
          'en-US': {
            description: 'Aztec Citizens Revival - A community weekend in Aztec, New Mexico',
            keywords: ['aztec', 'new mexico', 'community', 'events', 'citizens revival']
          },
          'es-MX': {
            description: 'Aztec Citizens Revival - Un fin de semana comunitario en Aztec, Nuevo México',
            keywords: ['aztec', 'nuevo mexico', 'comunidad', 'eventos', 'citizens revival']
          }
        },
        navHints: {
          'en-US': { defaultLabel: 'Home' },
          'es-MX': { defaultLabel: 'Inicio' }
        },
        blocks: [
          { slot: 'hero', order: 1, blockSystemKey: 'homepage-hero' },
          { slot: 'events', order: 1, blockSystemKey: 'event-friday' },
          { slot: 'events', order: 2, blockSystemKey: 'event-saturday' },
          { slot: 'events', order: 3, blockSystemKey: 'event-sunday' }
        ]
      },
      {
        systemKey: 'sponsors',
        slug: '/sponsors',
        isSystem: true,
        title: {
          'en-US': 'Sponsors',
          'es-MX': 'Patrocinadores'
        },
        seo: {
          'en-US': {
            description: 'Our sponsors and supporters of Aztec Citizens Revival',
            keywords: ['sponsors', 'supporters', 'aztec', 'community']
          },
          'es-MX': {
            description: 'Nuestros patrocinadores y seguidores de Aztec Citizens Revival',
            keywords: ['patrocinadores', 'seguidores', 'aztec', 'comunidad']
          }
        },
        navHints: {
          'en-US': { defaultLabel: 'Sponsors' },
          'es-MX': { defaultLabel: 'Patrocinadores' }
        },
        blocks: []
      },
      {
        systemKey: 'vendors',
        slug: '/vendors',
        isSystem: true,
        title: {
          'en-US': 'Vendors',
          'es-MX': 'Vendedores'
        },
        seo: {
          'en-US': {
            description: 'Local vendors and businesses at Aztec Citizens Revival',
            keywords: ['vendors', 'local business', 'aztec', 'market']
          },
          'es-MX': {
            description: 'Vendedores y negocios locales en Aztec Citizens Revival',
            keywords: ['vendedores', 'negocios locales', 'aztec', 'mercado']
          }
        },
        navHints: {
          'en-US': { defaultLabel: 'Vendors' },
          'es-MX': { defaultLabel: 'Vendedores' }
        },
        blocks: []
      },
      {
        systemKey: 'volunteers',
        slug: '/volunteers',
        isSystem: true,
        title: {
          'en-US': 'Volunteers',
          'es-MX': 'Voluntarios'
        },
        seo: {
          'en-US': {
            description: 'Get involved as a volunteer with Aztec Citizens Revival',
            keywords: ['volunteers', 'get involved', 'community', 'aztec']
          },
          'es-MX': {
            description: 'Participa como voluntario con Aztec Citizens Revival',
            keywords: ['voluntarios', 'participar', 'comunidad', 'aztec']
          }
        },
        navHints: {
          'en-US': { defaultLabel: 'Volunteers' },
          'es-MX': { defaultLabel: 'Voluntarios' }
        },
        blocks: []
      }
    ];

    const importedPages: Page[] = [];

    for (const pageData of pagesToImport) {
      try {
        // Create page record
        const { data: page, error: pageError } = await supabase
          .from('page')
          .insert({
            site_id: this.siteId!,
            slug: pageData.slug,
            is_system: pageData.isSystem,
            system_key: pageData.systemKey
          })
          .select()
          .single();

        if (pageError) throw pageError;

        // Resolve block references
        const blockInstances = pageData.blocks.map(blockRef => {
          const block = blocks.find(b => b.system_key === blockRef.blockSystemKey);
          return {
            slot: blockRef.slot,
            order: blockRef.order,
            block_id: block?.id || '',
            instance_props: {}
          };
        }).filter(instance => instance.block_id);

        // Create page version
        const { data: pageVersion, error: versionError } = await supabase
          .from('page_version')
          .insert({
            page_id: page.id,
            version: 1,
            title: pageData.title,
            layout_variant: 'default',
            seo: pageData.seo || {},
            nav_hints: pageData.navHints || {},
            slots: blockInstances,
            status: 'published',
            created_by: '00000000-0000-0000-0000-000000000000'
          })
          .select()
          .single();

        if (versionError) throw versionError;

        // Publish page
        await supabase
          .from('page_publish')
          .insert({
            page_id: page.id,
            version: 1,
            published_by: '00000000-0000-0000-0000-000000000000'
          });

        importedPages.push(page);
        console.log(`Imported page: ${pageData.systemKey}`);
      } catch (error) {
        console.error(`Failed to import page ${pageData.systemKey}:`, error);
      }
    }

    return importedPages;
  }
}

// Usage example
export async function runMigration() {
  const migration = new ContentMigration();
  
  await migration.migrate({
    siteHandle: 'aztec-citizens-revival',
    siteLabel: 'Aztec Citizens Revival',
    defaultLocale: 'en-US'
  });
}
