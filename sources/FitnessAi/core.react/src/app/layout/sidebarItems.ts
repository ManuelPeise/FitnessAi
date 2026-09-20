import type { OverridableComponent } from "@mui/material/OverridableComponent";
import { UserRoleEnum, hasRole } from "../../lib/enums/userRoleEnum";
import type { SvgIconTypeMap } from "@mui/material";
import {
  Dashboard,
  AccountBox,
  AdminPanelSettingsRounded,
  Psychology,
  FitnessCenterRounded,
  CellTower,
} from "@mui/icons-material";

export type SidebarItem = {
  path: string | null;
  icon?: OverridableComponent<SvgIconTypeMap<object, "svg">> & {
    muiName: string;
  };
  label: string;
  isVisible: boolean;
  isActive: boolean;
  isCollapsed: boolean;
  subItems: SidebarItem[];
  sortOrder: number;
  position?: "top" | "bottom";
};

export const getSidebarItems = (
  role: UserRoleEnum,
  getResource: (key: string) => string,
): SidebarItem[] => {
  return [
    {
      path: "/dashboard",
      label: getResource("Dashboard"),
      icon: Dashboard,
      isVisible:
        hasRole(role, UserRoleEnum.Admin) || hasRole(role, UserRoleEnum.User),
      isActive: true,
      isCollapsed: false,
      subItems: [],
      sortOrder: 0,
      position: "top",
    },
    {
      path: "/administration",
      label: getResource("common.labelAdministration"),
      icon: AdminPanelSettingsRounded,
      isVisible:
        hasRole(role, UserRoleEnum.Admin) || hasRole(role, UserRoleEnum.User),
      isActive: false,
      isCollapsed: false,
      subItems: [
        {
          path: "/administration/users",
          label: getResource("common.labelUser"),
          isVisible:
            hasRole(role, UserRoleEnum.Admin) ||
            hasRole(role, UserRoleEnum.User),
          isActive: false,
          isCollapsed: false,
          subItems: [],
          sortOrder: 0,
        },
      ],
      sortOrder: 1,
      position: "top",
    },
    {
      path: "/ai",
      label: getResource("common.labelAI"),
      icon: Psychology,
      isVisible: hasRole(role, UserRoleEnum.Admin),
      isActive: false,
      isCollapsed: false,
      subItems: [
        {
          path: "/ai/training",
          label: getResource("common.labelAITraining"),
          isVisible: hasRole(role, UserRoleEnum.Admin),
          isActive: false,
          isCollapsed: false,
          subItems: [],
          sortOrder: 0,
        },
      ],
      sortOrder: 2,
      position: "top",
    },
    {
      path: "/interfaces",
      label: getResource("common.labelInterfaces"),
      icon: CellTower,
      isVisible: hasRole(role, UserRoleEnum.User),
      isActive: false,
      isCollapsed: false,
      subItems: [
        {
          path: "/interfaces/health-connect",
          label: getResource("common.labelHealthConnect"),
          isVisible: hasRole(role, UserRoleEnum.User),
          isActive: false,
          isCollapsed: false,
          subItems: [],
          sortOrder: 0,
        },
      ],
      sortOrder: 3,
      position: "top",
    },
    {
      path: "/training",
      label: getResource("common.labelTraining"),
      icon: FitnessCenterRounded,
      isVisible: hasRole(role, UserRoleEnum.User),
      isActive: false,
      isCollapsed: false,
      subItems: [
        {
          path: "/training/sessions",
          label: getResource("common.labelTrainingSessions"),
          isVisible: hasRole(role, UserRoleEnum.User),
          isActive: false,
          isCollapsed: false,
          subItems: [],
          sortOrder: 0,
        },
      ],
      sortOrder: 4,
      position: "top",
    },
    {
      path: "/user",
      label: getResource("common.labelProfile"),
      icon: AccountBox,
      isVisible:
        hasRole(role, UserRoleEnum.Admin) || hasRole(role, UserRoleEnum.User),
      isActive: false,
      isCollapsed: false,
      subItems: [
        {
          path: "/user/details",
          label: getResource("common.labelDetails"),
          isVisible:
            hasRole(role, UserRoleEnum.Admin) ||
            hasRole(role, UserRoleEnum.User),
          isActive: false,
          isCollapsed: false,
          subItems: [],
          sortOrder: 0,
        },
        {
          path: "/user/settings",
          label: getResource("common.labelSettings"),
          isVisible:
            hasRole(role, UserRoleEnum.Admin) ||
            hasRole(role, UserRoleEnum.User),
          isActive: false,
          isCollapsed: false,
          subItems: [],
          sortOrder: 1,
        },
      ],
      sortOrder: 3,
      position: "bottom",
    },
  ];
};
