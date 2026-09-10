import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import ButtonComponent from '../../../components/inputComponents/ButtonComponent';
import SwitchComponent from '../../../components/inputComponents/SwitchComponent';
import TextField from '../../../components/inputComponents/TextField';
import { ILocaleProps } from '../../../lib/localization';
import {
  HealthConnectMappingTableEntry,
  HealthConnectMetricMappingTableEntry,
} from '../../../lib/database/databaseTypes';
import { databaseAccessor } from '../../../lib/database/database';
import { useAuthenticationContext } from '../../../hooks/useAuthenticationContext';
import { colorMap } from '../../../lib/styles/colorMap';

type Props = Pick<ILocaleProps, 'getResource'> & {
  visible: boolean;
  mapping: HealthConnectMappingTableEntry;
  onClose: () => void;
  onMappingChanged: (mapping: HealthConnectMappingTableEntry) => void;
};

const HealthConnectOriginMappingModal: React.FC<Props> = ({
  visible,
  mapping,
  onClose,
  onMappingChanged,
  getResource,
}) => {
  const { currentUserId } = useAuthenticationContext();
  const [selectedMapping, setSelectedMapping] = React.useState(mapping);
  const [metrics, setMetrics] = React.useState<
    HealthConnectMetricMappingTableEntry[]
  >([]);
  const [metricSearch, setMetricSearch] = React.useState('');

  React.useEffect(() => {
    setSelectedMapping(mapping);
    setMetricSearch('');
  }, [mapping]);

  React.useEffect(() => {
    if (!visible || currentUserId == null) {
      return;
    }

    const loadMetrics = async () => {
      setMetrics(
        await databaseAccessor.metricMappingTable.getMappingEntries(
          currentUserId,
        ),
      );
    };
    void loadMetrics();
  }, [currentUserId, visible]);

  const updateMapping = React.useCallback(
    (update: Partial<HealthConnectMappingTableEntry>) => {
      setSelectedMapping(current => ({ ...current, ...update }));
    },
    [setSelectedMapping],
  );

  const toggleMetric = React.useCallback(
    (metricId: number) => {
      const metricIds = selectedMapping.metricIds ?? [];
      updateMapping({
        metricIds: metricIds.includes(metricId)
          ? metricIds.filter(id => id !== metricId)
          : [...metricIds, metricId],
      });
    },
    [selectedMapping, updateMapping],
  );

  const filteredMetrics = React.useMemo(() => {
    if (metricSearch === '') {
      return metrics.filter(metric => metric.isActive);
    }

    return metrics.filter(metric => {
      if (!metric.isActive) {
        return false;
      }
      const search = metricSearch.trim().toLowerCase();

      return (
        search.length === 0 ||
        metric.source.toLowerCase().includes(search) ||
        metric.target.toLowerCase().includes(search)
      );
    });
  }, [metrics, metricSearch]);

  const isModified =
    selectedMapping.isActive !== mapping.isActive ||
    selectedMapping.target !== mapping.target ||
    JSON.stringify(selectedMapping.metricIds ?? []) !==
      JSON.stringify(mapping.metricIds ?? []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>
            {getResource('healthConnect.captionEditMapping')}
          </Text>
          <View style={styles.row}>
            <Text style={styles.labelText}>
              {getResource('common.labelActive')}
            </Text>
            <SwitchComponent
              checked={selectedMapping.isActive}
              onValueChange={isActive => updateMapping({ isActive })}
            />
          </View>
          <TextField
            label={getResource('healthConnect.labelSource')}
            value={selectedMapping.source}
            disabled
            onChange={() => undefined}
          />
          <TextField
            label={getResource('healthConnect.labelTarget')}
            value={selectedMapping.target}
            onChange={target => updateMapping({ target })}
            placeholder={getResource('healthConnect.labelTarget')}
          />
          <TextField
            label={getResource('common.labelMetrics')}
            value={metricSearch}
            onChange={setMetricSearch}
            placeholder={getResource('common.labelMetrics')}
          />
          <ScrollView style={styles.metricList}>
            {filteredMetrics.map(metric => {
              const checked = (selectedMapping.metricIds ?? []).includes(
                metric.id,
              );
              return (
                <View key={metric.id} style={styles.metricRow}>
                  <Text style={styles.metricText}>{metric.source}</Text>
                  <SwitchComponent
                    checked={checked}
                    disabled={!selectedMapping.isActive}
                    onValueChange={() => toggleMetric(metric.id)}
                  />
                </View>
              );
            })}
          </ScrollView>
          <View style={styles.buttons}>
            <ButtonComponent
              title={getResource('common.labelCancel')}
              onPress={onClose}
            />
            <ButtonComponent
              title={getResource('common.labelSave')}
              disabled={!isModified || selectedMapping.target.length === 0}
              onPress={() => {
                onMappingChanged(selectedMapping);
                onClose();
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colorMap.overlay,
  },
  dialog: {
    width: '95%',
    maxHeight: '90%',
    padding: 20,
    backgroundColor: colorMap.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colorMap.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    color: colorMap.textPrimary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelText: {
    color: colorMap.textSecondary,
    fontWeight: '600',
  },
  metricList: {
    maxHeight: 220,
    marginTop: 4,
    borderWidth: 1,
    borderColor: colorMap.border,
    borderRadius: 10,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: colorMap.border,
  },
  metricText: {
    flex: 1,
    color: colorMap.textPrimary,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 24,
  },
});

export default HealthConnectOriginMappingModal;
