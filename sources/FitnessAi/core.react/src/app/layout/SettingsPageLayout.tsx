import { Stack, Box, Typography, Paper } from "@mui/material";
import React from "react";
import type { PropsWithChildren, ReactNode } from "react";
import { useI18n } from "../../lib/i18n/useI18n";

type SettingsPageLayoutProps = PropsWithChildren & {
  titleResourceKey: string;
  subtitleResourceKey?: string;
  listContent?: ReactNode;
};

const SettingsPageLayout: React.FC<SettingsPageLayoutProps> = (props) => {
  const { children, listContent } = props;
  const { getResource } = useI18n();

  return (
    <Stack>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          {getResource(props.titleResourceKey)}
        </Typography>
        {props.subtitleResourceKey && (
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            {getResource(props.subtitleResourceKey)}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
        <Paper sx={{ width: "20%", maxWidth: "20%", borderRadius: 0 }}>
          {listContent}
        </Paper>
        <Paper sx={{ flex: 1, p: 2, borderRadius: 0 }}>{children}</Paper>
      </Box>
    </Stack>
  );
};

export default SettingsPageLayout;
