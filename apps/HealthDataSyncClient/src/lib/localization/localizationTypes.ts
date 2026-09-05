export type SupportedLanguage = 'en' | 'de';

export type LocalizationNamespace = 'common' | 'healthConnect';

export interface ILocaleProps {
  getResource: (resource: string) => string;
  onLanguageChanged: (language: SupportedLanguage) => void;
}
