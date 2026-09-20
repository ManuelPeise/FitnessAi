import { Theme } from '../../types/theme/Theme';

// A "dim" mid-tone dark theme rather than near-black/near-white - softer on
// the eyes for extended use while remaining clearly a dark UI.
// Mirrors the palette defined in Core.React's src/app/theme.ts.
export const theme: Theme = {
  palette: {
    primary: {
      main: '#b7ef52',
      contrastText: '#182013',
    },
    background: {
      default: '#1b201e',
      paper: '#242b28',
    },
    text: {
      primary: '#e9ede9',
      secondary: '#a3b0a8',
    },
    error: {
      main: '#ff9d91',
    },
    divider: '#39423e',
    action: {
      hover: 'rgba(233, 237, 233, 0.06)',
      selected: 'rgba(233, 237, 233, 0.12)',
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: 'System',
  },
};
