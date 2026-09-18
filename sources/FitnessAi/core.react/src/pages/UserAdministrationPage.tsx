import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import SettingsPageLayout from "../app/layout/SettingsPageLayout";
import { useI18n } from "../lib/i18n/useI18n";
import { useAuthenticationState } from "../features/authentication/useAuthenticationState";
import { UserListPanel } from "../features/userAdministration/components/UserListPanel";
import { UserDetailsPanel } from "../features/userAdministration/components/UserDetailsPanel";
import { useUserAdministration } from "../features/userAdministration/hooks/useUserAdministration";

const UserAdministrationPage = () => {
  const { getResource } = useI18n();
  const { user: currentUser } = useAuthenticationState();
  const {
    users,
    selectedUserId,
    setSelectedUserId,
    selectedUser,
    isLoadingDetails,
    isSaving,
    error,
    updateRoles,
    updateActiveState,
    softDeleteUser,
    restoreUser,
  } = useUserAdministration();

  return (
    <SettingsPageLayout
      titleResourceKey="common.labelUserAdministration"
      listContent={
        <UserListPanel users={users} selectedUserId={selectedUserId} onSelectUser={setSelectedUserId} />
      }
    >
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {getResource("common.requestFailed")}
        </Typography>
      )}

      {selectedUserId === null && (
        <Typography color="text.secondary">{getResource("common.userAdministrationSelectUser")}</Typography>
      )}

      {selectedUserId !== null && (isLoadingDetails || selectedUser === null) && (
        <Stack sx={{ alignItems: "center", py: 6 }}>
          <CircularProgress color="primary" />
        </Stack>
      )}

      {selectedUser !== null && (
        <UserDetailsPanel
          user={selectedUser}
          isSelf={selectedUser.id === Number(currentUser?.id)}
          isSaving={isSaving}
          onUpdateRoles={updateRoles}
          onUpdateActiveState={updateActiveState}
          onSoftDelete={softDeleteUser}
          onRestore={restoreUser}
        />
      )}
    </SettingsPageLayout>
  );
};

export default UserAdministrationPage;
