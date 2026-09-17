import { useState } from "react";
import { aiTrainingApi } from "../aiTrainingApi";
import { downloadFile } from "../../../shared/lib/downloadFile";

export type ActionStatus = { severity: "success" | "error"; messageKey: string } | null;

const defaultInitialTrainingItemsCount = 200;

export function useTrainingFileActions() {
  const [status, setStatus] = useState<ActionStatus>(null);
  const [isBusy, setIsBusy] = useState(false);

  const runAction = async (action: () => Promise<void>, successKey?: string): Promise<void> => {
    setIsBusy(true);
    setStatus(null);

    try {
      await action();
      setStatus(successKey ? { severity: "success", messageKey: successKey } : null);
    } catch {
      setStatus({ severity: "error", messageKey: "common.requestFailed" });
    } finally {
      setIsBusy(false);
    }
  };

  const downloadInitial = (): Promise<void> =>
    runAction(async () => {
      const blob = await aiTrainingApi.downloadInitialTrainingCsv(defaultInitialTrainingItemsCount);
      downloadFile(blob, "training-data-initial.csv");
    });

  const downloadExisting = (): Promise<void> =>
    runAction(async () => {
      const blob = await aiTrainingApi.downloadExistingTrainingCsv();

      if (blob) {
        downloadFile(blob, "training-data-current.csv");
      }
    });

  const uploadFile = (file: File): Promise<void> =>
    runAction(async () => {
      await aiTrainingApi.uploadTrainingCsv(file);
    }, "common.uploadSuccess");

  return {
    status,
    isBusy,
    downloadInitial,
    downloadExisting,
    uploadFile,
  };
}
