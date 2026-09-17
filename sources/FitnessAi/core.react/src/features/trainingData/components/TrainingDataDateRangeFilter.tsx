import Stack from "@mui/material/Stack";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";
import { useI18n } from "../../../lib/i18n/useI18n";

type TrainingDataDateRangeFilterProps = {
  from: string | null;
  to: string | null;
  onChange: (from: string | null, to: string | null) => void;
};

export function TrainingDataDateRangeFilter({ from, to, onChange }: TrainingDataDateRangeFilterProps) {
  const { getResource } = useI18n();

  const handleFromChange = (value: Dayjs | null): void => {
    onChange(value?.isValid() ? value.startOf("day").toISOString() : null, to);
  };

  const handleToChange = (value: Dayjs | null): void => {
    onChange(from, value?.isValid() ? value.endOf("day").toISOString() : null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack direction="row" sx={{ gap: 2 }}>
        <DatePicker
          label={getResource("common.labelDateFrom")}
          value={from ? dayjs(from) : null}
          onChange={handleFromChange}
          slotProps={{ textField: { variant: "standard" } }}
        />
        <DatePicker
          label={getResource("common.labelDateTo")}
          value={to ? dayjs(to) : null}
          onChange={handleToChange}
          slotProps={{ textField: { variant: "standard" } }}
        />
      </Stack>
    </LocalizationProvider>
  );
}
