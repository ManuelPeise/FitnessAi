import React from "react";
import type { FormContainerButtonProps } from "./FormContainer";
import { Button } from "@mui/material";

type SaveCancelButtonProps = FormContainerButtonProps;

const SaveCancelButton: React.FC<SaveCancelButtonProps> = (props) => {
  const { disabled, onClick, label, type } = props;

  return (
    <Button
      disabled={disabled}
      onClick={onClick}
      size="small"
      variant="contained"
      color={
        type === "Cancel"
          ? "inherit"
          : type === "Additional"
            ? "secondary"
            : "primary"
      }
      sx={{ mr: 1 }}
    >
      {label}
    </Button>
  );
};

export default SaveCancelButton;
