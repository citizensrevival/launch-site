#!/usr/bin/env tsx

// Content Migration Script
// Run this script to migrate existing hard-coded content into the CMS

import { runMigration } from '../src/lib/cms/migration/ContentMigration';

async function main() {
  console.log('🚀 Starting content migration...');
  
  try {
    await runMigration();
    console.log('✅ Content migration completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Visit http://localhost:3000/manage/cms to see the CMS admin interface');
    console.log('2. Check that all content has been imported correctly');
    console.log('3. Test the published content using the developer hooks');
    console.log('');
    console.log('Example usage in your components:');
    console.log('```tsx');
    console.log('import { usePublishedPage, usePublishedBlock } from "./lib/cms/hooks";');
    console.log('');
    console.log('function HomePage() {');
    console.log('  const { page } = usePublishedPage("aztec-citizens-revival", "/", "en-US");');
    console.log('  const { block: heroBlock } = usePublishedBlock("homepage-hero", "en-US");');
    console.log('  // Use the content in your component');
    console.log('}');
    console.log('```');
  } catch (error) {
    console.error('❌ Content migration failed:', error);
    process.exit(1);
  }
}

main();
