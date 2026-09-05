import React from 'react';
import {
  HealthConnectMappingType,
  MappingTableEntry,
} from '../lib/database/databaseTypes';
import { databaseAccessor } from '../lib/database/database';
import { healthConnectService } from '../lib/services/healthConnect/healthConnectService';
import { useAuthenticationContext } from './useAuthenticationContext';
import { getResource } from '../lib/localization';

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
  const { currentUserId } = useAuthenticationContext();
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
    if (currentUserId == null) {
      setMappings([]);
      return;
    }

    const mappingsFromDb =
      await databaseAccessor.mappingTable.getMappingEntries(
        currentUserId,
        type,
      );

    setMappings(mappingsFromDb);
  }, [currentUserId, type]);

  const updateMapping = React.useCallback(
    async (id: number, mappingUpdate: Partial<MappingTableEntry>) => {
      if (currentUserId == null) {
        console.error(
          getResource(
            'healthConnect.descriptionCannotUpdateMappingWithoutUser',
          ),
        );
        return;
      }

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
          currentUserId,
          id,
          updatedMappingEntry,
        );

      setMappings(mappingsFromDb);
    },
    [currentUserId, mappings],
  );

  const initializeOriginMappings = React.useCallback(async () => {
    try {
      setIsLoading(true);
      if (currentUserId == null) {
        throw new Error(
          getResource('healthConnect.descriptionMissingUserContext'),
        );
      }

      const permissionsEnsured =
        await healthConnectServiceRef.current.ensurePermissions();

      if (!permissionsEnsured) {
        throw new Error(
          getResource('healthConnect.descriptionEnsurePermissionsFailed'),
        );
      }

      const existingMappings =
        await databaseAccessor.mappingTable.getMappingEntries(
          currentUserId,
          type,
        );

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
              userId: currentUserId,
              type: type,
              isActive: false,
              source: origin,
              target: '',
            };
          },
        );

        const mappingsFromDb =
          await mappingDatabaseRef.current.addMappingEntries(
            currentUserId,
            newMappings,
          );

        setMappings(mappingsFromDb);
      }
    } catch (err) {
      console.error(
        getResource('healthConnect.descriptionEnsurePermissionsFailed'),
        err,
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, type]);

  const initializeMetricMappings = React.useCallback(async () => {
    try {
      setIsLoading(true);
      if (currentUserId == null) {
        throw new Error(
          getResource('healthConnect.descriptionMissingUserContext'),
        );
      }

      const permissionsEnsured =
        await healthConnectServiceRef.current.ensurePermissions();

      if (!permissionsEnsured) {
        throw new Error(
          getResource('healthConnect.descriptionEnsurePermissionsFailed'),
        );
      }
      const existingMappings =
        await databaseAccessor.mappingTable.getMappingEntries(
          currentUserId,
          type,
        );

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
              userId: currentUserId,
              type: type,
              isActive: false,
              source: metricType,
              target: '',
            };
          },
        );

        const mappingsFromDb =
          await mappingDatabaseRef.current.addMappingEntries(
            currentUserId,
            newMappings,
          );
        setMappings(mappingsFromDb);
      }
    } catch (err) {
      console.error(
        getResource('healthConnect.descriptionEnsurePermissionsFailed'),
        err,
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, type]);

  React.useEffect(() => {
    const onLoad = async () => {
      setIsLoading(true);
      await loadMappings();
      setIsLoading(false);
    };
    onLoad();
  }, [loadMappings]);

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
