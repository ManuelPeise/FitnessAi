import { useContext } from 'react';
import { ThemeContext } from '../lib/theme/ThemeContext';
import { ThemeContextProps } from '../types/theme/ThemeContextProps';

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeContextProvider');
  }
  return context;
};
