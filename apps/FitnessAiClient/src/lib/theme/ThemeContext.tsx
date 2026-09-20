import React, { createContext, PropsWithChildren, useMemo } from 'react';
import { ThemeContextProps } from '../../types/theme/ThemeContextProps';
import { theme } from './theme';

export const ThemeContext = createContext<ThemeContextProps | null>(null);

const ThemeContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const contextValue = useMemo<ThemeContextProps>(() => ({ theme }), []);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;
