// Service Worker Registration
if ('serviceWorker' in navigator) {
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
}
