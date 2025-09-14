import { useMemo } from 'react';


// The static glob import is correct.
const contentModules = import.meta.glob('../../content/*.tsx', { eager: true });

export function useContent() {
  const contents = useMemo(() => {
    console.log('Content modules loaded:', contentModules);
    console.log('Number of modules:', Object.keys(contentModules).length);

    // Get the raw component modules.
    const loadedContents = Object.values(contentModules).map((module: any) => {
      console.log('Module:', module);
      console.log('Module default:', module.default);
      return module.default;
    });

    console.log('Loaded contents:', loadedContents);

    // Filter to ensure we only have components with the static 'metadata' property.
    const componentsWithMetadata = loadedContents.filter((comp) => {
      const hasMetadata = comp && comp.metadata;
      console.log('Component has metadata:', hasMetadata, comp);
      return hasMetadata;
    });

    console.log('Components with metadata:', componentsWithMetadata);

    // Return the components with their metadata, keeping the original component reference
    const finalContents = componentsWithMetadata.map((Component) => {
      const result = {
        metadata: Component.metadata,
        Component: Component, // Mantener referencia al componente original
      };
      console.log('Final content item:', result);
      return result;
    });

    console.log('Final contents array:', finalContents);
    return finalContents;
  }, []); 

  return { contents };
}