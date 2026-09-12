import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useHealthConnectOriginMappings } from '../../hooks/useHealthConnectOriginMappings';
import { useHealthConnectMetricMappings } from '../../hooks/useHealthConnectMetricMappings';
import HealthConnectMappingItem from './components/HealthConnectMappingItem';
import HealthConnectOriginMappingModal from './components/HealthConnectOriginMappingModal';
import LoadingOverlay from '../../components/LoadingOverlay';
import { colorMap } from '../../lib/styles/colorMap';
import { globalStyles } from '../../lib/styles/globalStyles';
import { ILocaleProps, withLocalNameSpaces } from '../../lib/localization';

const HealthConnectOriginMapping: React.FC<ILocaleProps> = ({
  getResource,
}) => {
  const mapping = useHealthConnectOriginMappings();
  const metricMapping = useHealthConnectMetricMappings();
  const isLoading = mapping.isLoading || metricMapping.isLoading;

  React.useEffect(() => {
    const initialize = async () => {
      // Metric mappings are discovered here (rather than on a dedicated
      // screen) since editing them now happens inline in the origin modal.
      await metricMapping.initializeMappings();
      await mapping.initializeMappings();
    };
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={globalStyles.healthConnectAreaContainer}>
      <View style={styles.root}>
        <Text style={styles.title}>
          {getResource('healthConnect.captionOriginMappings')}
        </Text>
        <ScrollView contentContainerStyle={styles.list}>
          {mapping.mappings.map(entry => (
            <HealthConnectMappingItem
              key={entry.id}
              mapping={entry}
              onClick={() => mapping.handleModalStateChanged(true, entry)}
            />
          ))}
        </ScrollView>
      </View>
      {mapping.modalProps?.mapping && (
        <HealthConnectOriginMappingModal
          visible={mapping.modalProps.isVisible}
          mapping={mapping.modalProps.mapping}
          getResource={getResource}
          onMappingChanged={entry => mapping.updateMapping(entry.id, entry)}
          onClose={() => mapping.handleModalStateChanged(false, null)}
        />
      )}
      <LoadingOverlay visible={isLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, padding: 14, backgroundColor: colorMap.surface },
  title: {
    marginBottom: 12,
    fontSize: 20,
    fontWeight: '700',
    color: colorMap.textPrimary,
  },
  list: {
    flexGrow: 1,
    gap: 8,
    padding: 8,
    backgroundColor: colorMap.backgroundAlt,
  },
});

export default withLocalNameSpaces('HealthConnectOriginMapping', [
  'common',
  'healthConnect',
])(HealthConnectOriginMapping);
