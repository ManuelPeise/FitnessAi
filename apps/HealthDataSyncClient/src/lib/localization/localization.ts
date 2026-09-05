import { LocalizationNamespace, SupportedLanguage } from './localizationTypes';
import commonEn from './resources/en/common.en.json';
import healthConnectEn from './resources/en/health-connect.json';
import commonDe from './resources/de/common.de.json';
import healthConnectDe from './resources/de/health-connect.de.json';

type ResourceDictionary = Record<string, string>;
type NamespaceResources = Record<LocalizationNamespace, ResourceDictionary>;

const localizationResources: Record<SupportedLanguage, NamespaceResources> = {
  en: {
    common: commonEn as ResourceDictionary,
    healthConnect: healthConnectEn as ResourceDictionary,
  },
  de: {
    common: commonDe as ResourceDictionary,
    healthConnect: healthConnectDe as ResourceDictionary,
  },
};

type LanguageListener = () => void;

let currentLanguage: SupportedLanguage = 'en';
const languageListeners = new Set<LanguageListener>();

export const subscribeLanguageChanged = (
  listener: LanguageListener,
): (() => void) => {
  languageListeners.add(listener);
  return () => {
    languageListeners.delete(listener);
  };
};

const notifyLanguageChanged = () => {
  languageListeners.forEach(listener => listener());
};

export const getCurrentLanguage = (): SupportedLanguage => {
  return currentLanguage;
};

export const onLanguageChanged = (language: SupportedLanguage): void => {
  if (currentLanguage === language) {
    return;
  }

  currentLanguage = language;
  notifyLanguageChanged();
};

const getValue = (
  language: SupportedLanguage,
  namespace: LocalizationNamespace,
  key: string,
): string | null => {
  const resource = localizationResources[language]?.[namespace]?.[key];
  return typeof resource === 'string' ? resource : null;
};

export const getResource = (resource: string): string => {
  const [namespace, ...keyParts] = resource.split('.');
  const key = keyParts.join('.');

  if (!namespace || key.length === 0) {
    return resource;
  }

  const castNamespace = namespace as LocalizationNamespace;
  const value =
    getValue(currentLanguage, castNamespace, key) ??
    getValue('en', castNamespace, key);

  return value ?? resource;
};
