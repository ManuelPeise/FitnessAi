import * as Keychain from 'react-native-keychain';
import { SupportedLanguage } from '../../localization';

export enum SecureStorageKeys {
  USER_INFO = 'USER_INFO',
}

export type UserInfo = {
  userId: number | null;
  isAuthenticated: boolean;
  selectedLanguage: SupportedLanguage;
};

export const secureStorage = {
  async getItem(key: SecureStorageKeys): Promise<string | null> {
    const credentials = await Keychain.getGenericPassword({
      service: key,
    });

    if (!credentials) {
      return null;
    }

    return credentials.password;
  },

  async setItem(key: SecureStorageKeys, value: string): Promise<void> {
    await Keychain.setGenericPassword('storage', value, {
      service: key,
    });
  },

  async removeItem(key: SecureStorageKeys): Promise<void> {
    await Keychain.resetGenericPassword({
      service: key,
    });
  },
};
