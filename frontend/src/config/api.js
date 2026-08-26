const PRODUCTION_API_ORIGIN = 'https://nsh-agro-traders-web.onrender.com';
const API_ORIGIN = PRODUCTION_API_ORIGIN;

export const API_BASE = `${API_ORIGIN}/api`;

export const assetUrl = (assetPath) => {
  if (!assetPath) return '';
  if (/^https?:\/\//i.test(assetPath)) return assetPath;
  return `${API_ORIGIN}${assetPath.startsWith('/') ? assetPath : `/${assetPath}`}`;
};
