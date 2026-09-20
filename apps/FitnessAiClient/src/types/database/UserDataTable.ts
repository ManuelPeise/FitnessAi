import { TableBase } from './TabelBase';

export type UserDataTable = TableBase & {
  firstName: string;
  lastName: string;
  email: string;
  credentialsId: number;
};
