import React from 'react';
import { useHealthConnectMappings } from '../../../hooks/useHealthConnectMappings';
import { HealthConnectMappingType } from '../../../lib/database/databaseTypes';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { globalStyles } from '../../../lib/styles/globalStyles';
import HealthConnectMappingItem from './HealthConnectMappingItem';
import HealthConnectMappingModal from './HealthConnectMappingModal';
import ButtonComponent from '../../../components/inputComponents/ButtonComponent';
import { colorMap } from '../../../lib/styles/colorMap';
import { ILocaleProps, withLocalNameSpaces } from '../../../lib/localization';

interface IProps extends ILocaleProps {
  type: HealthConnectMappingType;
  titleResource: string;
}

const HealthConnectMapping: React.FC<IProps> = props => {
  const { type, titleResource, getResource } = props;

  const {
    isLoading,
    mappings,
    modalProps,
    handleModalStateChanged,
    updateMapping,
    initializeOriginMappings,
    initializeMetricMappings,
  } = useHealthConnectMappings(type);

  const initializationCallback = React.useMemo(() => {
    return type === 'HealthConnectOrigin'
      ? initializeOriginMappings
      : initializeMetricMappings;
  }, [type, initializeOriginMappings, initializeMetricMappings]);

  return (
    <View style={globalStyles.container}>
      <View style={styles.root}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>{getResource(titleResource)}</Text>
        </View>
        <ScrollView
          style={styles.mappingContainer}
          contentContainerStyle={styles.mappingContent}
        >
          {mappings.length > 0 ? (
            mappings.map(entry => (
              <HealthConnectMappingItem
                key={entry.id}
                mapping={entry}
                onClick={() => handleModalStateChanged(true, entry)}
              />
            ))
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>
                {getResource('healthConnect.descriptionNoMappingItemsAvailable')}
              </Text>
            </View>
          )}
        </ScrollView>
        <View style={styles.buttonContainer}>
          <ButtonComponent
            title={getResource('common.labelInitialize')}
            disabled={isLoading}
            onPress={initializationCallback}
          />
        </View>
      </View>
      {modalProps && modalProps.mapping && (
        <HealthConnectMappingModal
          visible={modalProps.isVisible}
          mapping={modalProps.mapping}
          getResource={getResource}
          onMappingChanged={entry => {
            updateMapping(entry.id, entry);
          }}
          onClose={() => handleModalStateChanged(false, null)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 12,
  },
  titleContainer: {
    marginBottom: 12,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '700',
    color: colorMap.textPrimary,
  },
  mappingContainer: {
    flex: 1,
    marginBottom: 12,
  },
  mappingContent: {
    flexGrow: 1,
    padding: 8,
    gap: 8,
    backgroundColor: colorMap.surface,
    borderRadius: 12,
    borderColor: colorMap.border,
    borderWidth: 1,
  },
  placeholderContainer: {
    flex: 1,
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  placeholderText: {
    color: colorMap.textMuted,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
});

export default withLocalNameSpaces('HealthConnectMapping', [
  'common',
  'healthConnect',
])(HealthConnectMapping);
