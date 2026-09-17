import type { OverridableComponent } from "@mui/material/OverridableComponent";
import { UserRoleEnum } from "../../lib/enums/userRoleEnum";
import type { SvgIconTypeMap } from "@mui/material";
import {
  Dashboard,
  AccountBox,
  AdminPanelSettingsRounded,
  Psychology,
  FitnessCenterRounded,
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
      isVisible: role === UserRoleEnum.Admin || role === UserRoleEnum.User,
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
      isVisible: role === UserRoleEnum.Admin || role === UserRoleEnum.User,
      isActive: false,
      isCollapsed: false,
      subItems: [
        {
          path: "/administration/user",
          label: getResource("common.labelUser"),
          isVisible: role === UserRoleEnum.Admin || role === UserRoleEnum.User,
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
      isVisible: role === UserRoleEnum.Admin,
      isActive: false,
      isCollapsed: false,
      subItems: [
        {
          path: "/ai/training",
          label: getResource("common.labelAITraining"),
          isVisible: role === UserRoleEnum.Admin,
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
      path: "/training",
      label: getResource("common.labelTraining"),
      icon: FitnessCenterRounded,
      isVisible: role === UserRoleEnum.Admin || role === UserRoleEnum.User,
      isActive: false,
      isCollapsed: false,
      subItems: [],
      sortOrder: 4,
      position: "top",
    },
    {
      path: "/user",
      label: getResource("common.labelProfile"),
      icon: AccountBox,
      isVisible: role === UserRoleEnum.Admin || role === UserRoleEnum.User,
      isActive: false,
      isCollapsed: false,
      subItems: [
        {
          path: "/user/details",
          label: getResource("common.labelDetails"),
          isVisible: role === UserRoleEnum.Admin || role === UserRoleEnum.User,
          isActive: false,
          isCollapsed: false,
          subItems: [],
          sortOrder: 0,
        },
        {
          path: "/user/settings",
          label: getResource("common.labelSettings"),
          isVisible: role === UserRoleEnum.Admin || role === UserRoleEnum.User,
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
