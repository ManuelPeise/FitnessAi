import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import { PageHeader } from "../shared/components/PageHeader";
import { useI18n } from "../lib/i18n/useI18n";
import { ChangePasswordForm } from "../features/userProfile/components/ChangePasswordForm";
import { UserProfileForm } from "../features/userProfile/components/UserProfileForm";
import { useUserProfile } from "../features/userProfile/hooks/useUserProfile";

const UserProfilePage = () => {
  const { getResource } = useI18n();
  const {
    profile,
    isLoading,
    isSaving,
    saveError,
    saveSuccess,
    isChangingPassword,
    passwordChangeError,
    passwordChangeSuccess,
    saveProfile,
    changePassword,
  } = useUserProfile();

  return (
    <Stack sx={{ gap: 3 }}>
      <PageHeader title={getResource("common.labelProfile")} />

      {isLoading || profile === null ? (
        <Stack sx={{ alignItems: "center", py: 6 }}>
          <CircularProgress color="primary" />
        </Stack>
      ) : (
        <>
          <UserProfileForm
            profile={profile}
            onSave={saveProfile}
            isSaving={isSaving}
            saveError={saveError}
            saveSuccess={saveSuccess}
          />
          <ChangePasswordForm
            onChangePassword={changePassword}
            isChangingPassword={isChangingPassword}
            passwordChangeError={passwordChangeError}
            passwordChangeSuccess={passwordChangeSuccess}
          />
        </>
      )}
    </Stack>
  );
};

export default UserProfilePage;
