import React from 'react';
import {
  getResource as getGlobalResource,
  onLanguageChanged,
  subscribeLanguageChanged,
} from './localization';
import { ILocaleProps, LocalizationNamespace } from './localizationTypes';

export const withLocalNameSpaces = (
  componentName: string,
  namespaces: LocalizationNamespace[],
) => {
  return <TProps extends ILocaleProps>(
    Component: React.ComponentType<TProps>,
  ): React.FC<Omit<TProps, keyof ILocaleProps>> => {
    const WrappedComponent: React.FC<
      Omit<TProps, keyof ILocaleProps>
    > = props => {
      const [, forceRender] = React.useState(0);

      React.useEffect(() => {
        return subscribeLanguageChanged(() => {
          forceRender(previous => previous + 1);
        });
      }, []);

      const getResource = (resource: string): string => {
        const [namespace] = resource.split('.');

        if (!namespaces.includes(namespace as LocalizationNamespace)) {
          return resource;
        }

        return getGlobalResource(resource);
      };

      return (
        <Component
          {...(props as TProps)}
          getResource={getResource}
          onLanguageChanged={onLanguageChanged}
        />
      );
    };

    WrappedComponent.displayName = `withLocalNameSpaces(${componentName})`;
    return WrappedComponent;
  };
};
