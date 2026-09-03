import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuthenticationContext } from '../../hooks/useAuthenticationContext';

const LoginScreen: React.FC = () => {
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
    } catch {
      setError('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        keyboardType="email-address"
        onChangeText={setEmail}
        editable={!isLoading}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!isLoading}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <TouchableOpacity
          onPress={onLogin}
          style={[
            styles.button,
            isLoginDisabled && { backgroundColor: '#cccccc' },
          ]}
          disabled={isLoginDisabled}
        >
          <Text style={styles.buttonText}>Sign in</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  error: {
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default LoginScreen;
