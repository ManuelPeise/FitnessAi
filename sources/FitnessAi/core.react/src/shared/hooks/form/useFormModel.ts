import React from "react";
import isEqual from "lodash/isEqual";
import { useFormReducer } from "./formReducer";

export type UseFormModelResult<TModel> = {
  model: Partial<TModel> | null;
  isModified: boolean;
  validationResult: FormValidationResult;
  updateState: (
    update: (state: Partial<TModel> | null) => Partial<TModel>,
  ) => void;
  handleChange: (key: keyof TModel, value: TModel[keyof TModel]) => void;
  resetForm: () => void;
};

export type FormValidationResult = {
  isValid: boolean;
  errors: string[];
};

const useFormModel = <TModel>(
  initialState: Partial<TModel> | null,
  validationCallback?: (state: Partial<TModel>) => boolean,
): UseFormModelResult<TModel> => {
  const validationCallbackRef = React.useRef(validationCallback);

  const [validationResult, setValidationResult] =
    React.useState<FormValidationResult>({
      isValid: true,
      errors: [],
    });

  const { model, updateState, resetState } = useFormReducer(initialState);

  const handleChange = React.useCallback(
    (key: keyof TModel, value: TModel[keyof TModel]) => {
      updateState((state) => ({
        ...state,
        [key]: value,
      }));
    },
    [updateState],
  );

  const resetForm = React.useCallback(() => {
    resetState();
  }, [resetState]);

  const validateForm = React.useCallback(() => {
    if (validationCallbackRef.current) {
      if (model == null) return;
      const isValid = validationCallbackRef.current(model);

      setValidationResult({
        isValid,
        errors: isValid
          ? []
          : Object.keys(model).map((key) => `${key.toString()} is invalid`),
      });
    }
  }, [model]);

  const isModified = React.useMemo(() => {
    return !isEqual(model, initialState);
  }, [model, initialState]);

  React.useEffect(() => {
    validateForm();
  }, [validateForm]);

  return {
    model,
    isModified,
    validationResult,
    updateState,
    handleChange,
    resetForm,
  };
};

export default useFormModel;
