import { useContext } from 'react';
import { HealthConnectContext } from '../components/contextProviders/HealthConnectContextProvider';

const useHealthConnectContext = () => {
  const context = useContext(HealthConnectContext);
  if (!context) {
    throw new Error(
      'useHealthConnectContext must be used within a HealthConnectProvider',
    );
  }
  return context;
};

export default useHealthConnectContext;
