import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useHealthConnectOriginMappings } from '../../hooks/useHealthConnectOriginMappings';
import HealthConnectMappingItem from './components/HealthConnectMappingItem';
import HealthConnectOriginMappingModal from './components/HealthConnectOriginMappingModal';
import { colorMap } from '../../lib/styles/colorMap';
import { globalStyles } from '../../lib/styles/globalStyles';
import { ILocaleProps, withLocalNameSpaces } from '../../lib/localization';

const HealthConnectOriginMapping: React.FC<ILocaleProps> = ({
  getResource,
}) => {
  const mapping = useHealthConnectOriginMappings();

  const initializeOriginMappings = React.useCallback(async () => {
    mapping.initializeMappings();
  }, [mapping]);

  React.useEffect(() => {
    const initialize = async () => {
      await initializeOriginMappings();
    };
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={globalStyles.container}>
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
        {mapping.feedback && (
          <Text style={styles.feedback}>{mapping.feedback.message}</Text>
        )}
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
  feedback: { marginVertical: 8, textAlign: 'center', color: colorMap.info },
});

export default withLocalNameSpaces('HealthConnectOriginMapping', [
  'common',
  'healthConnect',
])(HealthConnectOriginMapping);
