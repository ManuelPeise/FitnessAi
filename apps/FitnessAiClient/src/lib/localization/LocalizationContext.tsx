import React, { createContext, useState, useEffect, useCallback } from 'react';
import { LocalizationContextProps } from '../../types/localization/LocalizationContextProps';
import { useTranslation } from 'react-i18next';

export const LocalizationContext =
  createContext<LocalizationContextProps | null>(null);

const LocalizationContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { t } = useTranslation();
  const [locale, setLocale] = useState<'en' | 'de'>('en');

  const getResource = useCallback(
    (nameSpace: string, key: string): string => {
      return t(`${nameSpace}.${key}`);
    },
    [locale],
  );

  const setLocaleAsync = async (newLocale: 'en' | 'de') => {
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
