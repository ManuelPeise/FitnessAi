import React from 'react';
import { databaseAccessor } from '../lib/database/database';
import {
  HealthConnectMappingTableEntry,
  HealthConnectOriginMappingTableEntry,
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

export const useHealthConnectOriginMappings = () => {
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
    const entries = await databaseAccessor.originMappingTable.getMappingEntries(
      userId,
    );
    return entries.map(entry => ({
      ...entry,
      type: 'HealthConnectOrigin' as const,
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
      console.error('Failed to load Health Connect origin mappings.', error);
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
      const entry: HealthConnectOriginMappingTableEntry = {
        id: mapping.id,
        userId: mapping.userId,
        source: update.source ?? mapping.source,
        target: update.target ?? mapping.target,
        isActive: update.isActive ?? mapping.isActive,
        metricIds: update.metricIds ?? mapping.metricIds ?? [],
      };
      await databaseAccessor.originMappingTable.updateMappingEntry(
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
      await healthConnectService.requestPermissionsBestEffort();
      const existingMappings = await getMappings(currentUserId);
      const entries = (await healthConnectService.getAvailableOrigins())
        .filter(
          origin => !existingMappings.some(entry => entry.source === origin),
        )
        .map(
          (origin): HealthConnectOriginMappingTableEntry => ({
            id: -1,
            userId: currentUserId,
            source: origin,
            target: origin,
            isActive: false,
            metricIds: [],
          }),
        );
      if (entries.length === 0) {
        setFeedback({
          kind: 'warning',
          message: getResource('healthConnect.descriptionNoNewMappingsFound'),
        });
        return;
      }
      await databaseAccessor.originMappingTable.addMappingEntries(
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
        'Failed to initialize Health Connect origin mappings.',
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
