import React from "react";
import { Box } from "@mui/material";
import SaveCancelButton from "./SaveCancelButton";
import type { FormContainerButtonProps } from "./FormContainer";

type SaveCancelButtonContainerProps = {
  buttonProps: FormContainerButtonProps[];
  additionalButtonProps?: FormContainerButtonProps[];
};

const SaveCancelButtonContainer: React.FC<SaveCancelButtonContainerProps> = (
  props,
) => {
  const { buttonProps, additionalButtonProps } = props;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        p: 1,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 1 }}>
        {additionalButtonProps?.map((button) => (
          <SaveCancelButton key={button.type} {...button} />
        ))}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
        {buttonProps.map((button) => (
          <SaveCancelButton key={button.type} {...button} />
        ))}
      </Box>
    </Box>
  );
};

export default React.memo(SaveCancelButtonContainer);
