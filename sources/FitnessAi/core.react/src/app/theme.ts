import { createTheme } from "@mui/material/styles";

// A "dim" mid-tone theme rather than near-black/near-white - softer on the eyes for extended use
// while remaining clearly a dark UI (color-scheme stays "dark" in globals.css).
export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#b7ef52",
      contrastText: "#182013",
    },
    background: {
      default: "#1b201e",
      paper: "#242b28",
    },
    text: {
      primary: "#e9ede9",
      secondary: "#a3b0a8",
    },
    error: {
      main: "#ff9d91",
    },
    divider: "#39423e",
    action: {
      hover: "rgba(233, 237, 233, 0.06)",
      selected: "rgba(233, 237, 233, 0.12)",
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Segoe UI", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});
