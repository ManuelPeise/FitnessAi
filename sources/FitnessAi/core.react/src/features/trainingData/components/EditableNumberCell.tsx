import { useState } from "react";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

type EditableNumberCellProps = {
  value: number | null;
  onCommit: (value: number | null) => void;
  decimalPlaces?: number;
};

const toDraft = (value: number | null): string => (value === null ? "" : String(value));

// Displays the rounded value at rest (integer by default, or decimalPlaces fixed digits), but
// edits the full-precision value - rounding is purely a display concern and must never overwrite
// the persisted value (see spec: 5.8 -> shown as 6, but committing without editing must not turn
// the stored value into 6).
export function EditableNumberCell({ value, onCommit, decimalPlaces = 0 }: EditableNumberCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [lastValue, setLastValue] = useState(value);
  const [draft, setDraft] = useState(toDraft(value));

  if (value !== lastValue) {
    setLastValue(value);
    setDraft(toDraft(value));
  }

  const commit = (): void => {
    setIsEditing(false);

    if (draft.trim() === "") {
      onCommit(null);
      return;
    }

    const parsed = Number(draft);
    onCommit(Number.isNaN(parsed) ? value : parsed);
  };

  if (!isEditing) {
    return (
      <Typography
        component="span"
        variant="body2"
        onClick={() => setIsEditing(true)}
        sx={{ display: "inline-block", minWidth: 48, textAlign: "right", cursor: "text" }}
      >
        {value === null ? "" : value.toFixed(decimalPlaces)}
      </Typography>
    );
  }

  return (
    <TextField
      type="number"
      variant="standard"
      size="small"
      autoFocus
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
        }
      }}
      sx={{
        width: 96,
        "& input[type=number]": { MozAppearance: "textfield" },
        "& input[type=number]::-webkit-outer-spin-button": { WebkitAppearance: "none", margin: 0 },
        "& input[type=number]::-webkit-inner-spin-button": { WebkitAppearance: "none", margin: 0 },
      }}
      slotProps={{ htmlInput: { style: { textAlign: "right" } } }}
    />
  );
}
