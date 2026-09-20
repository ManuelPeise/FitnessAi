import React from "react";
import { MenuItem, Select, type SelectChangeEvent } from "@mui/material";

type DropdownOption = {
  label: string;
  value: string | number;
};

type DropdownProps = {
  value: string | number;
  options: DropdownOption[];
  placeholder?: string;
  fullWidth?: boolean;
  minWidth?: number;
  disabled?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement, Element>) => void;
};

const Dropdown: React.FC<DropdownProps> = ({
  value,
  options,
  placeholder,
  fullWidth = false,
  minWidth = 300,
  onChange,
  disabled,
}) => {
  const handleChange = React.useCallback(
    (event: SelectChangeEvent<string | number>) => {
      onChange(event as React.ChangeEvent<HTMLInputElement, Element>);
    },
    [onChange],
  );

  return (
    <Select
      variant="standard"
      fullWidth={fullWidth}
      sx={{ minWidth: minWidth ?? 0 }}
      value={value}
      onChange={handleChange}
      displayEmpty={!!placeholder}
      disabled={disabled}
    >
      {placeholder && (
        <MenuItem value="" disabled>
          <em>{placeholder}</em>
        </MenuItem>
      )}
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  );
};

export default Dropdown;
