import { useState } from "react";
import Alert from "@mui/material/Alert";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { AppButton } from "../../../shared/components/AppButton";
import { AppTextField } from "../../../shared/components/AppTextField";
import { useI18n } from "../../../lib/i18n/useI18n";
import { UserRoleEnum, hasRole } from "../../../lib/enums/userRoleEnum";
import type { UserAdministrationDetails } from "../userAdministration.types";
import { DeleteUserDialog } from "./DeleteUserDialog";

type UserDetailsPanelProps = {
  user: UserAdministrationDetails;
  isSelf: boolean;
  isSaving: boolean;
  onUpdateRoles: (userId: number, userRole: UserRoleEnum) => Promise<void>;
  onUpdateActiveState: (userId: number, isActive: boolean) => Promise<void>;
  onSoftDelete: (userId: number) => Promise<void>;
  onRestore: (userId: number) => Promise<void>;
};

const toggleRole = (roles: UserRoleEnum, role: UserRoleEnum, isChecked: boolean): UserRoleEnum =>
  (isChecked ? roles | role : roles & ~role) as UserRoleEnum;

export function UserDetailsPanel({
  user,
  isSelf,
  isSaving,
  onUpdateRoles,
  onUpdateActiveState,
  onSoftDelete,
  onRestore,
}: UserDetailsPanelProps) {
  const { getResource } = useI18n();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const isDeleted = user.deletedAt !== null;
  const disabled = isSelf || isSaving;

  return (
    <Stack sx={{ gap: 2 }}>
      <Typography variant="h6">{`${user.firstName} ${user.lastName}`}</Typography>

      <Stack direction="row" sx={{ gap: 2, flexWrap: "wrap" }}>
        <AppTextField label={getResource("common.firstName")} value={user.firstName} disabled sx={{ flex: 1, minWidth: 220 }} />
        <AppTextField label={getResource("common.lastName")} value={user.lastName} disabled sx={{ flex: 1, minWidth: 220 }} />
      </Stack>

      <AppTextField label={getResource("common.email")} value={user.email} disabled />

      {isSelf && <Alert severity="info">{getResource("common.userAdministrationSelfLocked")}</Alert>}
      {isDeleted && <Alert severity="warning">{getResource("common.userAdministrationDeleted")}</Alert>}

      <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
        {getResource("common.userAdministrationRoles")}
      </Typography>
      <Stack direction="row" sx={{ gap: 2, justifyContent: "flex-end" }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={hasRole(user.userRole, UserRoleEnum.User)}
              disabled={disabled}
              onChange={(event) =>
                onUpdateRoles(user.id, toggleRole(user.userRole, UserRoleEnum.User, event.target.checked))
              }
            />
          }
          label={getResource("common.labelUser")}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={hasRole(user.userRole, UserRoleEnum.Admin)}
              disabled={disabled}
              onChange={(event) =>
                onUpdateRoles(user.id, toggleRole(user.userRole, UserRoleEnum.Admin, event.target.checked))
              }
            />
          }
          label={getResource("common.labelAdministration")}
        />
      </Stack>

      <FormControlLabel
        sx={{ alignSelf: "flex-end" }}
        control={
          <Switch
            checked={user.isActive}
            disabled={disabled}
            onChange={(event) => onUpdateActiveState(user.id, event.target.checked)}
          />
        }
        label={getResource("common.userAdministrationActive")}
      />

      <AppButton
        color="error"
        disabled={disabled}
        sx={{ alignSelf: "flex-start" }}
        onClick={() => (isDeleted ? onRestore(user.id) : setIsDeleteDialogOpen(true))}
      >
        {getResource(isDeleted ? "common.userAdministrationRestore" : "common.delete")}
      </AppButton>

      <DeleteUserDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          setIsDeleteDialogOpen(false);
          void onSoftDelete(user.id);
        }}
      />
    </Stack>
  );
}
