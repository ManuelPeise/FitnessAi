import { useContext } from 'react';
import { LocalizationContext } from '../lib/localization/LocalizationContext';
import { LocalizationContextProps } from '../types/localization/LocalizationContextProps';

export const useI18n = (): LocalizationContextProps => {
  const ctx = useContext(LocalizationContext);

  if (!ctx) {
    throw new Error(
      'useI18n must be used within a LocalizationContextProvider',
    );
  }
  return ctx;
};
