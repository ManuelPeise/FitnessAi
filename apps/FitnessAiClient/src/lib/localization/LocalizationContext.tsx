import React, { createContext, useState, useCallback } from 'react';
import { LocalizationContextProps } from '../../types/localization/LocalizationContextProps';
import { LanguageTypeEnum } from '../../types/enums/LanguageTypeEnum';
import { useTranslation } from 'react-i18next';

export const LocalizationContext =
  createContext<LocalizationContextProps | null>(null);

const LocalizationContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { t } = useTranslation();
  const [locale, setLocale] = useState<LanguageTypeEnum>(LanguageTypeEnum.EN);

  const getResource = useCallback(
    (nameSpace: string, key: string): string => {
      return t(key, { ns: nameSpace });
    },
    [locale],
  );

  const setLocaleAsync = async (newLocale: LanguageTypeEnum) => {
    // TODO: implement db update later
    setLocale(newLocale);
  };

  const contextValue: LocalizationContextProps = {
    locale,
    getResource,
    setLocale: setLocaleAsync,
  };

  return (
    <LocalizationContext.Provider value={contextValue}>
      {children}
    </LocalizationContext.Provider>
  );
};

export default LocalizationContextProvider;
