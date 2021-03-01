import { useEffect, useState } from 'react';
import { Namespace } from '../types/Namespace';
import { handleApiCall } from '../utils/handleApiCall';
import { urlFor } from '../utils/urlFor';

export function useNamespaces() {
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [namespaceError, setNamespaceError] = useState<Error | undefined>(undefined);
  const [namespaceLoaded, setNamespaceLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      if (!namespaceLoaded) {
        await handleApiCall({
          call: () => fetch(urlFor("/api/v1/namespaces")),
          handleResult: (namespaces: Namespace[]) => {
            setNamespaces(namespaces);
            setNamespaceError(undefined);
          },
          errContext: "Failed to load namespaces",
          handleError: setNamespaceError
        })
        setNamespaceLoaded(true);
      }
    })();
  }, [namespaceLoaded]);

  return { namespaces, namespaceLoaded, namespaceError }
}