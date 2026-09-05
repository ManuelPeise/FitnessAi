import { useContext } from 'react';
import { AuthenticationContext } from '../components/contextProviders/AuthenticationContentProvider';

export const useAuthenticationContext = () => {
  const ctx = useContext(AuthenticationContext);

  if (!ctx) {
    throw new Error(
      'useAuthenticationContext must be used within an AuthenticationProvider',
    );
  }

  return ctx;
};
