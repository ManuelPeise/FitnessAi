import type { PropsWithChildren } from "react";
import { Box } from "@mui/material";

const FormFieldRow: React.FC<PropsWithChildren> = ({ children }) => (
  <Box sx={{ display: "flex", gap: 2, padding: 2 }}>{children}</Box>
);

export default FormFieldRow;
