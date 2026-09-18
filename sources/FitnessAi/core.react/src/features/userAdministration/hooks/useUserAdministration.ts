import { useCallback, useEffect, useState } from "react";
import { userAdministrationApi } from "../userAdministrationApi";
import type { UserAdministrationDetails, UserAdministrationListItem } from "../userAdministration.types";
import type { UserRoleEnum } from "../../../lib/enums/userRoleEnum";

export function useUserAdministration() {
  const [users, setUsers] = useState<UserAdministrationListItem[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserAdministrationDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(false);

  const loadUsers = useCallback(async (): Promise<void> => {
    setIsLoadingUsers(true);
    try {
      setUsers(await userAdministrationApi.getUsers());
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  const loadSelectedUser = useCallback(async (userId: number): Promise<void> => {
    setIsLoadingDetails(true);
    try {
      setSelectedUser(await userAdministrationApi.getUserDetails(userId));
    } finally {
      setIsLoadingDetails(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    const fetchUsers = async (): Promise<void> => {
      setIsLoadingUsers(true);

      try {
        const result = await userAdministrationApi.getUsers();

        if (isActive) {
          setUsers(result);
        }
      } finally {
        if (isActive) {
          setIsLoadingUsers(false);
        }
      }
    };

    void fetchUsers();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (selectedUserId === null) {
      return;
    }

    let isActive = true;

    const fetchSelectedUser = async (): Promise<void> => {
      setIsLoadingDetails(true);

      try {
        const result = await userAdministrationApi.getUserDetails(selectedUserId);

        if (isActive) {
          setSelectedUser(result);
        }
      } finally {
        if (isActive) {
          setIsLoadingDetails(false);
        }
      }
    };

    void fetchSelectedUser();

    return () => {
      isActive = false;
    };
  }, [selectedUserId]);

  const selectUser = useCallback((userId: number | null): void => {
    setSelectedUserId(userId);
    setSelectedUser(null);
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    await loadUsers();

    if (selectedUserId !== null) {
      await loadSelectedUser(selectedUserId);
    }
  }, [loadUsers, loadSelectedUser, selectedUserId]);

  const runMutation = useCallback(
    async (mutate: () => Promise<void>): Promise<void> => {
      setIsSaving(true);
      setError(false);

      try {
        await mutate();
        await refresh();
      } catch {
        setError(true);
      } finally {
        setIsSaving(false);
      }
    },
    [refresh],
  );

  const updateRoles = useCallback(
    (userId: number, userRole: UserRoleEnum) =>
      runMutation(() => userAdministrationApi.updateUserRoles(userId, { userRole })),
    [runMutation],
  );

  const updateActiveState = useCallback(
    (userId: number, isActive: boolean) =>
      runMutation(() => userAdministrationApi.updateActiveState(userId, { isActive })),
    [runMutation],
  );

  const softDeleteUser = useCallback(
    (userId: number) => runMutation(() => userAdministrationApi.softDeleteUser(userId)),
    [runMutation],
  );

  const restoreUser = useCallback(
    (userId: number) => runMutation(() => userAdministrationApi.restoreUser(userId)),
    [runMutation],
  );

  return {
    users,
    isLoadingUsers,
    selectedUserId,
    setSelectedUserId: selectUser,
    selectedUser,
    isLoadingDetails,
    isSaving,
    error,
    updateRoles,
    updateActiveState,
    softDeleteUser,
    restoreUser,
  };
}
