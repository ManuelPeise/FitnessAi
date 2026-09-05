import * as Keychain from 'react-native-keychain';

export enum SecureStorageKeys {
  ACCESS_TOKEN = 'ACCESS_TOKEN',
  REFRESH_TOKEN = 'REFRESH_TOKEN',
}

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
