import React from "react";

type StateUpdater<TModel> =
  | (Partial<TModel> | null)
  | ((state: TModel | null) => Partial<TModel>);

type FormReducerResult<TModel> = {
  model: Partial<TModel> | null;
  updateState: (update: StateUpdater<TModel>) => void;
  resetState: () => void;
};

const checkArrayForModifications = <T>(array: T[], update: T[]): boolean => {
  return (
    array.length !== update.length ||
    array.some((item, index) => item !== update[index])
  );
};

const updateArray = <T>(array: T[], update: T[]): T[] => {
  return checkArrayForModifications(array, update) ? update : array;
};

const formReducerFunction = <TModel>(
  state: Partial<TModel> | null,
  update: StateUpdater<TModel>,
): Partial<TModel> | null => {
  const stateUpdate =
    typeof update === "function" ? update(state as TModel | null) : update;

  if (stateUpdate == null) return state;

  const keys = Object.keys(stateUpdate);

  const isModified = keys.some(
    (key) => state?.[key as keyof TModel] !== stateUpdate[key as keyof TModel],
  );

  if (!isModified) return state;

  const nextState: Partial<TModel> = { ...state };

  keys.forEach((key) => {
    const propertyKey = key as keyof TModel;

    const currentValue = state?.[propertyKey];
    const updatedValue = stateUpdate[propertyKey];

    if (
      currentValue != null &&
      updatedValue != null &&
      Array.isArray(currentValue) &&
      Array.isArray(updatedValue)
    ) {
      nextState[propertyKey] = updateArray(
        currentValue,
        updatedValue,
      ) as TModel[keyof TModel];
    } else {
      nextState[propertyKey] = updatedValue;
    }
  });

  return nextState;
};

export const useFormReducer = <TModel>(
  initialState: Partial<TModel> | null,
): FormReducerResult<TModel> => {
  const [state, dispatch] = React.useReducer(formReducerFunction, initialState);

  const updateState = React.useCallback(
    (update: StateUpdater<TModel>) => {
      dispatch(update);
    },
    [dispatch],
  );

  const resetState = React.useCallback(() => {
    dispatch(initialState);
  }, [dispatch, initialState]);

  React.useEffect(() => {
    dispatch(initialState);
  }, [initialState, dispatch]);

  return {
    model: state,
    updateState,
    resetState,
  };
};
