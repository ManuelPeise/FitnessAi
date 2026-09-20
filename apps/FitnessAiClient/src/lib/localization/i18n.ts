import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import commonEn from './resourses/en/common.en.json';
import de from './resourses/de/common.de.json';

const resources = { en: { common: commonEn }, de: { common: de } };

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
