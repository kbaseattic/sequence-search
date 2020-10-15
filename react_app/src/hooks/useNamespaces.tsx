import { useEffect, useState } from 'react';
import { Namespace } from '../types/Namespace';
import { urlFor } from '../utils/urlFor';

export function useNamespaces() {
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [namespaceError, setNamespaceError] = useState<Error | undefined>(undefined);
  const [namespaceLoaded, setNamespaceLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      if (!namespaceLoaded) {
        try {
          const response = await fetch(urlFor("/api/namespace"));
          if (response.ok) {
            setNamespaces(await response.json());
            setNamespaceError(undefined);
          } else {
            throw new Error(`Failed to load namespaces, received ${response.status}: ${response.statusText}`);
          }
        } catch (err) {
          if (err instanceof Error) setNamespaceError(err);
          else setNamespaceError(new Error(`Unexpected Error: ${JSON.stringify(err)}`));
        } finally {
          setNamespaceLoaded(true);
        }
      }
    })();
  }, [namespaceLoaded]);

  return { namespaces, namespaceLoaded, namespaceError }
}