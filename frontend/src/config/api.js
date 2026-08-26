const PRODUCTION_API_ORIGIN = 'https://nsh-agro-traders-web.onrender.com';
const configuredApiOrigin = import.meta.env.VITE_API_URL?.trim();
const API_ORIGIN = (configuredApiOrigin && !/localhost|127\.0\.0\.1/i.test(configuredApiOrigin)
  ? configuredApiOrigin
  : PRODUCTION_API_ORIGIN).replace(/\/$/, '');

export const API_BASE = `${API_ORIGIN}/api`;

export const assetUrl = (assetPath) => {
  if (!assetPath) return '';
  if (/^https?:\/\//i.test(assetPath)) return assetPath;
  return `${API_ORIGIN}${assetPath.startsWith('/') ? assetPath : `/${assetPath}`}`;
};
