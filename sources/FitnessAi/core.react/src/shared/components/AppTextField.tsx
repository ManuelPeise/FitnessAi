import TextField, { type TextFieldProps } from "@mui/material/TextField";

export type AppTextFieldProps = TextFieldProps & {
  fullWidth?: boolean;
  minWidth?: number;
};

export const AppTextField = (props: AppTextFieldProps) => {
  const { fullWidth = false, minWidth = 300, ...rest } = props;
  return (
    <TextField
      fullWidth={fullWidth}
      variant="standard"
      sx={{ minWidth: minWidth }}
      {...rest}
    />
  );
};
