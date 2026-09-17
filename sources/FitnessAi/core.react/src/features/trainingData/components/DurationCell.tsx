import { useState } from "react";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { formatDurationSeconds, parseDurationSeconds } from "../trainingDataColumns";

type DurationCellProps = {
  value: number | null;
  onCommit: (value: number | null) => void;
};

const toDraft = (value: number | null): string => (value === null ? "" : formatDurationSeconds(value));

// Displays/edits the duration as "HH:MM:SS" while the persisted value stays a plain number of
// seconds - mirrors EditableNumberCell's display/persist separation, just with a time format
// instead of integer rounding.
export function DurationCell({ value, onCommit }: DurationCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [lastValue, setLastValue] = useState(value);
  const [draft, setDraft] = useState(toDraft(value));

  if (value !== lastValue) {
    setLastValue(value);
    setDraft(toDraft(value));
  }

  const commit = (): void => {
    setIsEditing(false);
    onCommit(parseDurationSeconds(draft));
  };

  if (!isEditing) {
    return (
      <Typography
        component="span"
        variant="body2"
        onClick={() => setIsEditing(true)}
        sx={{ display: "inline-block", minWidth: 64, textAlign: "right", cursor: "text" }}
      >
        {value === null ? "" : formatDurationSeconds(value)}
      </Typography>
    );
  }

  return (
    <TextField
      variant="standard"
      size="small"
      autoFocus
      placeholder="HH:MM:SS"
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
        }
      }}
      sx={{ width: 96 }}
      slotProps={{ htmlInput: { style: { textAlign: "right" } } }}
    />
  );
}
