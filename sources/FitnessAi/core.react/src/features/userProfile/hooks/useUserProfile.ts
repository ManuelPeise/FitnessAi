import { useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";
import { userProfileApi } from "../userProfileApi";
import type { ChangePasswordRequest, UpdateUserProfileRequest, UserProfile } from "../userProfile.types";

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState<"incorrectCurrentPassword" | "unknown" | null>(null);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

  useEffect(() => {
    let isActive = true;

    void userProfileApi.getProfile().then((result) => {
      if (isActive) {
        setProfile(result);
        setIsLoading(false);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  const saveProfile = useCallback(async (request: UpdateUserProfileRequest): Promise<void> => {
    setIsSaving(true);
    setSaveError(false);
    setSaveSuccess(false);

    try {
      await userProfileApi.updateProfile(request);
      const refreshed = await userProfileApi.getProfile();
      setProfile(refreshed);
      setSaveSuccess(true);
    } catch {
      setSaveError(true);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const changePassword = useCallback(async (request: ChangePasswordRequest): Promise<void> => {
    setIsChangingPassword(true);
    setPasswordChangeError(null);
    setPasswordChangeSuccess(false);

    try {
      await userProfileApi.changePassword(request);
      setPasswordChangeSuccess(true);
    } catch (error) {
      const isUnauthorized = error instanceof AxiosError && error.response?.status === 401;
      setPasswordChangeError(isUnauthorized ? "incorrectCurrentPassword" : "unknown");
    } finally {
      setIsChangingPassword(false);
    }
  }, []);

  return {
    profile,
    isLoading,
    isSaving,
    saveError,
    saveSuccess,
    isChangingPassword,
    passwordChangeError,
    passwordChangeSuccess,
    saveProfile,
    changePassword,
  };
}
