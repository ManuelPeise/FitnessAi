import React from 'react';
import {
  HealthConnectMappingType,
  MappingTableEntry,
} from '../lib/database/databaseTypes';
import { databaseAccessor } from '../lib/database/database';
import { healthConnectService } from '../lib/services/healthConnect/healthConnectService';

type HealthConnectModalProps = {
  isVisible: boolean;
  mapping: MappingTableEntry | null;
};

type UseHealthConnectMappingsReturnType = {
  isLoading: boolean;
  mappings: MappingTableEntry[];
  modalProps: HealthConnectModalProps | null;
  handleModalStateChanged: (
    isVisible: boolean,
    mapping: MappingTableEntry | null,
  ) => void;
  updateMapping: (
    id: number,
    mappingUpdate: Partial<MappingTableEntry>,
  ) => void;
  initializeOriginMappings: () => Promise<void>;
  initializeMetricMappings: () => Promise<void>;
};

export const useHealthConnectMappings = (
  type: HealthConnectMappingType,
): UseHealthConnectMappingsReturnType => {
  const mappingDatabaseRef = React.useRef(databaseAccessor.mappingTable);
  const healthConnectServiceRef = React.useRef(healthConnectService);

  const [mappings, setMappings] = React.useState<MappingTableEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [modalProps, setModalProps] = React.useState<HealthConnectModalProps>({
    isVisible: false,
    mapping: null,
  });

  const handleModalStateChanged = React.useCallback(
    (isVisible: boolean, mapping: MappingTableEntry | null) => {
      setModalProps(
        isVisible
          ? { isVisible, mapping }
          : { isVisible: false, mapping: null },
      );
    },
    [],
  );

  const loadMappings = React.useCallback(async () => {
    const mappingsFromDb =
      await databaseAccessor.mappingTable.getMappingEntries(type);

    setMappings(mappingsFromDb);
  }, [type]);

  const updateMapping = React.useCallback(
    async (id: number, mappingUpdate: Partial<MappingTableEntry>) => {
      const mappingEntry = mappings.find(mapping => mapping.id === id);

      if (!mappingEntry) {
        return;
      }

      const updatedMappingEntry: MappingTableEntry = {
        ...mappingEntry,
        ...mappingUpdate,
      };
      const mappingsFromDb =
        await mappingDatabaseRef.current.updateMappingEntry(
          id,
          updatedMappingEntry,
        );

      setMappings(mappingsFromDb);
    },
    [mappings],
  );

  const initializeOriginMappings = React.useCallback(async () => {
    try {
      setIsLoading(true);

      const existingMappings =
        await databaseAccessor.mappingTable.getMappingEntries(type);
      const availableOrigins =
        await healthConnectServiceRef.current.getAvailableOrigins();

      const originsToProcess = availableOrigins.filter(
        origin => !existingMappings.some(mapping => mapping.source === origin),
      );

      if (originsToProcess.length > 0) {
        const newMappings: MappingTableEntry[] = originsToProcess.map(
          origin => {
            return {
              id: -1,
              type: type,
              isActive: false,
              source: origin,
              target: '',
            };
          },
        );

        const mappingsFromDb =
          await mappingDatabaseRef.current.addMappingEntries(newMappings);

        setMappings(mappingsFromDb);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  const initializeMetricMappings = React.useCallback(async () => {
    try {
      setIsLoading(true);

      const existingMappings =
        await databaseAccessor.mappingTable.getMappingEntries(type);

      const grantedPermissions =
        await healthConnectServiceRef.current.getGrantedPermissions();

      const metricTypes = grantedPermissions.map(
        permission => permission.recordType,
      );

      const metricTypesToProcess = metricTypes.filter(
        metricType =>
          !existingMappings.some(mapping => mapping.source === metricType),
      );

      if (metricTypesToProcess.length > 0) {
        const newMappings: MappingTableEntry[] = metricTypesToProcess.map(
          metricType => {
            return {
              id: -1,
              type: type,
              isActive: false,
              source: metricType,
              target: '',
            };
          },
        );

        const mappingsFromDb =
          await mappingDatabaseRef.current.addMappingEntries(newMappings);
        setMappings(mappingsFromDb);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  React.useEffect(() => {
    const onLoad = async () => {
      setIsLoading(true);
      await loadMappings();
      setIsLoading(false);
    };
    onLoad();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isLoading,
    mappings,
    modalProps,
    handleModalStateChanged,
    updateMapping,
    initializeOriginMappings,
    initializeMetricMappings,
  };
};
