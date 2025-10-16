// CMS Developer Usage Examples
// This file demonstrates how developers can use the CMS in their React components

import React from 'react';
import { usePublishedPage, usePublishedBlock, usePublishedAsset, usePublishedMenu, usePreviewMode } from '../hooks';

// Example 1: Using published content in a homepage component
export function HomePageExample() {
  const { page, loading, error } = usePublishedPage('aztec-citizens-revival', '/', 'en-US');
  const { block: heroBlock } = usePublishedBlock('homepage-hero', 'en-US');
  const { asset: logoAsset } = usePublishedAsset('logo-primary');

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-64 rounded"></div>;
  }

  if (error) {
    return <div className="text-red-600">Error loading content: {error}</div>;
  }

  if (!page) {
    return <div>Page not found</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header with logo */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            {logoAsset && (
              <img 
                src={logoAsset.url} 
                alt={logoAsset.meta.alt?.['en-US'] || 'Logo'} 
                className="h-8 w-auto"
              />
            )}
            <h1 className="text-2xl font-bold text-gray-900">{page.title}</h1>
          </div>
        </div>
      </header>

      {/* Hero section using published block */}
      {heroBlock && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {heroBlock.content['en-US']?.headline || 'Welcome'}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {heroBlock.content['en-US']?.body || 'Join our community'}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Page content slots */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {Object.entries(page.slots).map(([slotName, blocks]) => (
          <div key={slotName} className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
              {slotName} Content
            </h3>
            <div className="grid gap-6">
              {blocks.map((block, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow">
                  <h4 className="text-xl font-semibold mb-2">{block.type}</h4>
                  <div className="text-gray-600">
                    {JSON.stringify(block.content['en-US'], null, 2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

// Example 2: Navigation component using published menu
export function NavigationExample() {
  const { menu, loading, error } = usePublishedMenu('main-nav', 'en-US');

  if (loading) {
    return <nav className="animate-pulse bg-gray-200 h-12 rounded"></nav>;
  }

  if (error) {
    return <nav className="text-red-600">Error loading menu: {error}</nav>;
  }

  if (!menu) {
    return <nav>Menu not found</nav>;
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {menu.items.map((item) => (
            <a
              key={item.id}
              href={item.type === 'page' ? `/${item.page_id}` : item.url}
              className="text-gray-600 hover:text-gray-900 px-3 py-4 text-sm font-medium"
            >
              {item.label?.['en-US'] || item.id}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

// Example 3: Asset gallery component
export function AssetGalleryExample() {
  const { asset: logoAsset } = usePublishedAsset('logo-primary');
  const { asset: transparentLogo } = usePublishedAsset('logo-transparent');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {logoAsset && (
        <div className="bg-white p-6 rounded-lg shadow">
          <img 
            src={logoAsset.url} 
            alt={logoAsset.meta.alt?.['en-US'] || 'Logo'} 
            className="w-full h-auto"
          />
          <h3 className="text-lg font-semibold mt-4">
            {logoAsset.meta.caption?.['en-US'] || 'Logo'}
          </h3>
        </div>
      )}
      
      {transparentLogo && (
        <div className="bg-white p-6 rounded-lg shadow">
          <img 
            src={transparentLogo.url} 
            alt={transparentLogo.meta.alt?.['en-US'] || 'Transparent Logo'} 
            className="w-full h-auto"
          />
          <h3 className="text-lg font-semibold mt-4">
            {transparentLogo.meta.caption?.['en-US'] || 'Transparent Logo'}
          </h3>
        </div>
      )}
    </div>
  );
}

// Example 4: Multi-language content component
export function MultiLanguageExample() {
  const { page: englishPage } = usePublishedPage('aztec-citizens-revival', '/', 'en-US');
  const { page: spanishPage } = usePublishedPage('aztec-citizens-revival', '/', 'es-MX');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">English</h2>
          {englishPage && (
            <div>
              <h3 className="text-xl font-semibold mb-2">{englishPage.title}</h3>
              <p className="text-gray-600">
                SEO Description: {JSON.stringify(englishPage.seo, null, 2)}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Español</h2>
          {spanishPage && (
            <div>
              <h3 className="text-xl font-semibold mb-2">{spanishPage.title}</h3>
              <p className="text-gray-600">
                SEO Description: {JSON.stringify(spanishPage.seo, null, 2)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Example 5: Preview mode component
export function PreviewModeExample() {
  const { isPreview } = usePreviewMode();

  if (!isPreview) {
    return null;
  }

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            <strong>Preview Mode:</strong> You are viewing draft content. Changes are not yet published.
          </p>
        </div>
      </div>
    </div>
  );
}

// Example 6: Error boundary for CMS content
export function CmsErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <div className="cms-content">
      {children}
    </div>
  );
}

// Example 7: Loading states for CMS content
export function CmsLoadingState() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 h-8 w-1/4 rounded mb-4"></div>
      <div className="bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
      <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
    </div>
  );
}
