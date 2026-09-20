import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useForm } from '../hooks/useForm';
import { useI18n } from '../hooks/useI18n';
import useAuthentication from '../hooks/useAuthentication';
import { LoginFormValues } from '../types/authentication/LoginFormValues';
import { validateLoginForm } from '../lib/authentication/validateLoginForm';
import { LoginForm } from '../components/LoginForm';

export function LoginPage(): React.JSX.Element {
  const { login } = useAuthentication();
  const { getResource } = useI18n();

  const onSubmit = useCallback(
    (values: LoginFormValues) => login(values.email, values.password),
    [login],
  );

  const onError = useCallback(
    () => getResource('common', 'loginError'),
    [getResource],
  );

  const validate = useCallback(
    (values: LoginFormValues) => validateLoginForm(values, getResource),
    [getResource],
  );

  const form = useForm<LoginFormValues>({
    initialValues: { email: '', password: '' },
    onSubmit,
    onError,
    validate,
  });

  return (
    <View style={styles.container}>
      <LoginForm form={form} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
});
