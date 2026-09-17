import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AppButton } from "../shared/components/AppButton";
import { AppTextField } from "../shared/components/AppTextField";
import { RouterLink } from "../shared/components/RouterLink";
import { useForm } from "../shared/hooks/useForm";
import { useAuthenticationState } from "../features/authentication/useAuthenticationState";
import type { LoginCredentials } from "../features/authentication/authentication.types";
import { useI18n } from "../lib/i18n/useI18n";

const initialValues: LoginCredentials = {
  email: "",
  password: "",
};

export const LoginPage = () => {
  const { getResource } = useI18n();
  const { login } = useAuthenticationState();
  const { useField, useFormState, handleSubmit } = useForm<LoginCredentials>({
    initialValues,
    onSubmit: login,
  });
  const email = useField("email");
  const password = useField("password");
  const { isSubmitting, hasSubmitError } = useFormState();

  return (
    <Stack
      component="main"
      sx={{
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        padding: 3,
      }}
    >
      <Paper
        component="section"
        aria-labelledby="login-title"
        elevation={0}
        sx={{
          width: "min(100%, 420px)",
          borderLeft: 3,
          borderColor: "primary.main",
          padding: 4,
        }}
      >
        <Typography
          component="p"
          color="primary"
          sx={{ fontWeight: 700, textTransform: "uppercase" }}
        >
          {getResource("common.appName")}
        </Typography>
        <Typography id="login-title" variant="h4" component="h1" sx={{ mt: 4 }}>
          {getResource("common.signIn")}
        </Typography>
        <Typography component="p" color="text.secondary" sx={{ mb: 4 }}>
          {getResource("common.signInPrompt")}
        </Typography>

        <Stack
          component="form"
          onSubmit={handleSubmit}
          sx={{ gap: 2 }}
        >
          <AppTextField
            id="email"
            name="email"
            type="email"
            label={getResource("common.email")}
            autoComplete="email"
            {...email}
            required
          />

          <AppTextField
            id="password"
            name="password"
            type="password"
            label={getResource("common.password")}
            autoComplete="current-password"
            {...password}
            required
          />

          {hasSubmitError && (
            <Alert severity="error" role="alert">
              {getResource("common.invalidCredentials")}
            </Alert>
          )}

          <AppButton type="submit" disabled={isSubmitting} size="large">
            {isSubmitting
              ? getResource("common.signingIn")
              : getResource("common.signIn")}
          </AppButton>

          <Typography component="p" color="text.secondary" variant="body2">
            {getResource("common.noAccountPrompt")}{" "}
            <RouterLink to="/register">
              {getResource("common.goToRegister")}
            </RouterLink>
          </Typography>
        </Stack>
      </Paper>
    </Stack>
  );
};
