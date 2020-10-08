import { useEffect, useState } from 'react';

interface Namespace {
  database: string
  datasource: string
  desc: string
  id: string
  lastmod: number
  seqcount: number
}

export function useNamespaces() {
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [namespaceLoaded, setNamespaceLoaded] = useState(false);
  useEffect(() => {
    (async () => {
      if (!namespaceLoaded) {
        const response = await fetch("/api/namespace");
        setNamespaces(await response.json())
        setNamespaceLoaded(true)
      }
    })();
  }, [namespaceLoaded]);

  return { namespaces, namespaceLoaded }
}