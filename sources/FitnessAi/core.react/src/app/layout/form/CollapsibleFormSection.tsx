import React from "react";
import type { PropsWithChildren } from "react";
import { Box, Divider, IconButton, Stack, Typography } from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
type CollapsibleFormSectionProps = PropsWithChildren & {
  title: string;
  subtitle: string;
  startCollapsed?: boolean;
  disabled?: boolean;
  hasDivider?: boolean;
};

const CollapsibleFormSection: React.FC<CollapsibleFormSectionProps> = (
  props,
) => {
  const {
    title,
    subtitle,
    startCollapsed = false,
    hasDivider = true,
    disabled = false,
    children,
  } = props;
  const [collapsed, setCollapsed] = React.useState(startCollapsed);

  return (
    <Stack>
      <Box
        sx={{
          padding: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="subtitle1">{subtitle}</Typography>
        </Box>
        <Box>
          <IconButton
            onClick={() => setCollapsed(!collapsed)}
            disabled={disabled}
          >
            {collapsed ? <ExpandMore /> : <ExpandLess />}
          </IconButton>
        </Box>
      </Box>
      {!collapsed && <Box sx={{ padding: 0 }}>{children}</Box>}
      {hasDivider && <Divider />}
    </Stack>
  );
};

export default CollapsibleFormSection;
