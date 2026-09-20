import { useMemo } from "react";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AppButton } from "../../../shared/components/AppButton";
import { AppTextField } from "../../../shared/components/AppTextField";
import { useForm } from "../../../shared/hooks/useForm";
import { useI18n } from "../../../lib/i18n/useI18n";
import type {
  UpdateUserProfileRequest,
  UserProfile,
} from "../userProfile.types";
import FormContainer, {
  type FormContainerButtonProps,
} from "src/app/layout/form/FormContainer";

type ProfileFormValues = {
  firstName: string;
  lastName: string;
  height: string;
  weight: string;
  bodyFatPercentageAvg: string;
  waist: string;
  abdomen: string;
  shoulderWidth: string;
};

type UserProfileFormProps = {
  profile: UserProfile;
  onSave: (request: UpdateUserProfileRequest) => Promise<void>;
  isSaving: boolean;
  saveError: boolean;
  saveSuccess: boolean;
};

const toDisplayValue = (value: number | null): string =>
  value === null ? "" : String(value);
const toRequestValue = (value: string): number | null =>
  value.trim() === "" ? null : Number(value);

const toFormValues = (profile: UserProfile): ProfileFormValues => ({
  firstName: profile.firstName,
  lastName: profile.lastName,
  height: toDisplayValue(profile.height),
  weight: toDisplayValue(profile.weight),
  bodyFatPercentageAvg: toDisplayValue(profile.bodyFatPercentageAvg),
  waist: toDisplayValue(profile.waist),
  abdomen: toDisplayValue(profile.abdomen),
  shoulderWidth: toDisplayValue(profile.shoulderWidth),
});

const calculateBmi = (height: string, weight: string): number => {
  const heightCm = Number(height);
  const weightKg = Number(weight);

  if (!heightCm || !weightKg) {
    return 0;
  }

  return weightKg / (heightCm / 100) ** 2;
};

export function UserProfileForm({
  profile,
  onSave,
  isSaving,
  saveError,
  saveSuccess,
}: UserProfileFormProps) {
  const { getResource } = useI18n();
  const formValues = useMemo(() => toFormValues(profile), [profile]);
  const { useField, useFormState, useModel, handleSubmit } =
    useForm<ProfileFormValues>({
      initialValues: formValues,
      onSubmit: (values) =>
        onSave({
          firstName: values.firstName,
          lastName: values.lastName,
          height: toRequestValue(values.height),
          weight: toRequestValue(values.weight),
          bodyFatPercentageAvg: toRequestValue(values.bodyFatPercentageAvg),
          waist: toRequestValue(values.waist),
          abdomen: toRequestValue(values.abdomen),
          shoulderWidth: toRequestValue(values.shoulderWidth),
        }),
    });

  useModel(formValues);

  const firstName = useField("firstName");
  const lastName = useField("lastName");
  const height = useField("height");
  const weight = useField("weight");
  const bodyFatPercentageAvg = useField("bodyFatPercentageAvg");
  const waist = useField("waist");
  const abdomen = useField("abdomen");
  const shoulderWidth = useField("shoulderWidth");
  const { isDirty } = useFormState();

  const bmi = calculateBmi(height.value, weight.value);

  const saveButtonProps = useMemo((): FormContainerButtonProps[] => {
    return [
      {
        type: "Cancel",
        label: getResource("common.labelCancel"),
        disabled: !isDirty,
        onClick: () => {},
      },
      {
        type: "Submit",
        label: getResource("common.labelSave"),
        disabled: !isDirty,
        onClick: handleSubmit,
      },
    ];
  }, [getResource, isDirty, handleSubmit]);

  return (
    <Paper sx={{ p: 3 }}>
      <FormContainer
        isModified={isDirty}
        isInAction={isSaving}
        buttonProps={saveButtonProps}
      >
        <Stack component="form" sx={{ gap: 2 }}>
          <Typography variant="h6">
            {getResource("common.labelProfile")}
          </Typography>

          <Stack direction="row" sx={{ gap: 2, flexWrap: "wrap" }}>
            <AppTextField
              label={getResource("common.firstName")}
              {...firstName}
              required
              sx={{ minWidth: 220 }}
            />
            <AppTextField
              label={getResource("common.lastName")}
              {...lastName}
              required
              sx={{ minWidth: 220 }}
            />
          </Stack>

          <AppTextField
            label={getResource("common.email")}
            value={profile.email}
            disabled
            sx={{ maxWidth: 460 }}
          />

          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
            {getResource("common.labelBodyData")}
          </Typography>

          <Stack direction="row" sx={{ gap: 2, flexWrap: "wrap" }}>
            <AppTextField
              type="number"
              label={getResource("common.labelHeight")}
              {...height}
              sx={{ minWidth: 160 }}
            />
            <AppTextField
              type="number"
              label={getResource("common.labelWeight")}
              {...weight}
              sx={{ minWidth: 160 }}
            />
            <AppTextField
              type="number"
              label={getResource("common.labelBodyFatPercentage")}
              {...bodyFatPercentageAvg}
              sx={{ minWidth: 160 }}
            />
          </Stack>

          <Stack direction="row" sx={{ gap: 2, flexWrap: "wrap" }}>
            <AppTextField
              type="number"
              label={getResource("common.labelWaist")}
              {...waist}
              sx={{ minWidth: 160 }}
            />
            <AppTextField
              type="number"
              label={getResource("common.labelAbdomen")}
              {...abdomen}
              sx={{ minWidth: 160 }}
            />
            <AppTextField
              type="number"
              label={getResource("common.labelShoulderWidth")}
              {...shoulderWidth}
              sx={{ minWidth: 160 }}
            />
          </Stack>

          <AppTextField
            label={getResource("common.labelBmi")}
            value={bmi > 0 ? bmi.toFixed(1) : "-"}
            disabled
          />

          {saveError && (
            <Alert severity="error" role="alert">
              {getResource("common.profileUpdateFailed")}
            </Alert>
          )}
          {saveSuccess && (
            <Alert severity="success">
              {getResource("common.profileUpdateSuccess")}
            </Alert>
          )}

          <AppButton
            type="submit"
            disabled={isSaving || !isDirty}
            sx={{ alignSelf: "flex-start" }}
          >
            {getResource("common.saveChanges")}
          </AppButton>
        </Stack>
      </FormContainer>
    </Paper>
  );
}
