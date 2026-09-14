import { createContext } from "react";

export type Language = "en" | "de";

export type I18nContextValue = {
  getResource: (key: string) => string;
  toggleLanguage: (language: Language) => void;
};

export const I18nContext = createContext<I18nContextValue | null>(null);
