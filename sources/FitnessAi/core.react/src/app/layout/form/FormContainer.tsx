import { Box, Stack } from "@mui/material";
import React, { type PropsWithChildren } from "react";
import SaveCancelButtonContainer from "./SaveCancelButtonContainer";

type FormContainerButtonType = "Cancel" | "Submit" | "Additional";

export type FormContainerButtonProps = {
  type: FormContainerButtonType;
  label: string;
  disabled?: boolean;
  onClick: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void | Promise<void>;
};

type FormContainerProps = PropsWithChildren & {
  buttonProps: FormContainerButtonProps[];
  additionalButtonProps?: FormContainerButtonProps[];
  isModified?: boolean;
  isInAction?: boolean;
};

const FormContainer: React.FC<FormContainerProps> = ({
  children,
  buttonProps,
  additionalButtonProps,
  isModified,
  isInAction,
}) => {
  const showButtons = isModified && !isInAction;

  return (
    <Stack>
      <Box>{children}</Box>
      <SaveCancelButtonContainer
        buttonProps={buttonProps}
        additionalButtonProps={additionalButtonProps}
        disabled={!showButtons}
      />
    </Stack>
  );
};

export default React.memo(FormContainer);
