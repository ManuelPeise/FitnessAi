import React from "react";
import Collapse from "@mui/material/Collapse";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import type { SidebarItem } from "./sidebarItems";

type SidebarNavItemProps = {
  item: SidebarItem;
  pathname: string;
  depth?: number;
  onNavigate: (path: string) => void;
};

const isActivePath = (path: string | null, pathname: string): boolean =>
  path !== null && (pathname === path || pathname.startsWith(`${path}/`));

const hasActiveDescendant = (item: SidebarItem, pathname: string): boolean =>
  isActivePath(item.path, pathname) ||
  item.subItems.some((subItem) => hasActiveDescendant(subItem, pathname));

const sortedVisibleItems = (items: SidebarItem[]): SidebarItem[] =>
  items.filter((item) => item.isVisible).sort((a, b) => a.sortOrder - b.sortOrder);

export const SidebarNavItem = ({
  item,
  pathname,
  depth = 0,
  onNavigate,
}: SidebarNavItemProps) => {
  const hasSubItems = item.subItems.length > 0;
  const [isOpen, setIsOpen] = React.useState(() => hasActiveDescendant(item, pathname));
  const ItemIcon = item.icon;

  const handleClick = (): void => {
    if (hasSubItems) {
      setIsOpen((previous) => !previous);
      return;
    }

    if (item.path !== null) {
      onNavigate(item.path);
    }
  };

  return (
    <>
      <ListItemButton
        selected={isActivePath(item.path, pathname)}
        onClick={handleClick}
        sx={{ pl: 2 + depth * 2 }}
      >
        {ItemIcon && (
          <ListItemIcon>
            <ItemIcon />
          </ListItemIcon>
        )}
        <ListItemText primary={item.label} />
      </ListItemButton>

      {hasSubItems && (
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {sortedVisibleItems(item.subItems).map((subItem) => (
              <SidebarNavItem
                key={subItem.path ?? subItem.label}
                item={subItem}
                pathname={pathname}
                depth={depth + 1}
                onNavigate={onNavigate}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};
