import { grey } from '@mui/material/colors';

const validatedColor = (color) => (/^#([0-9A-Fa-f]{3}){1,2}$/.test(color) ? color : null);

export default (server, darkMode) => ({
  mode: darkMode ? 'dark' : 'light',
  background: {
    default: darkMode ? '#0b1120' : '#f8fafc',
    paper: darkMode ? '#1e293b' : '#ffffff',
  },
  primary: {
    main: validatedColor(server?.attributes?.colorPrimary) || (darkMode ? '#60a5fa' : '#1b2a4a'),
    light: '#2d4373',
    dark: '#0f172a',
    contrastText: '#ffffff',
  },
  secondary: {
    main: validatedColor(server?.attributes?.colorSecondary) || (darkMode ? '#34d399' : '#059669'),
    contrastText: '#ffffff',
  },
  text: {
    primary: darkMode ? '#f1f5f9' : '#0f172a',
    secondary: darkMode ? '#94a3b8' : '#64748b',
  },
  neutral: {
    main: darkMode ? '#475569' : '#94a3b8',
  },
  divider: darkMode ? '#334155' : '#e2e8f0',
  geometry: {
    main: '#2563eb',
  },
  alwaysDark: {
    main: '#0f172a',
  },
});
