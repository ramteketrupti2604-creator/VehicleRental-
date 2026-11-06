module.exports = {
  devServer: (devServerConfig) => {
    devServerConfig.headers = {
      "X-Frame-Options": "SAMEORIGIN",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "geolocation=(self), camera=(), microphone=()",
      "Cross-Origin-Embedder-Policy": "unsafe-none",
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      "Cross-Origin-Resource-Policy": "cross-origin",
      "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http: blob:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https: blob: *; font-src 'self' data: https:; connect-src 'self' http://localhost:5000 https://vehicle-rental-backend-n8fa.onrender.com https://*.googleapis.com https://*.gstatic.com https://*.google.com https://*.openstreetmap.org *; frame-src 'self' https://*.google.com https://*.googleapis.com https://www.google.com; worker-src 'self' blob:;"
    };
    // X-Powered-By hatane ke liye
    devServerConfig.onBeforeSetupMiddleware = undefined;
    devServerConfig.onAfterSetupMiddleware = undefined;
    return devServerConfig;
  }
};