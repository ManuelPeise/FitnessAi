import React from "react";
import { AppBar as MuiAppBar, LinearProgress, Toolbar, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import LogoutIcon from "@mui/icons-material/Logout";
import ButtonWithIcon from "../../shared/components/ButtonWithIcon";
import { useAuthenticationState } from "../../features/authentication/useAuthenticationState";
import { useI18n } from "../../lib/i18n/useI18n";
import { useHttpActivity } from "../../lib/api";

type AppBarProps = {
  sideMenuOpen: boolean;
  onToggleSideMenu: () => void;
};

const AppBar: React.FC<AppBarProps> = (props) => {
  const { sideMenuOpen, onToggleSideMenu } = props;
  const { getResource } = useI18n();
  const { logout, user } = useAuthenticationState();
  const isLoading = useHttpActivity();

  return (
    <MuiAppBar position="fixed">
      <Toolbar>
        <ButtonWithIcon
          icon={sideMenuOpen ? MenuOpenIcon : MenuIcon}
          onClick={onToggleSideMenu}
          color="inherit"
          edge="start"
          ariaLabel={getResource(
            sideMenuOpen ? "common.layout.closeMenu" : "common.layout.openMenu",
          )}
        />
        <Typography variant="h6" component="div" sx={{ ml: 2, flexGrow: 1 }}>
          {getResource("common.appName")}
        </Typography>
        <Typography
          variant="body1"
          component="div"
          sx={{ mr: 2, fontSize: 16 }}
        >
          {user?.email}
        </Typography>
        <ButtonWithIcon
          icon={LogoutIcon}
          onClick={logout}
          color="inherit"
          edge="end"
          ariaLabel={getResource("common.signOut")}
        />
      </Toolbar>
      {isLoading && (
        <LinearProgress sx={{ position: "absolute", bottom: 0, left: 0, right: 0 }} />
      )}
    </MuiAppBar>
  );
};

export default AppBar;
