import { useMemo } from 'react';
import { createTheme } from '@mui/material/styles';
import palette from './palette';
import dimensions from './dimensions';
import components from './components';

export default (server, darkMode, direction) =>
  useMemo(
    () =>
      createTheme({
        typography: {
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          h6: {
            fontWeight: 700,
            letterSpacing: '-0.02em',
          },
          subtitle1: {
            fontWeight: 600,
          },
          body1: {
            letterSpacing: '-0.01em',
          },
          body2: {
            letterSpacing: '-0.01em',
          },
          button: {
            fontWeight: 600,
            textTransform: 'none',
          },
        },
        palette: palette(server, darkMode),
        direction,
        dimensions,
        components,
      }),
    [server, darkMode, direction],
  );
