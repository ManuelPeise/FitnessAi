import React from "react";
import { Checkbox, FormControlLabel } from "@mui/material";

type AppCheckboxProps = {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const AppCheckbox: React.FC<AppCheckboxProps> = ({
  label,
  checked,
  disabled,
  onChange,
}) => {
  return (
    <FormControlLabel
      control={
        <Checkbox checked={checked} disabled={disabled} onChange={onChange} />
      }
      label={label}
    />
  );
};

export default AppCheckbox;
