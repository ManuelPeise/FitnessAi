import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useHealthConnectMappings } from '../../../hooks/useHealthConnectMappings';
import { HealthConnectMappingType } from '../../../lib/database/databaseTypes';
import { globalStyles } from '../../../lib/styles/globalStyles';
import ButtonComponent from '../../../components/inputComponents/ButtonComponent';
import { colorMap } from '../../../lib/styles/colorMap';
import { ILocaleProps, withLocalNameSpaces } from '../../../lib/localization';
import HealthConnectMappingItem from './HealthConnectMappingItem';
import HealthConnectMappingModal from './HealthConnectMappingModal';

interface IProps extends ILocaleProps {
  type: HealthConnectMappingType;
  titleResource: string;
}

const HealthConnectMapping: React.FC<IProps> = props => {
  const { type, titleResource, getResource } = props;

  const {
    isLoading,
    mappings,
    feedback,
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
      <View style={styles.layout}>
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

          <View style={styles.footerContainer}>
            {feedback ? (
              <Text
                style={[
                  styles.feedbackText,
                  feedback.kind === 'error'
                    ? styles.errorText
                    : feedback.kind === 'warning'
                    ? styles.warningText
                    : styles.infoText,
                ]}
              >
                {feedback.message}
              </Text>
            ) : null}

            <View style={styles.buttonContainer}>
              <ButtonComponent
                title={getResource('common.labelInitialize')}
                disabled={isLoading}
                onPress={initializationCallback}
              />
            </View>
          </View>
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
  layout: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  root: {
    flex: 1,
    width: '100%',
    maxWidth: 860,
    minHeight: 360,
    backgroundColor: colorMap.surface,
    borderRadius: 14,
    borderColor: colorMap.border,
    borderWidth: 1,
    padding: 14,
    shadowColor: colorMap.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 2,
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
    backgroundColor: colorMap.backgroundAlt,
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
  footerContainer: {
    marginTop: 10,
    gap: 8,
  },
  feedbackText: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '500',
  },
  infoText: {
    color: colorMap.info,
  },
  warningText: {
    color: colorMap.warning,
  },
  errorText: {
    color: colorMap.error,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
});

export default withLocalNameSpaces('HealthConnectMapping', [
  'common',
  'healthConnect',
])(HealthConnectMapping);
