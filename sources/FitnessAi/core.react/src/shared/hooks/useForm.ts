import React from "react";

export type FormState = {
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  hasSubmitError: boolean;
  validationError: string | undefined;
};

export type FieldSubscription<TValue> = {
  value: TValue;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export type UseFormOptions<TValues> = {
  initialValues: TValues;
  onSubmit: (values: TValues) => Promise<void>;
  validate?: (values: TValues) => string | undefined;
};

export type UseFormResult<TValues> = {
  getValues: () => TValues;
  setValue: <TField extends keyof TValues>(
    field: TField,
    value: TValues[TField],
  ) => void;
  useField: <TField extends keyof TValues>(
    field: TField,
  ) => FieldSubscription<TValues[TField]>;
  useFormState: () => FormState;
  useModel: (model: TValues) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

type Listener = () => void;

const shallowEqual = <TValues extends Record<string, unknown>>(
  left: TValues,
  right: TValues,
): boolean =>
  Object.keys(left).length === Object.keys(right).length &&
  Object.keys(left).every((key) => left[key] === right[key]);

const createFormStore = <TValues extends Record<string, unknown>>(
  initialValues: TValues,
  validate?: (values: TValues) => string | undefined,
) => {
  let values = initialValues;
  let baseValues = initialValues;
  let isSubmitting = false;
  let hasSubmitError = false;
  let validationError: string | undefined;
  let cachedState: FormState | null = null;

  const fieldListeners = new Map<keyof TValues, Set<Listener>>();
  const stateListeners = new Set<Listener>();

  const notifyField = (field: keyof TValues): void => {
    fieldListeners.get(field)?.forEach((listener) => {
      listener();
    });
  };

  const notifyAllFields = (): void => {
    fieldListeners.forEach((listeners) => {
      listeners.forEach((listener) => {
        listener();
      });
    });
  };

  const notifyState = (): void => {
    cachedState = null;
    stateListeners.forEach((listener) => {
      listener();
    });
  };

  const getValues = (): TValues => values;

  const getFieldValue = <TField extends keyof TValues>(
    field: TField,
  ): TValues[TField] => values[field];

  const getState = (): FormState => {
    cachedState ??= {
      isDirty: !shallowEqual(values, baseValues),
      isValid: validate?.(values) === undefined,
      isSubmitting,
      hasSubmitError,
      validationError,
    };

    return cachedState;
  };

  const setValue = <TField extends keyof TValues>(
    field: TField,
    value: TValues[TField],
  ): void => {
    values = { ...values, [field]: value };
    notifyField(field);
    notifyState();
  };

  const setModel = (model: TValues): void => {
    values = model;
    baseValues = model;
    notifyAllFields();
    notifyState();
  };

  const subscribeField = (field: keyof TValues, listener: Listener) => {
    let listeners = fieldListeners.get(field);

    if (listeners === undefined) {
      listeners = new Set();
      fieldListeners.set(field, listeners);
    }

    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const subscribeState = (listener: Listener) => {
    stateListeners.add(listener);
    return () => stateListeners.delete(listener);
  };

  const setSubmitting = (nextIsSubmitting: boolean): void => {
    isSubmitting = nextIsSubmitting;
    notifyState();
  };

  const setSubmitError = (nextHasSubmitError: boolean): void => {
    hasSubmitError = nextHasSubmitError;
    notifyState();
  };

  const setValidationError = (
    nextValidationError: string | undefined,
  ): void => {
    validationError = nextValidationError;
    notifyState();
  };

  return {
    getValues,
    getFieldValue,
    getState,
    setValue,
    setModel,
    subscribeField,
    subscribeState,
    setSubmitting,
    setSubmitError,
    setValidationError,
  };
};

export const useForm = <TValues extends Record<string, unknown>>({
  initialValues,
  onSubmit,
  validate,
}: UseFormOptions<TValues>): UseFormResult<TValues> => {
  const [store] = React.useState(() =>
    createFormStore(initialValues, validate),
  );

  const useField = <TField extends keyof TValues>(
    field: TField,
  ): FieldSubscription<TValues[TField]> => {
    const subscribe = React.useCallback(
      (listener: Listener) => store.subscribeField(field, listener),
      [field],
    );
    const getSnapshot = React.useCallback(
      () => store.getFieldValue(field),
      [field],
    );
    const value = React.useSyncExternalStore(subscribe, getSnapshot);

    const onChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>): void => {
        store.setValue(field, event.target.value as TValues[TField]);
      },
      [field],
    );

    return { value, onChange };
  };

  const useFormState = (): FormState =>
    React.useSyncExternalStore(store.subscribeState, store.getState);

  const useModel = (model: TValues): void => {
    React.useEffect(() => {
      store.setModel(model);
    }, [model]);
  };

  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>): void => {
      event.preventDefault();
      store.setSubmitError(false);

      const values = store.getValues();
      const nextValidationError = validate?.(values);
      store.setValidationError(nextValidationError);

      if (nextValidationError !== undefined) {
        return;
      }

      store.setSubmitting(true);

      onSubmit(values)
        .catch(() => {
          store.setSubmitError(true);
        })
        .finally(() => {
          store.setSubmitting(false);
        });
    },
    [onSubmit, validate, store],
  );

  return {
    getValues: store.getValues,
    setValue: store.setValue,
    useField,
    useFormState,
    useModel,
    handleSubmit,
  };
};
