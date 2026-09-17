import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import { useI18n } from "../../../lib/i18n/useI18n";
import { trainingDataColumns, type TrainingDataColumnKey } from "../trainingDataColumns";

export type TrainingDataDisplayMode = "default" | "compact";

type TrainingDataSettingsPanelProps = {
  open: boolean;
  onClose: () => void;
  visibleColumns: Set<TrainingDataColumnKey>;
  onToggleColumn: (key: TrainingDataColumnKey) => void;
  onSetColumnsVisible: (keys: TrainingDataColumnKey[], visible: boolean) => void;
  displayMode: TrainingDataDisplayMode;
  onDisplayModeChange: (mode: TrainingDataDisplayMode) => void;
};

export function TrainingDataSettingsPanel({
  open,
  onClose,
  visibleColumns,
  onToggleColumn,
  onSetColumnsVisible,
  displayMode,
  onDisplayModeChange,
}: TrainingDataSettingsPanelProps) {
  const { getResource } = useI18n();
  const defaultColumns = trainingDataColumns.filter((column) => column.defaultVisible);
  const optionalColumns = trainingDataColumns.filter((column) => !column.defaultVisible);
  const optionalColumnKeys = optionalColumns.map((column) => column.key);
  const visibleOptionalCount = optionalColumnKeys.filter((key) => visibleColumns.has(key)).length;
  const areAllOptionalColumnsVisible = visibleOptionalCount === optionalColumnKeys.length;
  const areSomeOptionalColumnsVisible = visibleOptionalCount > 0 && !areAllOptionalColumnsVisible;

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 300 }} role="presentation">
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", p: 2 }}>
          <Typography variant="h6">{getResource("common.tableSettingsTitle")}</Typography>
          <IconButton onClick={onClose} aria-label={getResource("common.close")}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <Divider />

        <Stack sx={{ p: 2, gap: 0.5 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {getResource("common.labelDisplayMode")}
          </Typography>
          <RadioGroup
            value={displayMode}
            onChange={(event) => onDisplayModeChange(event.target.value as TrainingDataDisplayMode)}
          >
            <FormControlLabel value="default" control={<Radio />} label={getResource("common.displayMode.default")} />
            <FormControlLabel value="compact" control={<Radio />} label={getResource("common.displayMode.compact")} />
          </RadioGroup>
        </Stack>
        <Divider />

        <Stack sx={{ p: 2, gap: 0.5 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {getResource("common.labelDefaultColumns")}
          </Typography>
          {defaultColumns.map((column) => (
            <FormControlLabel
              key={column.key}
              control={<Checkbox checked={visibleColumns.has(column.key)} onChange={() => onToggleColumn(column.key)} />}
              label={getResource(column.labelKey)}
            />
          ))}

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            {getResource("common.labelOptionalColumns")}
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={areAllOptionalColumnsVisible}
                indeterminate={areSomeOptionalColumnsVisible}
                onChange={(_event, checked) => onSetColumnsVisible(optionalColumnKeys, checked)}
              />
            }
            label={getResource("common.labelSelectAll")}
          />
          {optionalColumns.map((column) => (
            <FormControlLabel
              key={column.key}
              control={<Checkbox checked={visibleColumns.has(column.key)} onChange={() => onToggleColumn(column.key)} />}
              label={getResource(column.labelKey)}
            />
          ))}
        </Stack>
      </Box>
    </Drawer>
  );
}
