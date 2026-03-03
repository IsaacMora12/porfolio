import { useMemo } from 'react';
import type { ContentModule } from './types';


// The static glob import is correct.
const contentModules = import.meta.glob('../../content/*.tsx', { eager: true });

export function useContent() {
  const contents = useMemo(() => {
    const loadedContents = (Object.values(contentModules) as ContentModule[]).map((module) => {
      return module.default;
    });

    const componentsWithMetadata = loadedContents.filter((comp) => {
      return comp && comp.metadata;
    });

    return componentsWithMetadata.map((Component) => ({
      metadata: Component.metadata,
      Component: Component,
    }));
  }, []);

  return { contents };
}
