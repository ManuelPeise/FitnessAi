import React from 'react';
import { databaseAccessor } from '../lib/database/database';
import {
  HealthConnectMappingTableEntry,
  HealthConnectMetricMappingTableEntry,
} from '../lib/database/databaseTypes';
import { getResource } from '../lib/localization';
import { healthConnectService } from '../lib/services/healthConnect/healthConnectService';
import { useAuthenticationContext } from './useAuthenticationContext';

type MappingFeedback = {
  kind: 'info' | 'warning' | 'error';
  message: string;
};

type MappingModal = {
  isVisible: boolean;
  mapping: HealthConnectMappingTableEntry | null;
};

export const useHealthConnectMetricMappings = () => {
  const { currentUserId } = useAuthenticationContext();
  const [mappings, setMappings] = React.useState<
    HealthConnectMappingTableEntry[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [feedback, setFeedback] = React.useState<MappingFeedback | null>(null);
  const [modalProps, setModalProps] = React.useState<MappingModal>({
    isVisible: false,
    mapping: null,
  });

  const getMappings = React.useCallback(async (userId: number) => {
    const entries = await databaseAccessor.metricMappingTable.getMappingEntries(
      userId,
    );
    return entries.map(entry => ({
      ...entry,
      type: 'HealthConnectMetric' as const,
    }));
  }, []);

  const loadMappings = React.useCallback(async () => {
    try {
      if (currentUserId == null) {
        setMappings([]);
        return;
      }
      setMappings(await getMappings(currentUserId));
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getResource(
          'healthConnect.descriptionMappingInitializationFailed',
        ),
      });
      console.error('Failed to load Health Connect metric mappings.', error);
    }
  }, [currentUserId, getMappings]);

  const updateMapping = React.useCallback(
    async (id: number, update: Partial<HealthConnectMappingTableEntry>) => {
      if (currentUserId == null) {
        return;
      }
      const mapping = mappings.find(entry => entry.id === id);
      if (!mapping) {
        return;
      }
      const entry: HealthConnectMetricMappingTableEntry = {
        id: mapping.id,
        userId: mapping.userId,
        source: update.source ?? mapping.source,
        target: update.target ?? mapping.target,
        isActive: update.isActive ?? mapping.isActive,
      };
      await databaseAccessor.metricMappingTable.updateMappingEntry(
        currentUserId,
        id,
        entry,
      );
      setMappings(await getMappings(currentUserId));
    },
    [currentUserId, getMappings, mappings],
  );

  const initializeMappings = React.useCallback(async () => {
    try {
      setIsLoading(true);
      if (currentUserId == null) {
        throw new Error(
          getResource('healthConnect.descriptionMissingUserContext'),
        );
      }
      if (!(await healthConnectService.ensurePermissions())) {
        throw new Error(
          getResource('healthConnect.descriptionEnsurePermissionsFailed'),
        );
      }
      const existingMappings = await getMappings(currentUserId);
      const entries = (await healthConnectService.getGrantedPermissions())
        .map(permission => permission.recordType)
        .filter(
          metricType =>
            !existingMappings.some(entry => entry.source === metricType),
        )
        .map(
          (metricType): HealthConnectMetricMappingTableEntry => ({
            id: -1,
            userId: currentUserId,
            source: metricType,
            target: metricType,
            isActive: false,
          }),
        );
      if (entries.length === 0) {
        setFeedback({
          kind: 'warning',
          message: getResource('healthConnect.descriptionNoNewMappingsFound'),
        });
        return;
      }
      await databaseAccessor.metricMappingTable.addMappingEntries(
        currentUserId,
        entries,
      );
      setMappings(await getMappings(currentUserId));
      setFeedback({
        kind: 'info',
        message: `${getResource(
          'healthConnect.descriptionMappingInitializationSucceededPrefix',
        )} ${entries.length}.`,
      });
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getResource(
          'healthConnect.descriptionMappingInitializationFailed',
        ),
      });
      console.error(
        'Failed to initialize Health Connect metric mappings.',
        error,
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, getMappings]);

  React.useEffect(() => {
    void loadMappings();
  }, [loadMappings]);

  return {
    isLoading,
    mappings,
    feedback,
    modalProps,
    handleModalStateChanged: (
      isVisible: boolean,
      mapping: HealthConnectMappingTableEntry | null,
    ) => setModalProps({ isVisible, mapping }),
    updateMapping,
    initializeMappings,
  };
};
