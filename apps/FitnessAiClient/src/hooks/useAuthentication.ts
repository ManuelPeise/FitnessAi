import { useContext } from 'react';
import { AuthenticationContext } from '../lib/authentication/AuthenticationContextProvider';
import { AuthenticationContextProps } from '../types/authentication/AuthenticationContextProps';

const useAuthentication = (): AuthenticationContextProps => {
  const context = useContext(AuthenticationContext);

  if (!context) {
    throw new Error(
      'useAuthentication must be used within an AuthenticationContextProvider',
    );
  }
  return context;
};

export default useAuthentication;
