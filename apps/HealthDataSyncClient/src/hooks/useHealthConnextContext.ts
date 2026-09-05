import { useContext } from 'react';
import { HealthConnectContext } from '../components/contextProviders/HealthConnectContextProvider';
import { getResource } from '../lib/localization';

const useHealthConnectContext = () => {
  const context = useContext(HealthConnectContext);
  if (!context) {
    throw new Error(
      getResource('common.descriptionMissingHealthConnectContext'),
    );
  }
  return context;
};

export default useHealthConnectContext;
