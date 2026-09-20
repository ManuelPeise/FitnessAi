import {
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import React from "react";
import { useI18n } from "src/lib/i18n/useI18n";
import type { HealthConnectScheduleSettings } from "../healthConnect.types";

type SettingsSelectionProps = {
  schedules: HealthConnectScheduleSettings[];
  selectedScheduleSettings: HealthConnectScheduleSettings | null;
  handleAddNewSchedule: () => void;
  handleSelectConnection: (setting: HealthConnectScheduleSettings) => void;
};

const HealthConnectConnectionSelection: React.FC<SettingsSelectionProps> = (
  props,
) => {
  const {
    schedules,
    selectedScheduleSettings,
    handleAddNewSchedule,
    handleSelectConnection,
  } = props;
  const { getResource } = useI18n();

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
        <IconButton
          aria-label={getResource("common.labelAddSchedule")}
          onClick={handleAddNewSchedule}
        >
          <AddIcon />
        </IconButton>
      </Box>
      <List sx={{ width: "100%", padding: 0 }}>
        {schedules.map((setting, index) => (
          <ListItemButton
            key={`setting-${index}`}
            selected={
              selectedScheduleSettings?.scheduleId === setting.scheduleId
            }
            onClick={() => handleSelectConnection(setting)}
          >
            <ListItemText primary={setting.name} secondary={setting.deviceId} />
          </ListItemButton>
        ))}
      </List>
    </>
  );
};

export default React.memo(HealthConnectConnectionSelection);
