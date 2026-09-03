import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

interface IProps {
  value: string;
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

const TextField: React.FC<IProps> = ({
  value,
  onChange,
  placeholder,
  disabled,
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        placeholder={placeholder}
        onChangeText={onChange}
        editable={!disabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  label: {},
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
  },
});

export default TextField;
