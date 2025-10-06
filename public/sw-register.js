// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    try {
      const currentScript = document.currentScript;
      const scriptUrl = currentScript && currentScript.src ? new URL(currentScript.src) : null;
      const baseUrl = scriptUrl ? (scriptUrl.pathname.replace(/\/[^/]*$/, '/') || '/') : '/';
      const swUrl = new URL('sw.js', window.location.origin + baseUrl);
      navigator.serviceWorker
        .register(swUrl, { scope: baseUrl })
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
