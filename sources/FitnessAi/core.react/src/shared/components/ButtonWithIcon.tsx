import {
  IconButton,
  type IconButtonProps as MuiIconButtonProps,
  type SvgIconTypeMap,
} from "@mui/material";
import type { OverridableComponent } from "@mui/material/OverridableComponent";
import React from "react";

type IconButtonProps = {
  onClick: () => void;
  icon: OverridableComponent<SvgIconTypeMap<object, "svg">> & {
    muiName: string;
  };
  ariaLabel?: string;
  color?: MuiIconButtonProps["color"];
  edge?: MuiIconButtonProps["edge"];
};

const ButtonWithIcon: React.FC<IconButtonProps> = (props) => {
  const { onClick, icon, ariaLabel, color, edge } = props;

  const IconComponent = icon;

  return (
    <IconButton
      onClick={onClick}
      aria-label={ariaLabel}
      color={color}
      edge={edge}
    >
      <IconComponent />
    </IconButton>
  );
};

export default ButtonWithIcon;
