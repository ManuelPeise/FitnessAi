import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AppButton } from "../../../shared/components/AppButton";
import { AppTextField } from "../../../shared/components/AppTextField";
import { useForm } from "../../../shared/hooks/useForm";
import { useI18n } from "../../../lib/i18n/useI18n";
import type { ChangePasswordRequest } from "../userProfile.types";

type ChangePasswordFormValues = ChangePasswordRequest & {
  confirmNewPassword: string;
};

const initialValues: ChangePasswordFormValues = {
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

const validate = (values: ChangePasswordFormValues): string | undefined =>
  values.newPassword !== values.confirmNewPassword ? "passwordMismatch" : undefined;

type ChangePasswordFormProps = {
  onChangePassword: (request: ChangePasswordRequest) => Promise<void>;
  isChangingPassword: boolean;
  passwordChangeError: "incorrectCurrentPassword" | "unknown" | null;
  passwordChangeSuccess: boolean;
};

export function ChangePasswordForm({
  onChangePassword,
  isChangingPassword,
  passwordChangeError,
  passwordChangeSuccess,
}: ChangePasswordFormProps) {
  const { getResource } = useI18n();
  const { useField, useFormState, handleSubmit, setValue } = useForm<ChangePasswordFormValues>({
    initialValues,
    validate,
    onSubmit: async (values) => {
      await onChangePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
      setValue("currentPassword", "");
      setValue("newPassword", "");
      setValue("confirmNewPassword", "");
    },
  });
  const currentPassword = useField("currentPassword");
  const newPassword = useField("newPassword");
  const confirmNewPassword = useField("confirmNewPassword");
  const { isSubmitting, validationError } = useFormState();
  const isFormIncomplete =
    currentPassword.value.trim() === "" || newPassword.value.trim() === "" || confirmNewPassword.value.trim() === "";

  return (
    <Paper sx={{ p: 3 }}>
      <Stack component="form" onSubmit={handleSubmit} sx={{ gap: 2 }}>
        <Typography variant="h6">{getResource("common.labelChangePassword")}</Typography>

        <AppTextField
          type="password"
          label={getResource("common.currentPassword")}
          autoComplete="current-password"
          {...currentPassword}
          required
          sx={{ maxWidth: 320 }}
        />
        <AppTextField
          type="password"
          label={getResource("common.password")}
          autoComplete="new-password"
          {...newPassword}
          required
          sx={{ maxWidth: 320 }}
        />
        <AppTextField
          type="password"
          label={getResource("common.confirmPassword")}
          autoComplete="new-password"
          {...confirmNewPassword}
          required
          sx={{ maxWidth: 320 }}
        />

        {validationError === "passwordMismatch" && (
          <Alert severity="error" role="alert">
            {getResource("common.passwordMismatch")}
          </Alert>
        )}
        {passwordChangeError === "incorrectCurrentPassword" && (
          <Alert severity="error" role="alert">
            {getResource("common.incorrectCurrentPassword")}
          </Alert>
        )}
        {passwordChangeError === "unknown" && (
          <Alert severity="error" role="alert">
            {getResource("common.requestFailed")}
          </Alert>
        )}
        {passwordChangeSuccess && <Alert severity="success">{getResource("common.passwordChangeSuccess")}</Alert>}

        <AppButton
          type="submit"
          disabled={isSubmitting || isChangingPassword || isFormIncomplete}
          sx={{ alignSelf: "flex-start" }}
        >
          {getResource("common.labelChangePassword")}
        </AppButton>
      </Stack>
    </Paper>
  );
}
