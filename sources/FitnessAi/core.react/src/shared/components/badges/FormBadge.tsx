import { Badge } from "@mui/material";
import React from "react";
import type { ApiStatusEnum } from "../../../lib/enums/ApiStatusEnum";

type FormBadgeState = {
  show: boolean;
  status: ApiStatusEnum;
};

type FormBadgeProps = {
  errors: string[];
};

const FormBadge: React.FC<FormBadgeProps> = (props) => {
  const { errors } = props;
  const [state, setState] = React.useState<FormBadgeState>({
    show: false,
    status: "unknown",
  });

  React.useEffect(() => {
    if (errors && errors.length > 0) {
      setState({ show: true, status: "error" });
    } else {
      setState({ show: false, status: "unknown" });
    }

    const timer = setTimeout(
      () => setState({ show: false, status: "unknown" }),
      5000,
    );
    return () => clearTimeout(timer);
  }, [errors]);

  const badgeWidth = React.useMemo((): number => {
    let maxLength = 0;

    errors.forEach((error) => {
      if (error.length > maxLength) {
        maxLength = error.length;
      }
    });
    return Math.max(20, maxLength * 8); // Example calculation for badge width
  }, [errors]);

  return (
    <Badge
      sx={{ width: badgeWidth }}
      color={
        state.status === "error"
          ? "error"
          : state.status === "success"
            ? "success"
            : "default"
      }
      badgeContent={state.show ? errors.join(",\n") : ""}
    />
  );
};

export default FormBadge;
