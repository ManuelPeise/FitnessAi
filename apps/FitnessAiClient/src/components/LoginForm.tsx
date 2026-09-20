import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { UseFormResult } from '../hooks/useForm';
import { LoginFormValues } from '../types/authentication/LoginFormValues';
import { useI18n } from '../hooks/useI18n';

type LoginFormProps = {
  form: UseFormResult<LoginFormValues>;
};

export function LoginForm({ form }: LoginFormProps): React.JSX.Element {
  const { getResource } = useI18n();
  const { values, errors, submitError, isSubmitting, setFieldValue, handleSubmit } =
    form;

  return (
    <View>
      <TextInput
        style={styles.input}
        placeholder={getResource('common', 'email')}
        autoCapitalize="none"
        keyboardType="email-address"
        value={values.email}
        onChangeText={text => setFieldValue('email', text)}
      />
      {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder={getResource('common', 'password')}
        secureTextEntry
        value={values.password}
        onChangeText={text => setFieldValue('password', text)}
      />
      {errors.password ? (
        <Text style={styles.error}>{errors.password}</Text>
      ) : null}

      {submitError ? <Text style={styles.error}>{submitError}</Text> : null}

      <Pressable
        style={styles.button}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>{getResource('common', 'login')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  error: { color: '#c0392b', marginBottom: 8 },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});
