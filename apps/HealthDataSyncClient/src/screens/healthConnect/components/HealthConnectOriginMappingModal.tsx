import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ButtonComponent from '../../../components/inputComponents/ButtonComponent';
import TextField from '../../../components/inputComponents/TextField';
import SwitchComponent from '../../../components/inputComponents/SwitchComponent';
import IconComponent from '../../../components/IconComponent';
import HealthConnectMetricSettingsModal from './HealthConnectMetricSettingsModal';
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
  const [editingMetricId, setEditingMetricId] = React.useState<number | null>(
    null,
  );

  React.useEffect(() => {
    setSelectedMapping(mapping);
    setMetricSearch('');
    setEditingMetricId(null);
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

  const updateMetricTarget = React.useCallback(
    (metric: HealthConnectMetricMappingTableEntry, target: string) => {
      setMetrics(current =>
        current.map(m => (m.id === metric.id ? { ...m, target } : m)),
      );
      if (currentUserId != null) {
        void databaseAccessor.metricMappingTable.updateMappingEntry(
          currentUserId,
          metric.id,
          { ...metric, target },
        );
      }
    },
    [currentUserId],
  );

  const toggleMetricActive = React.useCallback(
    (metric: HealthConnectMetricMappingTableEntry) => {
      const updated = { ...metric, isActive: !metric.isActive };
      setMetrics(current =>
        current.map(m => (m.id === metric.id ? updated : m)),
      );
      if (currentUserId != null) {
        void databaseAccessor.metricMappingTable.updateMappingEntry(
          currentUserId,
          metric.id,
          updated,
        );
      }
    },
    [currentUserId],
  );

  const filteredMetrics = React.useMemo(() => {
    const search = metricSearch.trim().toLowerCase();

    if (search.length === 0) {
      return metrics;
    }

    return metrics.filter(
      metric =>
        metric.source.toLowerCase().includes(search) ||
        metric.target.toLowerCase().includes(search),
    );
  }, [metrics, metricSearch]);

  const editingMetric =
    metrics.find(metric => metric.id === editingMetricId) ?? null;

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
            label={getResource('common.labelMetricsFilter')}
            value={metricSearch}
            onChange={setMetricSearch}
            placeholder={getResource('common.placeholderFilterMetrics')}
          />
          <ScrollView style={styles.metricList}>
            {filteredMetrics.map(metric => {
              const isIncluded = (selectedMapping.metricIds ?? []).includes(
                metric.id,
              );
              const iconName = !metric.isActive
                ? 'error'
                : isIncluded
                ? 'check-circle'
                : 'warning';
              const iconColor = !metric.isActive
                ? colorMap.error
                : isIncluded
                ? colorMap.success
                : colorMap.warning;

              return (
                <TouchableOpacity
                  key={metric.id}
                  style={styles.metricRow}
                  onPress={() => setEditingMetricId(metric.id)}
                >
                  <IconComponent
                    name={iconName}
                    size="sm"
                    color={iconColor}
                    padding={0}
                  />
                  <Text style={styles.metricText}>{metric.source}</Text>
                </TouchableOpacity>
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
      <HealthConnectMetricSettingsModal
        visible={editingMetric != null}
        metric={editingMetric}
        isIncludedInOrigin={
          editingMetric != null &&
          (selectedMapping.metricIds ?? []).includes(editingMetric.id)
        }
        getResource={getResource}
        onClose={() => setEditingMetricId(null)}
        onTargetChange={target => {
          if (editingMetric) {
            updateMetricTarget(editingMetric, target);
          }
        }}
        onToggleActive={() => {
          if (editingMetric) {
            toggleMetricActive(editingMetric);
          }
        }}
        onToggleIncluded={() => {
          if (editingMetric) {
            toggleMetric(editingMetric.id);
          }
        }}
      />
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
    maxHeight: 320,
    marginTop: 4,
    borderWidth: 1,
    borderColor: colorMap.border,
    borderRadius: 10,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colorMap.border,
  },
  metricText: {
    fontSize: 15,
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
