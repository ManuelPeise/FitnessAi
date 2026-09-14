import { useState, type ReactNode } from "react";
import { I18nContext, type Language } from "./I18nContext";
import commonDe from "./resources/de/common.de.json";
import commonEn from "./resources/en/common.json";

interface ResourceTree {
  [key: string]: string | ResourceTree;
}

const resources: Record<Language, Record<string, ResourceTree>> = {
  en: { common: commonEn },
  de: { common: commonDe },
};

function getValue(
  resources: Record<string, ResourceTree>,
  key: string,
): string | undefined {
  const value = key
    .split(".")
    .reduce<
      string | ResourceTree | undefined
    >((current, segment) => (typeof current === "object" && current !== null ? current[segment] : undefined), resources);

  return typeof value === "string" ? value : undefined;
}

type I18nProviderProps = {
  children: ReactNode;
};

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguage] = useState<Language>("en");

  function getResource(key: string): string {
    return (
      getValue(resources[language], key) ?? getValue(resources.en, key) ?? key
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
