import { defineConfig } from "vite";

function createSecurityHeaders(includeDevSocket) {
  const connectSources = [
    "'self'",
    "https://api.mymemory.translated.net",
    "https://api.dictionaryapi.dev",
  ];
  const styleSources = ["'self'", "https://fonts.googleapis.com"];
  if (includeDevSocket) connectSources.push("ws://localhost:*", "ws://127.0.0.1:*");
  if (includeDevSocket) styleSources.push("'unsafe-inline'");

  return {
    "Content-Security-Policy": [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "script-src 'self'",
      `style-src ${styleSources.join(" ")}`,
      "font-src 'self' https://fonts.gstatic.com",
      `connect-src ${connectSources.join(" ")}`,
      "media-src 'self' https://api.dictionaryapi.dev",
      "img-src 'self' data:",
    ].join("; "),
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Permissions-Policy": "camera=(), geolocation=(), microphone=(self)",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  };
}

export default defineConfig({
  server: { headers: createSecurityHeaders(true) },
  preview: { headers: createSecurityHeaders(false) },
});
