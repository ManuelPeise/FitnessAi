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

type MappingFeedback = {
  kind: 'info' | 'warning' | 'error';
  message: string;
};

type UseHealthConnectMappingsReturnType = {
  isLoading: boolean;
  mappings: MappingTableEntry[];
  feedback: MappingFeedback | null;
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
  const [feedback, setFeedback] = React.useState<MappingFeedback | null>(null);
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
    try {
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
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getResource(
          'healthConnect.descriptionMappingInitializationFailed',
        ),
      });
      console.error(
        getResource('healthConnect.descriptionMappingInitializationFailed'),
        error,
      );
    }
  }, [currentUserId, type]);

  const updateMapping = React.useCallback(
    async (id: number, mappingUpdate: Partial<MappingTableEntry>) => {
      if (currentUserId == null) {
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
              target: origin,
            };
          },
        );

        const mappingsFromDb =
          await mappingDatabaseRef.current.addMappingEntries(
            currentUserId,
            newMappings,
          );

        setMappings(mappingsFromDb);
        setFeedback({
          kind: 'info',
          message: `${getResource(
            'healthConnect.descriptionMappingInitializationSucceededPrefix',
          )} ${originsToProcess.length}.`,
        });
      } else {
        setFeedback({
          kind: 'warning',
          message: getResource('healthConnect.descriptionNoNewMappingsFound'),
        });
      }
    } catch (err) {
      setFeedback({
        kind: 'error',
        message: getResource(
          'healthConnect.descriptionMappingInitializationFailed',
        ),
      });
      console.error(
        getResource('healthConnect.descriptionMappingInitializationFailed'),
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
              target: metricType,
            };
          },
        );

        const mappingsFromDb =
          await mappingDatabaseRef.current.addMappingEntries(
            currentUserId,
            newMappings,
          );
        setMappings(mappingsFromDb);
        setFeedback({
          kind: 'info',
          message: `${getResource(
            'healthConnect.descriptionMappingInitializationSucceededPrefix',
          )} ${metricTypesToProcess.length}.`,
        });
      } else {
        setFeedback({
          kind: 'warning',
          message: getResource('healthConnect.descriptionNoNewMappingsFound'),
        });
      }
    } catch (err) {
      setFeedback({
        kind: 'error',
        message: getResource(
          'healthConnect.descriptionMappingInitializationFailed',
        ),
      });
      console.error(
        getResource('healthConnect.descriptionMappingInitializationFailed'),
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
    feedback,
    modalProps,
    handleModalStateChanged,
    updateMapping,
    initializeOriginMappings,
    initializeMetricMappings,
  };
};
