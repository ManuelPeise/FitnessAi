import React from "react";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Toolbar from "@mui/material/Toolbar";
import { useLocation, useNavigate } from "react-router-dom";
import { getSidebarItems, type SidebarItem } from "./sidebarItems";
import { SidebarNavItem } from "./SidebarNavItem";
import { UserRoleEnum } from "../../lib/enums/userRoleEnum";
import { Typography } from "@mui/material";

export const sidebarWidth = 260;

type SidebarProps = {
  isOpen: boolean;
  role: UserRoleEnum;
  onClose: () => void;
  getResource: (key: string) => string;
};

const sortedVisibleItems = (items: SidebarItem[]): SidebarItem[] =>
  items
    .filter((item) => item.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder);

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  role,
  onClose,
  getResource,
}) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const sidebarItems = React.useMemo(
    () => sortedVisibleItems(getSidebarItems(role, getResource)),
    [role, getResource],
  );
  const topItems = sidebarItems.filter((item) => item.position !== "bottom");
  const bottomItems = sidebarItems.filter((item) => item.position === "bottom");

  const handleNavigate = (path: string): void => {
    navigate(path);
    onClose();
  };

  return (
    <Drawer
      variant="temporary"
      open={isOpen}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: sidebarWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: sidebarWidth,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Toolbar>
        <Typography variant="h6" component="div">
          {getResource("common.appName")}
        </Typography>
      </Toolbar>
      <Divider />
      <List component="nav" sx={{ flexGrow: 1 }}>
        {topItems.map((item) => (
          <SidebarNavItem
            key={item.path ?? item.label}
            item={item}
            pathname={pathname}
            onNavigate={handleNavigate}
          />
        ))}
      </List>
      {bottomItems.length > 0 && (
        <>
          <Divider />
          <List component="nav">
            {bottomItems.map((item) => (
              <SidebarNavItem
                key={item.path ?? item.label}
                item={item}
                pathname={pathname}
                onNavigate={handleNavigate}
              />
            ))}
          </List>
        </>
      )}
    </Drawer>
  );
};

export default Sidebar;
