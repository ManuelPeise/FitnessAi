import React from 'react';
import { useHealthConnectMappings } from '../../../hooks/useHealthConnectMappings';
import { HealthConnectMappingType } from '../../../lib/database/databaseTypes';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { globalStyles } from '../../../lib/styles/globalStyles';
import HealthConnectMappingItem from './HealthConnectMappingItem';
import HealthConnectMappingModal from './HealthConnectMappingModal';
import ButtonComponent from '../../../components/inputComponents/ButtonComponent';

interface IProps {
  type: HealthConnectMappingType;
  title: string;
}

const HealthConnectMapping: React.FC<IProps> = props => {
  const { type, title } = props;

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
          <Text style={styles.titleText}>{title}</Text>
        </View>
        <ScrollView
          style={styles.mappingContainer}
          contentContainerStyle={styles.mappingContent}
        >
          {mappings.map(entry => (
            <HealthConnectMappingItem
              key={entry.id}
              mapping={entry}
              onClick={() => handleModalStateChanged(true, entry)}
            />
          ))}
        </ScrollView>
        <View style={styles.buttonContainer}>
          <ButtonComponent
            title="Initialize Mapping"
            disabled={isLoading}
            onPress={initializationCallback}
          />
        </View>
      </View>
      {modalProps && modalProps.mapping && (
        <HealthConnectMappingModal
          visible={modalProps.isVisible}
          mapping={modalProps.mapping}
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
    padding: 10,
  },
  titleContainer: {
    marginBottom: 10,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  mappingContainer: {
    flex: 1,
    marginBottom: 10,
  },
  mappingContent: {
    padding: 10,
    gap: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
});

export default HealthConnectMapping;
