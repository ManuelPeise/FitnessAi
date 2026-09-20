import { Badge } from "@mui/material";
import React from "react";
import type { ApiStatusEnum } from "../../../lib/enums/ApiStatusEnum";

export type ApiBadgeState = {
  show: boolean;
  status: ApiStatusEnum;
  message: string | null;
};

const ApiBadge: React.FC<ApiBadgeState> = (props) => {
  const { message, status } = props;
  const [state, setState] = React.useState<ApiBadgeState>({
    show: false,
    status: status,
    message: message,
  });

  React.useEffect(() => {
    if (message) {
      setState({ show: true, status: "error", message: message });
    } else {
      setState({ show: false, status: status, message: message });
    }

    const timer = setTimeout(
      () => setState({ show: false, status: status, message: message }),
      5000,
    );
    return () => clearTimeout(timer);
  }, [message, status]);

  const badgeWidth = React.useMemo((): number => {
    const messageLength = message ? message.length : 0;
    return Math.max(20, messageLength * 8); // Example calculation for badge width
  }, [message]);

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
      badgeContent={state.show ? message : ""}
    />
  );
};

export default ApiBadge;
