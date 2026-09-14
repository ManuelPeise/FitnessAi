import { useContext } from "react";
import {
  AuthenticationStateContext,
  type AuthenticationState,
} from "./AuthenticationStateContext";

export const useAuthenticationState = (): AuthenticationState => {
  const context = useContext(AuthenticationStateContext);

  if (context === null) {
    throw new Error(
      "useAuthenticationState must be used within an AuthenticationStateProvider.",
    );
  }

  return context;
};
