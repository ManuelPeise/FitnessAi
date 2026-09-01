import React from 'react';
import {
  secureStorage,
  SecureStorageKeys,
} from '../lib/services/storage/secureStorage';

export const useSecureStorage = <TModel>(key: SecureStorageKeys) => {
  const [item, setItemState] = React.useState<TModel | null>(null);

  const getItem = async (): Promise<void> => {
    const json = await secureStorage.getItem(key);

    if (json) {
      const parsed = JSON.parse(json) as TModel;
      setItemState(parsed);
    }
  };

  const setItem = async (value: TModel): Promise<void> => {
    const json = JSON.stringify(value);
    await secureStorage.setItem(key, json);
    setItemState(value);
  };

  const removeItem = async (): Promise<void> => {
    await secureStorage.removeItem(key);
    setItemState(null);
  };

  React.useEffect(() => {
    getItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    item,
    getItem,
    setItem,
    removeItem,
  };
};
