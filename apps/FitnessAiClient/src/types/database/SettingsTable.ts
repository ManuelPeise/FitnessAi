import type { TableBase } from './TabelBase';
import type { LanguageTypeEnum } from '../enums/LanguageTypeEnum';

export type SettingsTable = TableBase & {
  userId: number;
  lang: LanguageTypeEnum;
};
