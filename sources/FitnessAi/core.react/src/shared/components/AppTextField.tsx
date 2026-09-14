import TextField, { type TextFieldProps } from "@mui/material/TextField";

export type AppTextFieldProps = TextFieldProps;

export const AppTextField = (props: AppTextFieldProps) => (
  <TextField fullWidth variant="outlined" {...props} />
);
