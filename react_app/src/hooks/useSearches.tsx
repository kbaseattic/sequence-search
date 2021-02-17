import { useEffect, useState } from 'react';
import { notification } from 'antd';
import { useLocalStorage } from '@rehooks/local-storage';
import { Search } from '../types/Search';
import { Namespace } from '../types/Namespace';
import { urlFor } from '../utils/urlFor';
import { parseFASTA } from '../utils/handleFASTA';

async function fetchStatuses(ids: Search['id'][]) {
  try {
    const response = await fetch(urlFor("/api/v1/jobs", {
      'jobIds': ids.join(",")
    }));
    if (response.ok) {
      const searchStatus: Record<Search['id'], Search> = await response.json();
      const newStatuses: Record<Search['id'], Search['status']> = {};
      for (const id in searchStatus) {
        newStatuses[id] = searchStatus[id].status
      }
      return newStatuses
    } else {
      throw new Error(`Failed to poll search status, received ${response.status}: ${response.statusText}`);
    }
  } catch (err) {
    notification.open({
      message: 'Failed to poll search status',
      description: (err instanceof Error) ? err.message : JSON.stringify(err),
      type: 'error'
    });
  }
}

async function fetchResult(id: Search['id']) {
  try {
    const response = await fetch(urlFor(`/api/v1/jobs/${id}`));
    if (response.ok) {
      const result: Search['result'] = await response.json();
      return result
    } else {
      throw new Error(`Failed to retrieve search result for ${id}, received ${response.status}: ${response.statusText}`);
    }
  } catch (err) {
    notification.open({
      message: 'Failed to retrieve search result',
      description: (err instanceof Error) ? err.message : JSON.stringify(err),
      type: 'error'
    });
  }
}

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

  async function newSearch(namespace: Namespace['id'], fasta: string, eVal: number) {
    try {
      const response = await fetch(urlFor(`/api/v1/namespaces/${namespace}/jobs`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sequences: await parseFASTA(fasta)
        })
      });
      if (response.ok) {
        const search: Search = await response.json();
        setSearchIds([search.id, ...searchIds])
        setSearchStatus(prev => ({ ...prev, [search.id]: search.status }))
      } else {
        throw new Error(`Failed to submit search, received ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      notification.open({
        message: 'Failed to submit search',
        description: (err instanceof Error) ? err.message : JSON.stringify(err),
        type: 'error'
      });
    }
  }

  async function addSearchById(id: Search['id']) {
    try {
      const response = await fetch(urlFor(`/api/v1/jobs/${id}`));
      if (response.ok) {
        setSearchIds([id, ...searchIds])
      } else {
        let errorMsg = "";
        try {
          const error: { message: string } = await response.json();
          errorMsg = `"${error.message}"`
        } catch { }
        throw new Error(`Failed to find search, received ${response.status}: ${response.statusText} ${errorMsg}`);
      }
    } catch (err) {
      notification.open({
        message: 'Failed to find search',
        description: (err instanceof Error) ? err.message : JSON.stringify(err),
        type: 'error'
      });
    }
  }

  function clearSearches() {
    setSearchIds([]);
  }

  const searches: Search[] = searchIds.map(id => ({
    id: id,
    status: searchStatus[id],
    result: searchResults[id]
  }))

  console.log({ searches, newSearch, addSearchById, clearSearches })

  return { searches, newSearch, addSearchById, clearSearches }
}