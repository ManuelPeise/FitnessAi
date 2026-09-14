import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#b7ef52",
      contrastText: "#101412",
    },
    background: {
      default: "#101412",
      paper: "#181e1b",
    },
    text: {
      primary: "#f4f7f5",
      secondary: "#aab5af",
    },
    error: {
      main: "#ff9d91",
    },
  },
  shape: {
    borderRadius: 6,
  },
  typography: {
    fontFamily: '"Segoe UI", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
          textTransform: "none",
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
