import { useCallback, useState } from 'react';

type FormErrors<TValues> = Partial<Record<keyof TValues, string>>;

type UseFormOptions<TValues> = {
  initialValues: TValues;
  onSubmit: (values: TValues) => Promise<void> | void;
  onError?: (error: unknown) => string;
  validate?: (values: TValues) => FormErrors<TValues>;
};

export type UseFormResult<TValues> = {
  values: TValues;
  errors: FormErrors<TValues>;
  submitError: string | null;
  isSubmitting: boolean;
  setFieldValue: <TField extends keyof TValues>(
    field: TField,
    value: TValues[TField],
  ) => void;
  handleSubmit: () => Promise<void>;
};

export const useForm = <TValues extends Record<string, unknown>>({
  initialValues,
  onSubmit,
  onError,
  validate,
}: UseFormOptions<TValues>): UseFormResult<TValues> => {
  const [values, setValues] = useState<TValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors<TValues>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setFieldValue = useCallback(
    <TField extends keyof TValues>(field: TField, value: TValues[TField]) => {
      setValues(prev => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleSubmit = useCallback(async () => {
    const validationErrors = validate?.(values) ?? {};
    setErrors(validationErrors);
    setSubmitError(null);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (submitException) {
      setSubmitError(onError?.(submitException) ?? null);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit, onError]);

  return { values, errors, submitError, isSubmitting, setFieldValue, handleSubmit };
};
