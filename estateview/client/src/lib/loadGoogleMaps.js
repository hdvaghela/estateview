let promise;

/** Loads the Google Maps JS API once and resolves with the `google` global. */
export function loadGoogleMaps(apiKey) {
  if (window.google?.maps) return Promise.resolve(window.google);
  if (promise) return promise;

  promise = new Promise((resolve, reject) => {
    const callbackName = '__estateviewMapsReady';
    window[callbackName] = () => resolve(window.google);

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&callback=${callbackName}&loading=async&v=weekly`;
    script.async = true;
    script.onerror = () => {
      promise = undefined;
      reject(new Error('Google Maps failed to load'));
    };
    document.head.appendChild(script);
  });
  return promise;
}
