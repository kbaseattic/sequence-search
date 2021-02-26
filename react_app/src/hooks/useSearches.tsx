import { useEffect, useState } from 'react';
import { useLocalStorage } from '@rehooks/local-storage';
import { Search } from '../types/Search';
import { Namespace } from '../types/Namespace';
import { urlFor } from '../utils/urlFor';
import { parseFASTA } from '../utils/handleFASTA';
import { handleApiCall } from '../utils/handleApiCall';

const fetchStatuses = (ids: Search['id'][]) => handleApiCall({
  call: () => fetch(urlFor("/api/v1/jobs", {
    'jobIds': ids.join(",")
  })),
  handleResult: (searchStatus: Record<Search['id'], Search>) => {
    const newStatuses: Record<Search['id'], Search['status']> = {};
    for (const id in searchStatus) {
      newStatuses[id] = searchStatus[id].status
    }
    return newStatuses
  },
  errContext: "Failed to poll search status"
});

const fetchResult = (id: Search['id']) => handleApiCall({
  call: () => fetch(urlFor(`/api/v1/jobs/${id}`)),
  handleResult: (searchResult: Search['result']) => searchResult,
  errContext: `Failed to retrieve search result for ${id}`
});

export function useSearch() {
  const [searchIds, setSearchIds] = useLocalStorage<Search['id'][]>('searchIds', []);
  const [searchStatus, setSearchStatus] = useState<Record<Search['id'], Search['status']>>({});
  const [searchResults, setSearchResults] = useState<Record<Search['id'], Search['result']>>({});

  // Poll for search status changes
  const pendingSerialized = JSON.stringify(
    searchIds.filter(id => searchStatus[id] !== "completed")
  );
  useEffect(() => {
    const pending: string[] = JSON.parse(pendingSerialized);
    if (pending.length === 0) return;

    const poll = async () => {
      const next = await fetchStatuses(pending);
      setSearchStatus(prev => ({ ...prev, ...next }))
    };

    poll();
    const pollInterval = setInterval(poll, 15000);
    return () => clearInterval(pollInterval);
  }, [pendingSerialized]);

  // Fetch results for newly completed searches
  const completedSerialized = JSON.stringify(
    searchIds.filter(id => searchStatus[id] === "completed")
  );
  useEffect(() => {
    const completed: string[] = JSON.parse(completedSerialized);
    completed.forEach(async id => {
      const result = await fetchResult(id);
      setSearchResults(prev => ({
        ...prev,
        [id]: result
      }))
    })
  }, [completedSerialized]);

  const newSearch = (namespace: Namespace['id'], fasta: string, eVal: number) => handleApiCall({
    call: async () => fetch(urlFor(`/api/v1/namespaces/${namespace}/jobs`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sequences: await parseFASTA(fasta),
        params: {
          eValue: eVal
        }
      })
    }),
    handleResult: (search: Search) => {
      setSearchIds([search.id, ...searchIds])
      setSearchStatus(prev => ({ ...prev, [search.id]: search.status }))
    },
    errContext: `Failed to submit search`
  });

  const addSearchById = (id: Search['id']) => handleApiCall({
    call: () => fetch(urlFor(`/api/v1/jobs/${id}`)),
    handleResult: () => setSearchIds([id, ...searchIds]),
    errContext: `Failed to load search "${id}"`
  });

  function clearSearches() {
    setSearchIds([]);
  }

  const searches: Search[] = searchIds.map(id => ({
    id: id,
    status: searchStatus[id],
    result: searchResults[id]
  }))

  return { searches, newSearch, addSearchById, clearSearches }
}