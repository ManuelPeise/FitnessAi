import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

export type PageHeaderProps = {
  title: string;
  children?: ReactNode;
};

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <Stack
      direction="row"
      sx={{
        gap: 2,
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        p: 1,
      }}
    >
      <Typography variant="h4" component="h1">
        {title}
      </Typography>
      {children}
    </Stack>
  );
}
