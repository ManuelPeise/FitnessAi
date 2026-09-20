import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { UseFormResult } from "../hooks/useForm";
import { LoginFormValues } from "../types/authentication/LoginFormValues";
import { useI18n } from "../hooks/useI18n";
import { useTheme } from "../hooks/useTheme";

type LoginFormProps = {
  form: UseFormResult<LoginFormValues>;
};

export function LoginForm({ form }: LoginFormProps): React.JSX.Element {
  const { getResource } = useI18n();
  const { theme } = useTheme();
  const {
    values,
    errors,
    submitError,
    isSubmitting,
    setFieldValue,
    handleSubmit,
  } = form;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.palette.background.paper,
            borderRadius: theme.shape.borderRadius,
          },
        ]}
      >
        <Text style={[styles.caption, { color: theme.palette.text.secondary }]}>
          {getResource("common", "captionLogin")}
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: theme.palette.divider,
              borderRadius: theme.shape.borderRadius,
              color: theme.palette.text.primary,
            },
          ]}
          placeholderTextColor={theme.palette.text.secondary}
          placeholder={getResource("common", "email")}
          autoCapitalize="none"
          keyboardType="email-address"
          value={values.email}
          onChangeText={(text) => setFieldValue("email", text)}
        />
        {errors.email ? (
          <Text style={[styles.error, { color: theme.palette.error.main }]}>
            {errors.email}
          </Text>
        ) : null}

        <TextInput
          style={[
            styles.input,
            {
              borderColor: theme.palette.divider,
              borderRadius: theme.shape.borderRadius,
              color: theme.palette.text.primary,
            },
          ]}
          placeholderTextColor={theme.palette.text.secondary}
          placeholder={getResource("common", "password")}
          secureTextEntry
          value={values.password}
          onChangeText={(text) => setFieldValue("password", text)}
        />
        {errors.password ? (
          <Text style={[styles.error, { color: theme.palette.error.main }]}>
            {errors.password}
          </Text>
        ) : null}

        {submitError ? (
          <Text style={[styles.error, { color: theme.palette.error.main }]}>
            {submitError}
          </Text>
        ) : null}

        <Pressable
          style={[
            styles.button,
            {
              backgroundColor: theme.palette.primary.main,
              borderRadius: theme.shape.borderRadius,
            },
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text
            style={[
              styles.buttonText,
              { color: theme.palette.primary.contrastText },
            ]}
          >
            {getResource("common", "login")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  card: {
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  error: { marginBottom: 8 },
  caption: { marginBottom: 8, color: "gray" },
  button: {
    padding: 12,
    alignItems: "center",
  },
  buttonText: { fontWeight: "600" },
});
