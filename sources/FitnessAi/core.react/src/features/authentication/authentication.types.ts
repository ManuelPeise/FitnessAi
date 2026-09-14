export type AuthenticatedUser = {
  id: string;
  email: string;
  displayName?: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};
