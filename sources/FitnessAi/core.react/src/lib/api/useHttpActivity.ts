import { useSyncExternalStore } from "react";
import { getIsHttpActive, subscribeToHttpActivity } from "./httpActivity";

export const useHttpActivity = (): boolean =>
  useSyncExternalStore(subscribeToHttpActivity, getIsHttpActive);
