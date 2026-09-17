import { useState, type ReactNode } from "react";
import { I18nContext, type Language } from "./I18nContext";
import commonDe from "./resources/de/common.de.json";
import commonEn from "./resources/en/common.json";

type ResourceNamespace = Record<string, string>;

const resources: Record<Language, Record<string, ResourceNamespace>> = {
  en: { common: commonEn },
  de: { common: commonDe },
};

function getValue(
  resources: Record<string, ResourceNamespace>,
  key: string,
): string | undefined {
  const separatorIndex = key.indexOf(".");

  if (separatorIndex === -1) {
    return undefined;
  }

  const namespace = key.slice(0, separatorIndex);
  const flatKey = key.slice(separatorIndex + 1);

  return resources[namespace]?.[flatKey];
}

type I18nProviderProps = {
  children: ReactNode;
};

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguage] = useState<Language>("en");

  function getResource(key: string, params?: Record<string, string>): string {
    const template =
      getValue(resources[language], key) ?? getValue(resources.en, key) ?? key;

    if (!params) {
      return template;
    }

    return Object.entries(params).reduce(
      (result, [paramKey, paramValue]) =>
        result.replaceAll(`{${paramKey}}`, paramValue),
      template,
    );
  }

  function toggleLanguage(nextLanguage: Language): void {
    setLanguage(nextLanguage);
  }

  return (
    <I18nContext value={{ getResource, toggleLanguage }}>
      {children}
    </I18nContext>
  );
}
