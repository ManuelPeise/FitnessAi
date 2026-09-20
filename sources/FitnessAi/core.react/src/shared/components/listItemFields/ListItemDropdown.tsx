import React from "react";
import ListItem from "@mui/material/ListItem";
import { ListItemText, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Dropdown from "../Dropdown";

type ListItemDropdownProps = {
  title: string;
  subtitle?: string;
  placeholder?: string;
  value: string | number;
  options: { label: string; value: string | number }[];
  divider?: boolean;
  fullWidth?: boolean;
  minWidth?: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement, Element>) => void;
};

const ListItemDropdown: React.FC<ListItemDropdownProps> = ({
  title,
  subtitle,
  placeholder,
  value,
  options,
  divider = false,
  fullWidth,
  minWidth,
  onChange,
}) => {
  return (
    <ListItem
      sx={{ flexDirection: "column", alignItems: "stretch", gap: 0.5 }}
      divider={divider}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
        <ListItemText primary={title} sx={{ flex: 1, margin: 0 }} />
        <Dropdown
          value={value}
          options={options}
          placeholder={placeholder}
          onChange={onChange}
          fullWidth={fullWidth ?? false}
          minWidth={minWidth}
        />
      </Box>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </ListItem>
  );
};

export default ListItemDropdown;
