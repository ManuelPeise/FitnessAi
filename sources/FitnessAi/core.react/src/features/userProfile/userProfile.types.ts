export type UserProfile = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  height: number | null;
  weight: number | null;
  bodyFatPercentageAvg: number | null;
  waist: number | null;
  abdomen: number | null;
  shoulderWidth: number | null;
  bmi: number;
};

export type UpdateUserProfileRequest = {
  firstName: string;
  lastName: string;
  height: number | null;
  weight: number | null;
  bodyFatPercentageAvg: number | null;
  waist: number | null;
  abdomen: number | null;
  shoulderWidth: number | null;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};
