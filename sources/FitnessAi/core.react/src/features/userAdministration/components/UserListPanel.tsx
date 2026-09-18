import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import type { UserAdministrationListItem } from "../userAdministration.types";

type UserListPanelProps = {
  users: UserAdministrationListItem[];
  selectedUserId: number | null;
  onSelectUser: (userId: number) => void;
};

export function UserListPanel({ users, selectedUserId, onSelectUser }: UserListPanelProps) {
  return (
    <List>
      {users.map((user) => (
        <ListItemButton
          key={user.id}
          selected={user.id === selectedUserId}
          onClick={() => onSelectUser(user.id)}
          sx={{ opacity: user.deletedAt !== null ? 0.5 : 1 }}
        >
          <ListItemText
            primary={`${user.firstName} ${user.lastName}`}
            secondary={user.email}
            slotProps={{
              primary: { sx: { textDecoration: user.deletedAt !== null ? "line-through" : "none" } },
            }}
          />
        </ListItemButton>
      ))}
    </List>
  );
}
