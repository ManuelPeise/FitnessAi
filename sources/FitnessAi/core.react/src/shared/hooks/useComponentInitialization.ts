import { useEffect, useState } from "react";

type ComponentInitializationCallback<TModel> = () => Promise<TModel | null>;

type ComponentInitializationResult<TModel> = {
  isInitialized: boolean;
  state: TModel | null;
};

export const useComponentInitialization = <TModel>(
  callback: ComponentInitializationCallback<TModel>,
): ComponentInitializationResult<TModel> => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [state, setState] = useState<TModel | null>(null);

  useEffect(() => {
    callback().then((result) => {
      setState(result);
      setIsInitialized(result !== null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback]);

  return { isInitialized, state };
};
