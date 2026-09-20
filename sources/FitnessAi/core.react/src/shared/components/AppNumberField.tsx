import React from "react";

import TextField, { type TextFieldProps } from "@mui/material/TextField";

export type AppNumberFieldProps = TextFieldProps & {
  fullWidth?: boolean;
  minWidth?: number;
};

const AppNumberField: React.FC<AppNumberFieldProps> = (props) => {
  const { fullWidth, minWidth, ...rest } = props;
  return (
    <TextField
      fullWidth={fullWidth}
      variant="standard"
      sx={{ minWidth: minWidth }}
      {...rest}
    />
  );
};

export default AppNumberField;
