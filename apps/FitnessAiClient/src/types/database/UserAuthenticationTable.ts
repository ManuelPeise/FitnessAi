import type { TableBase } from './TabelBase';

export type UserAuthenticationTable = TableBase & {
  userId: number;
  jwt: string;
  refreshToken: string;
  expiresAt: string;
};
