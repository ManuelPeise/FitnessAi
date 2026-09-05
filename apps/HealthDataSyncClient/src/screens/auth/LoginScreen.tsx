import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuthenticationContext } from '../../hooks/useAuthenticationContext';
import { colorMap } from '../../lib/styles/colorMap';
import TextField from '../../components/inputComponents/TextField';
import ButtonComponent from '../../components/inputComponents/ButtonComponent';
import { ILocaleProps } from '../../lib/localization';
import { withLocalNameSpaces } from '../../lib/localization/withLocalNameSpaces';

const LoginScreen: React.FC<ILocaleProps> = props => {
  const { getResource } = props;
  const { handleLogin } = useAuthenticationContext();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoginDisabled = isLoading || !email || !password;
  const onLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await handleLogin({ email: email, password: password });
    } catch (loginError) {
      if (loginError instanceof Error && loginError.message.trim().length > 0) {
        setError(loginError.message);
      } else {
        setError(getResource('common.descriptionLoginFailedFallback'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{getResource('common.captionLogin')}</Text>
        <TextField
          label={getResource('common.labelEmail')}
          value={email}
          placeholder={getResource('common.labelEmail')}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          onChange={setEmail}
          disabled={isLoading}
        />
        <TextField
          label={getResource('common.labelPassword')}
          value={password}
          placeholder={getResource('common.labelPassword')}
          secureTextEntry
          onChange={setPassword}
          disabled={isLoading}
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <ButtonComponent
          title={getResource('common.labelSignIn')}
          onPress={onLogin}
          isLoading={isLoading}
          minWidth={80}
          disabled={isLoginDisabled}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: colorMap.background,
    padding: 24,
  },
  card: {
    backgroundColor: colorMap.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colorMap.border,
    padding: 18,
    gap: 6,
    shadowColor: colorMap.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 24,
    color: colorMap.textPrimary,
  },
  error: {
    marginBottom: 12,
    color: colorMap.error,
  },
});

export default withLocalNameSpaces('LoginScreen', ['common'])(LoginScreen);
