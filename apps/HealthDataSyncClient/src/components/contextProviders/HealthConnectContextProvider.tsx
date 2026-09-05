import React, { createContext, useState, ReactNode } from 'react';
import { healthConnectService } from '../../lib/services/healthConnect/healthConnectService';
import { RecordType, ReadRecordsResult } from 'react-native-health-connect';
import { HealthConnectReadRange } from '../../lib/services/healthConnect/healthConnectTypes';
import { utils } from '../../lib/utils';
import { getResource } from '../../lib/localization';

type HealthConnectContextType = {
  isInitialized: boolean;
  ensurePermissions: () => Promise<boolean>;
  readMetric: <TMetric extends RecordType>(
    metric: TMetric,
    range?: HealthConnectReadRange,
  ) => Promise<ReadRecordsResult<TMetric> | null>;
  readLastMetric: <TMetric extends RecordType>(
    metric: TMetric,
  ) => Promise<ReadRecordsResult<TMetric> | null>;
};

const HealthConnectContext = createContext<HealthConnectContextType | null>(
  null,
);

type HealthConnectProviderProps = {
  children: ReactNode;
};

const HealthConnectProvider = ({ children }: HealthConnectProviderProps) => {
  const healthConnectServiceRef = React.useRef(healthConnectService);
  const [isInitialized, setIsInitialized] = useState(false);

  const ensurePermissions = React.useCallback(async () => {
    if (healthConnectServiceRef.current == null) {
      return false;
    }
    return await healthConnectServiceRef.current.ensurePermissions();
  }, []);

  const readMetric = React.useCallback(
    async <TMetric extends RecordType>(
      metric: TMetric,
      range?: HealthConnectReadRange,
    ): Promise<ReadRecordsResult<TMetric> | null> => {
      if (healthConnectServiceRef.current == null) {
        return null;
      }

      if (!range) {
        range = {
          startTime: utils.getStartOfDay(new Date()),
          endTime: new Date(),
        };
      }
      return await healthConnectServiceRef.current.readMetric(metric, range);
    },
    [],
  );

  const readLastMetric = React.useCallback(
    async <TMetric extends RecordType>(
      metric: TMetric,
    ): Promise<ReadRecordsResult<TMetric> | null> => {
      if (healthConnectServiceRef.current == null) {
        return null;
      }

      return await healthConnectServiceRef.current.readLastMetric(metric);
    },
    [],
  );

  React.useEffect(() => {
    const initialize = async () => {
      if (healthConnectServiceRef.current == null) {
        throw new Error(
          getResource(
            'healthConnect.descriptionHealthConnectServiceUnavailable',
          ),
        );
      }

      const result = await healthConnectServiceRef.current.initialize();

      setIsInitialized(result);
    };
    initialize();
  }, []);

  return (
    <HealthConnectContext.Provider
      value={{ isInitialized, readMetric, ensurePermissions, readLastMetric }}
    >
      {children}
    </HealthConnectContext.Provider>
  );
};

export { HealthConnectProvider, HealthConnectContext };
