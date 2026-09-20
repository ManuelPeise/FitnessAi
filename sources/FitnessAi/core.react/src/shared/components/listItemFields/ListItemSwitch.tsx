import React from "react";
import { Switch, ListItem, ListItemText } from "@mui/material";

interface ListItemSwitchProps {
  caption: string;
  description?: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const ListItemSwitch: React.FC<ListItemSwitchProps> = (props) => {
  return (
    <ListItem>
      <ListItemText primary={props.caption} secondary={props.description} />
      <Switch
        checked={props.checked}
        onChange={props.onChange}
        disabled={props.disabled}
      />
    </ListItem>
  );
};

export default ListItemSwitch;
