import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import {
  CloudUpload as CloudUploadIcon,
  CloudDownload as DownloadIcon,
} from "@mui/icons-material";
import { useRef } from "react";
import ButtonWithIcon from "../../../shared/components/ButtonWithIcon";
import { useI18n } from "../../../lib/i18n/useI18n";
import { useTrainingFileActions } from "../hooks/useTrainingFileActions";

export function TrainingFileHeaderActions() {
  const { getResource } = useI18n();
  const { status, isBusy, downloadInitial, downloadExisting, uploadFile } =
    useTrainingFileActions();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";

    if (file) {
      void uploadFile(file);
    }
  };

  return (
    <Stack
      direction="row"
      sx={{ gap: 1, alignItems: "center", flexWrap: "wrap" }}
    >
      <Tooltip title={getResource("common.downloadInitial")}>
        <span>
          <ButtonWithIcon
            icon={CloudDownloadIcon}
            onClick={() => void downloadInitial()}
            ariaLabel={getResource("common.downloadInitial")}
            disabled={isBusy}
          />
        </span>
      </Tooltip>
      <Tooltip title={getResource("common.downloadExisting")}>
        <span>
          <ButtonWithIcon
            icon={DownloadIcon}
            onClick={() => void downloadExisting()}
            ariaLabel={getResource("common.downloadExisting")}
            disabled={isBusy}
          />
        </span>
      </Tooltip>
      <Tooltip title={getResource("common.uploadFile")}>
        <span>
          <ButtonWithIcon
            icon={CloudUploadIcon}
            onClick={() => fileInputRef.current?.click()}
            ariaLabel={getResource("common.uploadFile")}
            disabled={isBusy}
          />
        </span>
      </Tooltip>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        hidden
        onChange={handleFileSelected}
      />

      {status && (
        <Alert severity={status.severity} sx={{ flexBasis: "100%" }}>
          {getResource(status.messageKey)}
        </Alert>
      )}
    </Stack>
  );
}
