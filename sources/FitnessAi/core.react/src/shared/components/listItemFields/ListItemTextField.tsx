import React from "react";
import { Box, ListItem, ListItemText, Typography } from "@mui/material";
import { AppTextField } from "src/shared/components/AppTextField";

type ListItemTextFieldProps = {
  title: string;
  subtitle?: string;
  placeholder?: string;
  value: string;
  divider?: boolean;
  fullWidth?: boolean;
  minWidth?: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement, Element>) => void;
};

const ListItemTextField: React.FC<ListItemTextFieldProps> = (props) => {
  const {
    title,
    subtitle,
    value,
    onChange,
    placeholder,
    divider,
    fullWidth,
    minWidth,
  } = props;

  return (
    <ListItem
      sx={{ flexDirection: "column", alignItems: "stretch", gap: 0.5 }}
      divider={divider}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
        <ListItemText primary={title} sx={{ flex: 1, margin: 0 }} />
        <AppTextField
          value={value}
          onChange={onChange}
          placeholder={placeholder}
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

export default ListItemTextField;
