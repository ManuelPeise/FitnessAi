import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AppButton } from "../shared/components/AppButton";
import { AppTextField } from "../shared/components/AppTextField";
import { RouterLink } from "../shared/components/RouterLink";
import { useForm } from "../shared/hooks/useForm";
import { useAuthenticationState } from "../features/authentication/useAuthenticationState";
import type { RegisterCredentials } from "../features/authentication/authentication.types";
import { useI18n } from "../lib/i18n/useI18n";

type RegisterFormValues = RegisterCredentials & {
  confirmPassword: string;
};

const initialValues: RegisterFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const validate = (values: RegisterFormValues): string | undefined =>
  values.password !== values.confirmPassword ? "passwordMismatch" : undefined;

export const RegisterPage = () => {
  const { getResource } = useI18n();
  const { register } = useAuthenticationState();
  const { useField, useFormState, handleSubmit } =
    useForm<RegisterFormValues>({
      initialValues,
      validate,
      onSubmit: (values) =>
        register({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
        }),
    });
  const firstName = useField("firstName");
  const lastName = useField("lastName");
  const email = useField("email");
  const password = useField("password");
  const confirmPassword = useField("confirmPassword");
  const { isSubmitting, hasSubmitError, validationError } = useFormState();

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
        aria-labelledby="register-title"
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
        <Typography
          id="register-title"
          variant="h4"
          component="h1"
          sx={{ mt: 4 }}
        >
          {getResource("common.createAccount")}
        </Typography>
        <Typography component="p" color="text.secondary" sx={{ mb: 4 }}>
          {getResource("common.registerPrompt")}
        </Typography>

        <Stack component="form" onSubmit={handleSubmit} sx={{ gap: 2 }}>
          <AppTextField
            id="firstName"
            name="firstName"
            type="text"
            label={getResource("common.firstName")}
            autoComplete="given-name"
            {...firstName}
            required
          />

          <AppTextField
            id="lastName"
            name="lastName"
            type="text"
            label={getResource("common.lastName")}
            autoComplete="family-name"
            {...lastName}
            required
          />

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
            autoComplete="new-password"
            {...password}
            required
          />

          <AppTextField
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label={getResource("common.confirmPassword")}
            autoComplete="new-password"
            {...confirmPassword}
            required
          />

          {validationError === "passwordMismatch" && (
            <Alert severity="error" role="alert">
              {getResource("common.passwordMismatch")}
            </Alert>
          )}

          {hasSubmitError && (
            <Alert severity="error" role="alert">
              {getResource("common.registrationFailed")}
            </Alert>
          )}

          <AppButton type="submit" disabled={isSubmitting} size="large">
            {isSubmitting
              ? getResource("common.creatingAccount")
              : getResource("common.createAccount")}
          </AppButton>

          <Typography component="p" color="text.secondary" variant="body2">
            {getResource("common.alreadyHaveAccountPrompt")}{" "}
            <RouterLink to="/login">
              {getResource("common.goToSignIn")}
            </RouterLink>
          </Typography>
        </Stack>
      </Paper>
    </Stack>
  );
};
