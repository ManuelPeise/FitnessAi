import Link, { type LinkProps } from "@mui/material/Link";
import { Link as ReactRouterLink } from "react-router-dom";

type RouterLinkProps = Omit<LinkProps, "href" | "component"> & {
  to: string;
};

export const RouterLink = ({ to, ...linkProps }: RouterLinkProps) => (
  <Link component={ReactRouterLink} to={to} {...linkProps} />
);
