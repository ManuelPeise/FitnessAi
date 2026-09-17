import React from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import { Outlet } from "react-router-dom";
import AppBar from "./AppBar";
import Sidebar from "./Sidebar";
import { UserRoleEnum } from "../../lib/enums/userRoleEnum";
import { useI18n } from "../../lib/i18n/useI18n";
import { useAuthenticationState } from "../../features/authentication/useAuthenticationState";

const AppLayout: React.FC = () => {
  const { getResource } = useI18n();
  const { user } = useAuthenticationState();
  const [isSideMenuOpen, setIsSideMenuOpen] = React.useState(false);

  const toggleSideMenu = (): void => setIsSideMenuOpen((previous) => !previous);
  const closeSideMenu = (): void => setIsSideMenuOpen(false);

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar sideMenuOpen={isSideMenuOpen} onToggleSideMenu={toggleSideMenu} />
      <Sidebar
        isOpen={isSideMenuOpen}
        onClose={closeSideMenu}
        role={user?.role ?? UserRoleEnum.User}
        getResource={getResource}
      />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;
