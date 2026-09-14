import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { AuthenticationStateProvider } from "../features/authentication/AuthenticationStateProvider";
import { AppRouter } from "./routing/AppRouter";
import { theme } from "./theme";

export const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <AuthenticationStateProvider>
      <AppRouter />
    </AuthenticationStateProvider>
  </ThemeProvider>
);
