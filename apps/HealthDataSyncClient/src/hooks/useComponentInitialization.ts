import React from 'react';

type ComponentInitializazionProps<TModel = {}> = {
  isInitialized: boolean;
  props: TModel;
};

export const useComponentInitialization = <TModel>(
  callback: () => Promise<ComponentInitializazionProps<TModel>>,
): ComponentInitializazionProps<TModel> => {
  const callbackRef = React.useRef(callback);

  const [state, setState] = React.useState<
    ComponentInitializazionProps<TModel>
  >({
    isInitialized: false,
    props: {} as TModel,
  });

  React.useEffect(() => {
    const initialize = async () => {
      const result = await callbackRef.current();
      setState(result);
    };
    initialize();
  }, []);

  return state;
};
