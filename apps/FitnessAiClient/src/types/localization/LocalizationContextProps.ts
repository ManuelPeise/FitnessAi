import { LanguageTypeEnum } from '../enums/LanguageTypeEnum';

export type LocalizationContextProps = {
  locale: LanguageTypeEnum;
  getResource: (nameSpace: string, key: string) => string;
  setLocale: (locale: LanguageTypeEnum) => Promise<void>;
};
