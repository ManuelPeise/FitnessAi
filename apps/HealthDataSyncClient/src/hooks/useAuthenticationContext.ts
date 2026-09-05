import { useContext } from 'react';
import { AuthenticationContext } from '../components/contextProviders/AuthenticationContentProvider';
import { getResource } from '../lib/localization';

export const useAuthenticationContext = () => {
  const ctx = useContext(AuthenticationContext);

  if (!ctx) {
    throw new Error(
      getResource('common.descriptionMissingAuthenticationContext'),
    );
  }

  return ctx;
};
