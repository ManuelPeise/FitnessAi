import { LoginFormValues } from '../../types/authentication/LoginFormValues';
import { LocalizationContextProps } from '../../types/localization/LocalizationContextProps';

type LoginFormErrors = Partial<Record<keyof LoginFormValues, string>>;

const EmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateLoginForm = (
  values: LoginFormValues,
  getResource: LocalizationContextProps['getResource'],
): LoginFormErrors => {
  const errors: LoginFormErrors = {};

  if (!values.email.trim()) {
    errors.email = getResource('common', 'emailRequired');
  } else if (!EmailPattern.test(values.email)) {
    errors.email = getResource('common', 'emailInvalid');
  }

  if (!values.password) {
    errors.password = getResource('common', 'passwordRequired');
  }

  return errors;
};
