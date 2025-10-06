// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    try {
      // Get the base path from the current location
      const pathname = window.location.pathname;
      const basePath = pathname.includes('/launch-site/') ? '/launch-site/' : '/';
      
      const swUrl = new URL('sw.js', window.location.origin + basePath);
      navigator.serviceWorker
        .register(swUrl, { scope: basePath })
        .then((registration) => {
          console.log('SW registered:', registration);
        })
        .catch((err) => {
          console.log('SW registration failed:', err);
        });
    } catch (err) {
      console.log('SW registration failed:', err);
    }
  });
}
