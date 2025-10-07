// Service Worker Registration
if ('serviceWorker' in navigator) {
  // Only register service worker in production
  const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname.includes('localhost');
  
  if (!isDevelopment) {
    window.addEventListener('load', () => {
      try {
        navigator.serviceWorker
          .register('/sw.js')
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
  } else {
    console.log('Service worker disabled in development mode');
  }
}
