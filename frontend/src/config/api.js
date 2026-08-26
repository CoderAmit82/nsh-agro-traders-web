const API_ORIGIN = (import.meta.env.VITE_API_URL || 'https://nsh-agro-traders-web.onrender.com').replace(/\/$/, '');

export const API_BASE = `${API_ORIGIN}/api`;

export const assetUrl = (assetPath) => {
  if (!assetPath) return '';
  if (/^https?:\/\//i.test(assetPath)) return assetPath;
  return `${API_ORIGIN}${assetPath.startsWith('/') ? assetPath : `/${assetPath}`}`;
};
