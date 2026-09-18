import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { AppButton } from "../../../shared/components/AppButton";
import { useI18n } from "../../../lib/i18n/useI18n";

type DeleteUserDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteUserDialog({ open, onClose, onConfirm }: DeleteUserDialogProps) {
  const { getResource } = useI18n();

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{getResource("common.userAdministrationDeleteConfirmTitle")}</DialogTitle>
      <DialogContent>
        <DialogContentText>{getResource("common.userAdministrationDeleteConfirmMessage")}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <AppButton onClick={onClose}>{getResource("common.cancel")}</AppButton>
        <AppButton color="error" onClick={onConfirm}>
          {getResource("common.delete")}
        </AppButton>
      </DialogActions>
    </Dialog>
  );
}
